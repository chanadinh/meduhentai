import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import MangaReaction from '@/models/MangaReaction';
import Manga from '@/models/Manga';
import { connectToDatabase } from '@/lib/mongodb';
import { updateUserStats } from '@/lib/user-stats';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { reaction } = await request.json();
    const mangaId = params.id;
    const userId = session.user.id;

    if (!['like', 'dislike'].includes(reaction)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    // Check if user already has a reaction for this manga
    const existingReaction = await MangaReaction.findOne({ userId, mangaId });

    if (existingReaction) {
      if (existingReaction.reaction === reaction) {
        // Remove reaction if clicking the same button
        await existingReaction.deleteOne();
        
        // Update manga counts
        await Manga.findByIdAndUpdate(mangaId, {
          $inc: { [reaction + 's']: -1 }
        });

        // Update user stats after manga stats change
        const manga = await Manga.findById(mangaId);
        if (manga?.userId) {
          await updateUserStats(manga.userId.toString());
        }

        return NextResponse.json({ 
          message: 'Reaction removed',
          action: 'removed',
          reaction: null
        });
      } else {
        // Change reaction from like to dislike or vice versa
        existingReaction.reaction = reaction;
        await existingReaction.save();

        // Update manga counts (decrease old reaction, increase new reaction)
        const oldReaction = existingReaction.reaction === 'like' ? 'dislike' : 'like';
        await Manga.findByIdAndUpdate(mangaId, {
          $inc: { 
            [oldReaction + 's']: -1,
            [reaction + 's']: 1
          }
        });

        // Update user stats after manga stats change
        const manga = await Manga.findById(mangaId);
        if (manga?.userId) {
          await updateUserStats(manga.userId.toString());
        }

        return NextResponse.json({ 
          message: 'Reaction updated',
          action: 'updated',
          reaction: reaction
        });
      }
    } else {
      // Create new reaction
      await MangaReaction.create({ userId, mangaId, reaction });

      // Update manga counts
      await Manga.findByIdAndUpdate(mangaId, {
        $inc: { [reaction + 's']: 1 }
      });

      // Update user stats after manga stats change
      const manga = await Manga.findById(mangaId);
      if (manga?.userId) {
        await updateUserStats(manga.userId.toString());
      }

      return NextResponse.json({ 
        message: 'Reaction added',
        action: 'added',
        reaction: reaction
      });
    }
  } catch (error) {
    console.error('Error handling manga reaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const mangaId = params.id;
    const userId = session.user.id;

    // Get user's reaction for this manga
    const userReaction = await MangaReaction.findOne({ userId, mangaId });
    
    // Get manga with current like/dislike counts
    const manga = await Manga.findById(mangaId).select('likes dislikes');

    return NextResponse.json({
      userReaction: userReaction?.reaction || null,
      likes: manga?.likes || 0,
      dislikes: manga?.dislikes || 0
    });
  } catch (error) {
    console.error('Error fetching manga reaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
