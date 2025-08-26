import { connectToDatabase } from './mongodb';
import Manga from '@/models/Manga';
import Comment from '@/models/Comment';
import MangaReaction from '@/models/MangaReaction';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * Calculate user stats directly from manga data and update User model
 * Simple aggregation - always accurate and up-to-date
 */
export async function calculateUserStats(userId: string) {
  try {
    await connectToDatabase();

    // Validate and convert string userId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId format:', userId);
      throw new Error('Invalid user ID format');
    }
    
    const userIdObjectId = new mongoose.Types.ObjectId(userId);
    
    console.log('Calculating stats for userId:', userId);
    console.log('Converted to ObjectId:', userIdObjectId);

    // First, let's check what manga this user has
    const userManga = await Manga.find({ userId: userIdObjectId, isDeleted: { $ne: true } });
    console.log('User manga count:', userManga.length);
    
    if (userManga.length > 0) {
      console.log('User manga sample:', userManga.slice(0, 3).map(m => ({ 
        id: m._id, 
        title: m.title, 
        views: m.views, 
        likes: m.likes, 
        userId: m.userId,
        userIdType: typeof m.userId,
        isObjectId: m.userId instanceof mongoose.Types.ObjectId
      })));
    } else {
      console.log('No manga found for this user');
    }

    // Calculate total views from all manga uploaded by this user
    const totalViews = await Manga.aggregate([
      { $match: { userId: userIdObjectId, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    // Calculate total likes from all manga uploaded by this user
    const totalLikes = await Manga.aggregate([
      { $match: { userId: userIdObjectId, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);

    // Alternative: Calculate total likes from MangaReaction collection
    const totalLikesFromReactions = await MangaReaction.aggregate([
      { $match: { reaction: 'like' } },
      { $lookup: { from: 'mangas', localField: 'mangaId', foreignField: '_id', as: 'manga' } },
      { $match: { 'manga.userId': userIdObjectId, 'manga.isDeleted': { $ne: true } } },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    // Calculate total comments on manga uploaded by this user
    const totalComments = await Comment.aggregate([
      { $match: { manga: { $in: await Manga.find({ userId: userIdObjectId, isDeleted: { $ne: true } }).distinct('_id') } } },
      { $group: { _id: null, total: { $sum: 1 } } }
    ]);

    const stats = {
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments: totalComments[0]?.total || 0
    };

    const statsFromReactions = {
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikesFromReactions[0]?.total || 0,
      totalComments: totalComments[0]?.total || 0
    };

    console.log('Stats from manga fields:', stats);
    console.log('Stats from reactions collection:', statsFromReactions);

    // Final calculated stats (using reactions collection for likes)
    const finalStats = {
      totalViews: stats.totalViews,
      totalLikes: statsFromReactions.totalLikes,
      totalComments: stats.totalComments
    };

    // Update the User model with the calculated stats
    try {
      await User.findByIdAndUpdate(userIdObjectId, {
        $set: {
          'stats.totalViews': finalStats.totalViews,
          'stats.totalLikes': finalStats.totalLikes,
          'stats.totalComments': finalStats.totalComments
        }
      });
    } catch (updateError) {
      console.error('Error updating user stats in database:', updateError);
      // Don't throw here - we still want to return the calculated stats
    }

    return finalStats;
  } catch (error) {
    console.error('Error calculating user stats:', error);
    throw error;
  }
}

/**
 * Get user stats (always fresh calculation and database update)
 */
export async function getUserStats(userId: string) {
  return await calculateUserStats(userId);
}
