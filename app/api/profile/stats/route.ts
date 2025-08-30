import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';
import Comment from '@/models/Comment';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Fetch user statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userId = session.user.id;

    // Calculate total views from user's manga
    const totalViews = await Manga.aggregate([
      { $match: { userId: userId, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    // Calculate total likes from user's manga
    const totalLikes = await Manga.aggregate([
      { $match: { userId: userId, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);

    // Calculate total comments from user's manga
    const totalComments = await Comment.aggregate([
      { $match: { userId: userId, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    // Get the actual values or default to 0
    const stats = {
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments: totalComments[0]?.total || 0
    };

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Profile stats GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
