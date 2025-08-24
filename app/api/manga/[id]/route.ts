import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';
import Chapter from '@/models/Chapter';

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
