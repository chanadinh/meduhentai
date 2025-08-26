import { connectToDatabase } from './mongodb';
import Manga from '@/models/Manga';
import Comment from '@/models/Comment';
import User from '@/models/User';

/**
 * Update user stats in real-time when manga stats change
 * This ensures user profile stats are always current
 */
export async function updateUserStats(userId: string) {
  try {
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

    // Update user stats in the database
    await User.findByIdAndUpdate(userId, {
      'stats.totalViews': totalViews[0]?.total || 0,
      'stats.totalLikes': totalLikes[0]?.total || 0,
      'stats.totalComments': totalComments[0]?.total || 0
    });

    return {
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments: totalComments[0]?.total || 0
    };
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
}

/**
 * Get user stats (either from cache or calculate fresh)
 */
export async function getUserStats(userId: string, forceRefresh: boolean = false) {
  try {
    await connectToDatabase();

    if (forceRefresh) {
      // Force refresh by recalculating
      return await updateUserStats(userId);
    }

    // Try to get from user document first
    const user = await User.findById(userId).select('stats');
    
    if (user?.stats) {
      return {
        totalViews: user.stats.totalViews || 0,
        totalLikes: user.stats.totalLikes || 0,
        totalComments: user.stats.totalComments || 0
      };
    }

    // If no stats found, calculate and update
    return await updateUserStats(userId);
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}
