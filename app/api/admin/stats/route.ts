import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';
import Chapter from '@/models/Chapter';
import User from '@/models/User';
import Comment from '@/models/Comment';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Fetch admin statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Fetch counts and recent activity in parallel
    const [totalManga, totalChapters, totalUsers, totalComments, recentChapter, recentUser] = await Promise.all([
      Manga.countDocuments({ isDeleted: { $ne: true } }),
      Chapter.countDocuments({ isDeleted: { $ne: true } }),
      User.countDocuments({ isDeleted: { $ne: true } }),
      Comment.countDocuments({ isDeleted: { $ne: true } }),
      Chapter.findOne({ isDeleted: { $ne: true } }, { updatedAt: 1 }).sort({ updatedAt: -1 }),
      User.findOne({ isDeleted: { $ne: true } }, { createdAt: 1 }).sort({ createdAt: -1 })
    ]);

    return NextResponse.json({
      stats: {
        totalManga,
        totalChapters,
        totalUsers,
        totalComments,
        recentChapter: recentChapter?.updatedAt?.toISOString(),
        recentUser: recentUser?.createdAt?.toISOString()
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
