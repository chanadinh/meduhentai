import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Fetch all tags with usage counts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

// POST - Add new tag or genre
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, type, description } = await request.json();

    if (!name || !type || !['tag', 'genre'].includes(type)) {
      return NextResponse.json(
        { error: 'Name and type (tag or genre) are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if tag/genre already exists
    const existingTag = await Manga.findOne({
      $or: [
        { tags: { $in: [name] } },
        { genres: { $in: [name] } }
      ]
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag or genre already exists' },
        { status: 409 }
      );
    }

    // For now, we'll just return success since tags are stored in manga documents
    // In a real implementation, you might want to create a separate Tags collection
    return NextResponse.json({
      message: 'Tag added successfully',
      tag: { name, type, description }
    });

  } catch (error) {
    console.error('Tags POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove tag or genre
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const type = searchParams.get('type');

    if (!name || !type || !['tag', 'genre'].includes(type)) {
      return NextResponse.json(
        { error: 'Name and type (tag or genre) are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Remove tag/genre from all manga documents
    const field = type === 'tag' ? 'tags' : 'genres';
    const result = await Manga.updateMany(
      { [field]: name },
      { $pull: { [field]: name } }
    );

    return NextResponse.json({
      message: 'Tag removed successfully',
      removedFrom: result.modifiedCount
    });

  } catch (error) {
    console.error('Tags DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
