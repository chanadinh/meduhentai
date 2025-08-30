import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Comment from '@/models/Comment';
import User from '@/models/User';
import Manga from '@/models/Manga';
import Notification from '@/models/Notification';


// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Fetch comments for a specific manga/chapter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mangaId = searchParams.get('mangaId');
    const chapterId = searchParams.get('chapterId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'recent';

    if (!mangaId) {
      return NextResponse.json(
        { error: 'Manga ID is required' },
        { status: 400 }
      );
    }

    // Validate that mangaId is a valid ObjectId
    if (!mangaId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid manga ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const skip = (page - 1) * limit;

    // Build query based on whether we're fetching manga-level or chapter-level comments
    const query: any = {
      manga: mangaId,
      parentComment: null,
      isDeleted: false
    };

    // Always fetch all comments for the manga (both manga-level and chapter-level)
    // Remove chapter filter to get all comments
    delete query.chapter;

    // Build sort object
    let sortObject: any = {};
    switch (sortBy) {
      case 'liked':
        sortObject = { 'likes.length': -1, createdAt: -1 };
        break;
      case 'disliked':
        sortObject = { 'dislikes.length': -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortObject = { createdAt: -1 };
        break;
    }

    // Fetch top-level comments (no parent comment)
    const [comments, totalComments] = await Promise.all([
      Comment.find(query)
        .populate('user', 'username avatar role')
        .populate({
          path: 'replies',
          populate: {
            path: 'user',
            select: 'username avatar role'
          },
          select: 'user content createdAt isDeleted likes dislikes'
        })
        .populate('likes', 'username')
        .populate('dislikes', 'username')
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalComments / limit);

    return NextResponse.json({
      comments,
      totalComments,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Comments GET error:', error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { error: 'Database configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 500 }
        );
      }
      if (error.message.includes('populate')) {
        return NextResponse.json(
          { error: 'Data population error' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, mangaId, chapterId, parentComment } = await request.json();

    if (!content || !mangaId) {
      return NextResponse.json(
        { error: 'Content and manga ID are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create the comment
    const commentData: any = {
      content: content.trim(),
      user: session.user.id,
      manga: mangaId,
      isDeleted: false
    };

    if (chapterId) {
      commentData.chapter = chapterId;
    }

    if (parentComment) {
      commentData.parentComment = parentComment;
    }

    const comment = await Comment.create(commentData);

    // Populate user information
    await comment.populate('user', 'username avatar role');

    // If this is a reply, add it to the parent comment's replies array
    if (parentComment) {
      await Comment.findByIdAndUpdate(
        parentComment,
        { $push: { replies: comment._id } }
      );
      
      // Send notification to parent comment owner (if commenter is not the owner)
      try {
        const parentCommentDoc = await Comment.findById(parentComment).select('user');
        if (parentCommentDoc && parentCommentDoc.user.toString() !== session.user.id) {
          // Get commenter info for the notification
          const commenter = await User.findById(session.user.id).select('username');
          
          if (commenter) {
            // Create notification for parent comment owner
            await Notification.create({
              userId: parentCommentDoc.user,
              type: 'comment_reply',
              title: 'Phản hồi mới',
              message: `${commenter.username} đã phản hồi bình luận của bạn`,
              data: {
                mangaId: mangaId,
                chapterId: chapterId || undefined,
                commentId: comment._id,
                fromUser: session.user.id
              },
              isRead: false
            });
          }
        }
      } catch (replyNotificationError) {
        // Log error but don't fail the comment creation
        console.error('Failed to create reply notification:', replyNotificationError);
      }
    }

    // Send notification to manga uploader (if commenter is not the uploader)
    try {
      const manga = await Manga.findById(mangaId).select('userId title');
      if (manga && manga.userId.toString() !== session.user.id) {
        // Get commenter info for the notification
        const commenter = await User.findById(session.user.id).select('username');
        
        if (commenter) {
          // Create notification for manga uploader
          await Notification.create({
            userId: manga.userId,
            type: 'manga_comment',
            title: 'Bình luận mới trên manga của bạn',
            message: `${commenter.username} đã bình luận trên manga "${manga.title}"`,
            data: {
              mangaId: manga._id,
              chapterId: chapterId || undefined,
              commentId: comment._id,
              fromUser: session.user.id
            },
            isRead: false
          });
        }
      }
    } catch (notificationError) {
      // Log error but don't fail the comment creation
      console.error('Failed to create notification for manga uploader:', notificationError);
    }



    return NextResponse.json({ comment }, { status: 201 });

  } catch (error) {
    console.error('Comments POST error:', error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { error: 'Database configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 500 }
        );
      }
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Validation error', details: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
