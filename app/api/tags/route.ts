import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Fetch all tags and genres with usage counts (public endpoint)
export async function GET() {
  try {
    await connectToDatabase();

    // Aggregate to get all unique tags and their counts
    const tagsData = await Manga.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Also get genres
    const genresData = await Manga.aggregate([
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const tags = tagsData.map(tag => ({
      _id: tag._id,
      name: tag._id,
      type: 'tag',
      count: tag.count
    }));

    const genres = genresData.map(genre => ({
      _id: genre._id,
      name: genre._id,
      type: 'genre',
      count: genre.count
    }));

    return NextResponse.json({
      tags: [...tags, ...genres],
      totalTags: tags.length,
      totalGenres: genres.length
    });

  } catch (error) {
    console.error('Tags GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
