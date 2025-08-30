import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Chapter from '@/models/Chapter';

// Create a simple ChapterReaction model structure
interface ChapterReaction {
  chapterId: string;
  userId: string;
  reaction: 'like' | 'dislike';
  createdAt: Date;
}

// In-memory storage for reactions (you can replace this with a proper database model later)
const reactions: ChapterReaction[] = [];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const chapterId = params.id;

    await connectToDatabase();

    // Get reaction counts
    const likes = reactions.filter(r => r.chapterId === chapterId && r.reaction === 'like').length;
    const dislikes = reactions.filter(r => r.chapterId === chapterId && r.reaction === 'dislike').length;

    // Get user's reaction if logged in
    let userReaction = null;
    if (session?.user?.id) {
      const userReactionObj = reactions.find(r => 
        r.chapterId === chapterId && r.userId === session.user.id
      );
      userReaction = userReactionObj?.reaction || null;
    }

    return NextResponse.json({
      likes,
      dislikes,
      userReaction
    });

  } catch (error) {
    console.error('Error fetching chapter reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để thích/không thích' },
        { status: 401 }
      );
    }

    const { reaction } = await request.json();
    const chapterId = params.id;
    const userId = session.user.id;

    if (!['like', 'dislike'].includes(reaction)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Find existing reaction
    const existingReactionIndex = reactions.findIndex(r => 
      r.chapterId === chapterId && r.userId === userId
    );

    let action = '';
    let message = '';

    if (existingReactionIndex !== -1) {
      const existingReaction = reactions[existingReactionIndex];
      
      if (existingReaction.reaction === reaction) {
        // Remove reaction if clicking the same button
        reactions.splice(existingReactionIndex, 1);
        action = 'removed';
        message = reaction === 'like' ? 'Đã bỏ thích' : 'Đã bỏ không thích';
      } else {
        // Update reaction if clicking different button
        reactions[existingReactionIndex].reaction = reaction;
        action = 'updated';
        message = reaction === 'like' ? 'Đã thích chương này' : 'Đã không thích chương này';
      }
    } else {
      // Add new reaction
      reactions.push({
        chapterId,
        userId,
        reaction,
        createdAt: new Date()
      });
      action = 'added';
      message = reaction === 'like' ? 'Đã thích chương này' : 'Đã không thích chương này';
    }

    // Calculate new counts
    const likes = reactions.filter(r => r.chapterId === chapterId && r.reaction === 'like').length;
    const dislikes = reactions.filter(r => r.chapterId === chapterId && r.reaction === 'dislike').length;

    // Get user's current reaction
    const userReactionObj = reactions.find(r => 
      r.chapterId === chapterId && r.userId === userId
    );
    const userReaction = userReactionObj?.reaction || null;

    return NextResponse.json({
      reaction: userReaction,
      likes,
      dislikes,
      action,
      message
    });

  } catch (error) {
    console.error('Error updating chapter reaction:', error);
    return NextResponse.json(
      { error: 'Failed to update reaction' },
      { status: 500 }
    );
  }
}
