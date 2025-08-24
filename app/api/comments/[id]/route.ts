import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Comment from '@/models/Comment';

// PUT - Update a comment
export async function PUT(
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

    const { content } = await request.json();
    const commentId = params.id;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the comment and check permissions
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update the comment
    comment.content = content.trim();
    comment.isEdited = true;
    await comment.save();

    // Populate user information
    await comment.populate('user', 'username avatar role');

    return NextResponse.json({ comment });

  } catch (error) {
    console.error('Comment PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment (soft delete)
export async function DELETE(
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

    const commentId = params.id;

    await connectToDatabase();

    // Find the comment and check permissions
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    if (comment.user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 400 }
      );
    }

    // Soft delete the comment
    comment.isDeleted = true;
    await comment.save();

    return NextResponse.json({ message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Comment DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
