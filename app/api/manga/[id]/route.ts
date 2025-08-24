import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';
import Chapter from '@/models/Chapter';
import Notification from '@/models/Notification';

// GET - Fetch a specific manga by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mangaId = params.id;

    if (!mangaId) {
      return NextResponse.json(
        { error: 'Manga ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch manga details
    const manga = await Manga.findById(mangaId)
      .select('-isDeleted')
      .lean();

    if (!manga) {
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      );
    }

    // Fetch chapters for this manga
    const chapters = await Chapter.find({ 
      manga: mangaId,
      isDeleted: { $ne: true }
    })
      .select('title chapterNumber createdAt pages views')
      .sort({ chapterNumber: 1 })
      .lean();

    // Update views count
    await Manga.findByIdAndUpdate(mangaId, { $inc: { views: 1 } });

    return NextResponse.json({
      manga: {
        ...manga,
        chapters,
        chaptersCount: chapters.length
      }
    });

  } catch (error) {
    console.error('Manga GET error:', error);
    
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { error: 'Database configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update a specific manga by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mangaId = params.id;

    if (!mangaId) {
      return NextResponse.json(
        { error: 'Manga ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      title,
      description,
      author,
      artist,
      status,
      type,
      genres,
      coverImage
    } = body;

    // Validate required fields
    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    // Update the manga
    const updatedManga = await Manga.findByIdAndUpdate(
      mangaId,
      {
        title,
        description,
        author,
        artist,
        status,
        type,
        genres: genres || [],

        coverImage,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedManga) {
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Manga updated successfully',
      manga: updatedManga
    });

  } catch (error) {
    console.error('Manga PUT error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { error: 'Database configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific manga by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mangaId = params.id;

    if (!mangaId) {
      return NextResponse.json(
        { error: 'Manga ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if manga exists
    const manga = await Manga.findById(mangaId);
    if (!manga) {
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      );
    }

    // Soft delete the manga (set isDeleted flag instead of actually removing)
    const deletedManga = await Manga.findByIdAndUpdate(
      mangaId,
      { 
        isDeleted: true,
        deletedAt: new Date()
      },
      { new: true }
    );

    // Clean up related notifications
    try {
      await Notification.deleteMany({
        'data.mangaId': mangaId
      });
    } catch (notificationError) {
      // Log error but don't fail the manga deletion
      console.error('Failed to clean up notifications for deleted manga:', notificationError);
    }

    return NextResponse.json({
      message: 'Manga deleted successfully',
      manga: deletedManga
    });

  } catch (error) {
    console.error('Manga DELETE error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
          { error: 'Database configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
