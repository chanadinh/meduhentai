import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type, userId, title, message, data } = await request.json();

    if (!type || !userId || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Don't create notification for the same user (unless it's a system notification)
    if (userId === session.user.id && type !== 'manga_comment') {
      return NextResponse.json({ message: 'Notification skipped for same user' });
    }

    // For manga_comment type, allow any authenticated user to create notifications for manga uploaders
    if (type === 'manga_comment') {
      // This is handled in the comments API, so we allow it here
    } else {
      // For other notification types, check if user is admin or creating for themselves
      const user = await User.findById(session.user.id).select('role');
      if (user?.role !== 'admin' && userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to create notifications for other users' },
          { status: 403 }
        );
      }
    }

    await connectToDatabase();

    // Check if notification already exists to avoid duplicates
    const existingNotification = await Notification.findOne({
      type,
      userId,
      'data.fromUser': data?.fromUser,
      'data.mangaId': data?.mangaId,
      'data.commentId': data?.commentId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    // For manga_comment type, also check if it's the same user commenting multiple times
    if (type === 'manga_comment') {
      const existingMangaCommentNotification = await Notification.findOne({
        type: 'manga_comment',
        userId,
        'data.fromUser': data?.fromUser,
        'data.mangaId': data?.mangaId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      
      if (existingMangaCommentNotification) {
        return NextResponse.json({ message: 'Notification already exists' });
      }
    } else if (existingNotification) {
      return NextResponse.json({ message: 'Notification already exists' });
    }

    // Create the notification
    const notification = await Notification.create({
      type,
      userId,
      title,
      message,
      data,
      isRead: false
    });

    return NextResponse.json({ notification }, { status: 201 });

  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
