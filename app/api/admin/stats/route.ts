import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';
import Chapter from '@/models/Chapter';
import User from '@/models/User';
import Comment from '@/models/Comment';

// GET - Fetch admin statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Fetch counts in parallel
    const [totalManga, totalChapters, totalUsers, totalComments] = await Promise.all([
      Manga.countDocuments({ isDeleted: { $ne: true } }),
      Chapter.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ isDeleted: { $ne: true } }),
      Comment.countDocuments({ isDeleted: { $ne: true } })
    ]);

    return NextResponse.json({
      stats: {
        totalManga,
        totalChapters,
        totalUsers,
        totalComments
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
