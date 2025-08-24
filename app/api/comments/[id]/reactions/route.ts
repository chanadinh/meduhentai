import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Comment from '@/models/Comment';
import mongoose from 'mongoose';

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

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const isLiked = comment.likes.some(id => id.equals(userId));
    const isDisliked = comment.dislikes.some(id => id.equals(userId));

    if (reactionType === 'like') {
      if (isLiked) {
        // Remove like
        comment.likes = comment.likes.filter(id => !id.equals(userId));
      } else {
        // Add like and remove dislike if exists
        if (!comment.likes.some(id => id.equals(userId))) {
          comment.likes.push(userId);
        }
        comment.dislikes = comment.dislikes.filter(id => !id.equals(userId));
      }
    } else if (reactionType === 'dislike') {
      if (isDisliked) {
        // Remove dislike
        comment.dislikes = comment.dislikes.filter(id => !id.equals(userId));
      } else {
        // Add dislike and remove like if exists
        if (!comment.dislikes.some(id => id.equals(userId))) {
          comment.dislikes.push(userId);
        }
        comment.likes = comment.likes.filter(id => !id.equals(userId));
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
