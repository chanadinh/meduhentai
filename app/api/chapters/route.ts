import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
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
    console.log('Chapter creation request received');
    
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      console.log('No session or user ID');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('User authenticated:', {
      userId: session.user.id,
      username: session.user.username,
      role: session.user.role
    });

    // Check content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';
    let mangaId: string;
    let title: string;
    let chapterNumber: number;
    let volume: string;
    let pageFiles: File[];
    let uploadedPages: any[];
    let isJsonRequest = false;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData request (from upload page)
      console.log('Processing as FormData request');
      const formData = await request.formData();
      mangaId = formData.get('mangaId') as string;
      title = formData.get('title') as string;
      chapterNumber = parseInt(formData.get('chapterNumber') as string);
      volume = formData.get('volume') as string;
      pageFiles = formData.getAll('pages') as File[];
      uploadedPages = [];

      console.log('Form data received:', {
        mangaId,
        title,
        chapterNumber,
        volume,
        pageFilesCount: pageFiles.length,
        pageFilesInfo: pageFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        }))
      });
    } else if (contentType.includes('application/json')) {
      // Handle JSON request (from admin manage page)
      console.log('Processing as JSON request');
      const jsonData = await request.json();
      mangaId = jsonData.mangaId;
      title = jsonData.title;
      chapterNumber = parseInt(jsonData.chapterNumber);
      volume = jsonData.volume;
      pageFiles = [];
      uploadedPages = jsonData.pages || [];
      isJsonRequest = true;

      console.log('JSON data received:', {
        mangaId,
        title,
        chapterNumber,
        volume,
        uploadedPagesCount: uploadedPages.length,
        uploadedPages: uploadedPages
      });
    } else {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data or application/json' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!mangaId || !title || !chapterNumber) {
      console.log('Missing required fields:', {
        hasMangaId: !!mangaId,
        hasTitle: !!title,
        hasChapterNumber: !!chapterNumber
      });
      return NextResponse.json(
        { error: 'Missing required fields: mangaId, title, chapterNumber' },
        { status: 400 }
      );
    }

    // For FormData requests, validate page files
    if (!isJsonRequest && (!pageFiles || pageFiles.length === 0)) {
      console.log('No page files provided for FormData request');
      return NextResponse.json(
        { error: 'Pages are required for FormData requests' },
        { status: 400 }
      );
    }

    // For JSON requests, validate uploaded pages
    if (isJsonRequest && (!uploadedPages || uploadedPages.length === 0)) {
      console.log('No uploaded pages provided for JSON request');
      return NextResponse.json(
        { error: 'Uploaded pages are required for JSON requests' },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully');

    // Check if user owns the manga or is admin
    console.log('Checking manga ownership...');
    const manga = await Manga.findById(mangaId);
    if (!manga) {
      console.log('Manga not found:', mangaId);
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      );
    }

    console.log('Manga found:', {
      mangaId: manga._id,
      title: manga.title,
      ownerId: manga.userId,
      currentUserId: session.user.id
    });

    if (manga.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      console.log('User not authorized to create chapters for this manga');
      return NextResponse.json(
        { error: 'Unauthorized to create chapters for this manga' },
        { status: 403 }
      );
    }

    // Check if chapter number already exists for this manga
    console.log('Checking for existing chapter...');
    const existingChapter = await Chapter.findOne({
      manga: mangaId,
      chapterNumber: chapterNumber,
      isDeleted: { $ne: true }
    });

    if (existingChapter) {
      console.log('Chapter already exists:', {
        mangaId,
        chapterNumber,
        existingChapterId: existingChapter._id
      });
      return NextResponse.json(
        { error: `Chapter ${chapterNumber} already exists for this manga` },
        { status: 400 }
      );
    }

    console.log('No existing chapter found, proceeding with upload...');

    // Handle page images - either upload new files or use pre-uploaded URLs
    let finalUploadedPages: any[];
    
    if (isJsonRequest) {
      // Use pre-uploaded pages from JSON request
      console.log('Using pre-uploaded pages from JSON request');
      finalUploadedPages = uploadedPages.map((page, index) => ({
        pageNumber: index + 1,
        imageUrl: page.url || page.imageUrl,
        width: page.width || 800,
        height: page.height || 1200
      }));
      console.log('Pre-uploaded pages processed:', finalUploadedPages);
    } else {
      // Upload new page images to R2
      console.log(`Starting upload of ${pageFiles.length} page images for manga ${mangaId}`);
      finalUploadedPages = [];
      
      for (let i = 0; i < pageFiles.length; i++) {
        const file = pageFiles[i];
        
        try {
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
          
          finalUploadedPages.push({
            pageNumber: i + 1,
            imageUrl: uploadResult.url,
            width: 800,
            height: 1200
          });
        } catch (uploadError) {
          console.error(`Error uploading page ${i + 1}:`, uploadError);
          return NextResponse.json(
            { error: `Error uploading page ${i + 1}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
            { status: 500 }
          );
        }
      }
      
      console.log('All pages uploaded successfully');
    }

    console.log('All pages uploaded successfully, creating chapter...');

    // Create the chapter
    const chapter = new Chapter({
      manga: mangaId,
      title,
      chapterNumber,
      volume: volume || 1,
      pages: finalUploadedPages,
      userId: session.user.id
    });

    console.log('Chapter object created:', {
      manga: mangaId,
      title,
      chapterNumber,
      volume: volume || 1,
      pagesCount: finalUploadedPages.length,
      userId: session.user.id
    });

    await chapter.save();
    console.log('Chapter saved to database successfully:', chapter._id);

    // Update manga's chapter count
    console.log('Updating manga chapter count...');
    await Manga.findByIdAndUpdate(mangaId, {
      $inc: { chaptersCount: 1 }
    });
    console.log('Manga chapter count updated');

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
      { error: 'Không thể tạo chương', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
