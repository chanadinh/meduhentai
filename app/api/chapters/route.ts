import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import Manga from '@/models/Manga';
import { uploadImage } from '@/lib/r2';

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

    // Parse FormData instead of JSON
    const formData = await request.formData();
    const mangaId = formData.get('mangaId') as string;
    const title = formData.get('title') as string;
    const chapterNumber = parseInt(formData.get('chapterNumber') as string);
    const volume = formData.get('volume') as string;
    const pageFiles = formData.getAll('pages') as File[];

    // Validate required fields
    if (!mangaId || !title || !chapterNumber || !pageFiles || pageFiles.length === 0) {
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

    // Upload page images to R2
    const uploadedPages = [];
    
    console.log(`Starting upload of ${pageFiles.length} page images for manga ${mangaId}`);
    
    for (let i = 0; i < pageFiles.length; i++) {
      const file = pageFiles[i];
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `chapters/${mangaId}/${timestamp}-${randomString}-${i + 1}.${extension}`;
      
      console.log(`Uploading page ${i + 1}: ${filename} (${file.size} bytes, ${file.type})`);
      
      // Convert file to buffer
      const buffer = await file.arrayBuffer();
      
      // Upload to R2
      const uploadResult = await uploadImage(filename, Buffer.from(buffer), file.type);
      
      if (!uploadResult.success) {
        console.error(`Failed to upload page ${i + 1}:`, uploadResult.error);
        return NextResponse.json(
          { error: `Failed to upload page ${i + 1}: ${uploadResult.error}` },
          { status: 500 }
        );
      }
      
      console.log(`Page ${i + 1} uploaded successfully: ${uploadResult.url}`);
      
      uploadedPages.push({
        pageNumber: i + 1,
        imageUrl: uploadResult.url,
        width: 800,
        height: 1200
      });
    }

    // Create the chapter
    const chapter = new Chapter({
      manga: mangaId,
      title,
      chapterNumber,
      volume: volume || 1,
      pages: uploadedPages,
      userId: session.user.id
    });

    console.log('Creating chapter with data:', {
      manga: mangaId,
      title,
      chapterNumber,
      volume: volume || 1,
      pagesCount: uploadedPages.length,
      userId: session.user.id
    });

    await chapter.save();
    console.log('Chapter created successfully:', chapter._id);

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
    
    if (error instanceof Error) {
      // Log more details for debugging
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to create chapter', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
