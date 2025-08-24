import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Comment from '@/models/Comment';

// POST - Add/remove like or dislike
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reactionType } = await request.json();
    const commentId = params.id;

    if (!reactionType || !['like', 'dislike'].includes(reactionType)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const isLiked = comment.likes.includes(userId);
    const isDisliked = comment.dislikes.includes(userId);

    if (reactionType === 'like') {
      if (isLiked) {
        // Remove like
        comment.likes = comment.likes.filter(id => id.toString() !== userId);
      } else {
        // Add like and remove dislike if exists
        if (!comment.likes.includes(userId)) {
          comment.likes.push(userId);
        }
        comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId);
      }
    } else if (reactionType === 'dislike') {
      if (isDisliked) {
        // Remove dislike
        comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId);
      } else {
        // Add dislike and remove like if exists
        if (!comment.dislikes.includes(userId)) {
          comment.dislikes.push(userId);
        }
        comment.likes = comment.likes.filter(id => id.toString() !== userId);
      }
    }

    await comment.save();

    return NextResponse.json({
      likes: comment.likes,
      dislikes: comment.dislikes
    });

  } catch (error) {
    console.error('Comment reaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
