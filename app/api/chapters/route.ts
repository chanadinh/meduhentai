import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import Manga from '@/models/Manga';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Fetch chapters for a manga
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mangaId = searchParams.get('mangaId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!mangaId) {
      return NextResponse.json(
        { error: 'Manga ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const skip = (page - 1) * limit;

    // Fetch chapters for the manga
    const [chapters, total] = await Promise.all([
      Chapter.find({ 
        manga: mangaId,
        isDeleted: { $ne: true } 
      })
        .sort({ chapterNumber: 1 })
        .skip(skip)
        .limit(limit)
        .select('title chapterNumber volume pages createdAt updatedAt')
        .lean(),
      Chapter.countDocuments({ 
        manga: mangaId,
        isDeleted: { $ne: true } 
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      chapters,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Chapters GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}

// POST - Create a new chapter
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mangaId, title, chapterNumber, volume, pages } = body;

    // Validate required fields
    if (!mangaId || !title || !chapterNumber || !pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'Missing required fields: mangaId, title, chapterNumber, pages' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user owns the manga or is admin
    const manga = await Manga.findById(mangaId);
    if (!manga) {
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      );
    }

    if (manga.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to create chapters for this manga' },
        { status: 403 }
      );
    }

    // Check if chapter number already exists for this manga
    const existingChapter = await Chapter.findOne({
      manga: mangaId,
      chapterNumber: chapterNumber,
      isDeleted: { $ne: true }
    });

    if (existingChapter) {
      return NextResponse.json(
        { error: `Chapter ${chapterNumber} already exists for this manga` },
        { status: 400 }
      );
    }

    // Create the chapter
    const chapter = new Chapter({
      manga: mangaId,
      title,
      chapterNumber,
      volume: volume || 1,
      pages: pages.map((page: any, index: number) => ({
        pageNumber: page.pageNumber || index + 1,
        imageUrl: page.imageUrl,
        width: page.width || 800,
        height: page.height || 1200
      })),
      userId: session.user.id
    });

    await chapter.save();

    // Update manga's chapter count
    await Manga.findByIdAndUpdate(mangaId, {
      $inc: { chaptersCount: 1 }
    });

    return NextResponse.json({
      message: 'Chapter created successfully',
      chapter: {
        _id: chapter._id,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber,
        volume: chapter.volume,
        pagesCount: chapter.pages.length
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Chapters POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create chapter' },
      { status: 500 }
    );
  }
}
