import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';
import Chapter from '@/models/Chapter';
import Comment from '@/models/Comment';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Fetch user statistics by userId
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Calculate total views from all manga uploaded by this user
    const totalViews = await Manga.aggregate([
      { $match: { userId: userId, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    // Calculate total likes from all manga uploaded by this user
    const totalLikes = await Manga.aggregate([
      { $match: { userId: userId, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);

    // Calculate total comments on manga uploaded by this user
    const totalComments = await Comment.aggregate([
      { $match: { manga: { $in: await Manga.find({ userId: userId, isDeleted: { $ne: true } }).distinct('_id') } } },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

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
