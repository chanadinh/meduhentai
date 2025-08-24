import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadImage } from '@/lib/r2';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build sort object
    let sortObject: any = {};
    switch (sortBy) {

      case 'views':
        sortObject = { views: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'popular':
        sortObject = { likes: sortOrder === 'desc' ? -1 : 1, views: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'lastUpdated':
        sortObject = { updatedAt: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'createdAt':
      default:
        sortObject = { createdAt: sortOrder === 'desc' ? -1 : 1 };
        break;
    }

    // Add secondary sort by createdAt for consistency
    if (sortBy !== 'createdAt') {
      sortObject.createdAt = -1;
    }

    const [mangas, total] = await Promise.all([
      Manga.find({ isDeleted: { $ne: true } })
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .select('title coverImage views chaptersCount createdAt updatedAt genres description author likes')
        .lean(),
      Manga.countDocuments({ isDeleted: { $ne: true } })
    ]);

    const hasNextPage = skip + limit < total;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      mangas,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage,
        hasPreviousPage
      }
    });

  } catch (error) {
    console.error('Error fetching manga:', error);
    return NextResponse.json(
      { error: 'Failed to fetch manga' },
      { status: 500 }
    );
  }
}

// POST - Create a new manga
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has uploader or admin role
    if (session.user.role !== 'uploader' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Only uploaders and admins can create manga.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    // Parse FormData instead of JSON
    const formData = await request.formData();
    const coverImage = formData.get('coverImage') as File;
    const dataString = formData.get('data') as string;
    
    if (!coverImage) {
      return NextResponse.json(
        { error: 'Cover image is required' },
        { status: 400 }
      );
    }

    if (!dataString) {
      return NextResponse.json(
        { error: 'Manga data is required' },
        { status: 400 }
      );
    }

    // Parse the manga data
    let mangaData;
    try {
      mangaData = JSON.parse(dataString);
      console.log('Parsed manga data:', mangaData);
    } catch (parseError) {
      console.error('Failed to parse manga data:', parseError);
      return NextResponse.json(
        { error: 'Invalid manga data format' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!mangaData.title || !mangaData.author) {
      console.error('Missing required fields:', { title: mangaData.title, author: mangaData.author });
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    // Upload cover image to R2
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = coverImage.name.split('.').pop();
    const filename = `manga-covers/${timestamp}-${randomString}.${extension}`;
    
    console.log('Uploading cover image:', {
      filename,
      size: coverImage.size,
      type: coverImage.type
    });
    
    // Convert file to buffer
    const buffer = await coverImage.arrayBuffer();
    
    // Upload to R2
    const uploadResult = await uploadImage(filename, Buffer.from(buffer), coverImage.type);
    
    if (!uploadResult.success) {
      console.error('Cover image upload failed:', uploadResult.error);
      return NextResponse.json(
        { error: `Failed to upload cover image: ${uploadResult.error}` },
        { status: 500 }
      );
    }
    
    console.log('Cover image uploaded successfully:', uploadResult.url);
    
    // Add the user ID and cover image URL to the manga data
    const newManga = new Manga({
      ...mangaData,
      userId: session.user.id,
      coverImage: uploadResult.url
    });

    const savedManga = await newManga.save();

    return NextResponse.json({ 
      message: 'Manga created successfully',
      manga: savedManga 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating manga:', error);
    
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Validation error', details: error.message },
          { status: 400 }
        );
      }
      
      // Log more details for debugging
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to create manga', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
