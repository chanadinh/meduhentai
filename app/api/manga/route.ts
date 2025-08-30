import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';
import { getServerSession } from '@/lib/auth';
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
    let pipeline: any[] = [];
    
    switch (sortBy) {
      case 'views':
        sortObject = { views: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'popular':
        sortObject = { likes: sortOrder === 'desc' ? -1 : 1, views: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'lastUpdated':
        // Use aggregation pipeline to sort by latest chapter creation time
        pipeline = [
          { $match: { isDeleted: { $ne: true } } },
          {
            $lookup: {
              from: 'chapters',
              localField: '_id',
              foreignField: 'manga',
              as: 'chapters',
              pipeline: [
                { $match: { isDeleted: { $ne: true } } },
                { $sort: { createdAt: -1 } }, // Use createdAt (chapter creation time) instead of updatedAt
                { $limit: 1 }
              ]
            }
          },
          {
            $addFields: {
              latestChapterUpdate: {
                $ifNull: [
                  { $arrayElemAt: ['$chapters.createdAt', 0] }, // Use createdAt for chapter creation time
                  new Date(0) // Default to epoch if no chapters
                ]
              }
            }
          },
          { $sort: { latestChapterUpdate: sortOrder === 'desc' ? -1 : 1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              title: 1,
              coverImage: 1,
              views: 1,
              chaptersCount: 1,
              createdAt: 1,
              updatedAt: 1,
              genres: 1,
              description: 1,
              author: 1,
              likes: 1,
              latestChapterUpdate: 1, // Include the latest chapter update time
              latestChapter: { $arrayElemAt: ['$chapters', 0] }
            }
          }
        ];
        break;
      case 'latestChapter':
        // Use aggregation pipeline to sort by latest chapter creation time
        pipeline = [
          { $match: { isDeleted: { $ne: true } } },
          {
            $lookup: {
              from: 'chapters',
              localField: '_id',
              foreignField: 'manga',
              as: 'chapters',
              pipeline: [
                { $match: { isDeleted: { $ne: true } } },
                { $sort: { createdAt: -1 } }, // Use createdAt (chapter creation time) instead of updatedAt
                { $limit: 1 }
              ]
            }
          },
          {
            $addFields: {
              latestChapterUpdate: {
                $ifNull: [
                  { $arrayElemAt: ['$chapters.createdAt', 0] }, // Use createdAt for chapter creation time
                  new Date(0) // Default to epoch if no chapters
                ]
              }
            }
          },
          { $sort: { latestChapterUpdate: sortOrder === 'desc' ? -1 : 1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              title: 1,
              coverImage: 1,
              views: 1,
              chaptersCount: 1,
              createdAt: 1,
              updatedAt: 1,
              genres: 1,
              description: 1,
              author: 1,
              likes: 1,
              latestChapterUpdate: 1, // Include the latest chapter update time
              latestChapter: { $arrayElemAt: ['$chapters', 0] }
            }
          }
        ];
        break;
      case 'createdAt':
      default:
        sortObject = { createdAt: sortOrder === 'desc' ? -1 : 1 };
        break;
    }

    let mangas: any[] = [];
    let total: number = 0;

    if (sortBy === 'latestChapter' || sortBy === 'lastUpdated') {
      // Use aggregation pipeline for latest chapter sorting (both cases now use the same logic)
      const [mangaResults, totalResult] = await Promise.all([
        Manga.aggregate(pipeline),
        Manga.countDocuments({ isDeleted: { $ne: true } })
      ]);
      

      
      mangas = mangaResults;
      total = totalResult;
    } else {
      // Add secondary sort by createdAt for consistency
      if (sortBy !== 'createdAt') {
        sortObject.createdAt = -1;
      }
      
      // Use regular find for other sort methods
      const [mangaResults, totalResult] = await Promise.all([
        Manga.find({ isDeleted: { $ne: true } })
          .sort(sortObject)
          .skip(skip)
          .limit(limit)
          .select('title coverImage views chaptersCount createdAt updatedAt genres description author likes')
          .lean(),
        Manga.countDocuments({ isDeleted: { $ne: true } })
      ]);
      mangas = mangaResults;
      total = totalResult;
    }

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
    const session = await getServerSession();
    
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

    // Debug request details
    console.log('Request details:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      contentType: request.headers.get('content-type'),
      contentLength: request.headers.get('content-length')
    });

    // Check content type first to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';
    let formData;
    let coverImage;
    let dataString;
    let isJsonRequest = false;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData request (from upload page)
      try {
        formData = await request.formData();
        coverImage = formData.get('coverImage') as File;
        dataString = formData.get('data') as string;
        console.log('Processing as FormData request');
      } catch (formDataError) {
        console.error('FormData parsing failed:', formDataError);
        return NextResponse.json(
          { error: 'Failed to parse FormData request' },
          { status: 400 }
        );
      }
    } else if (contentType.includes('application/json')) {
      // Handle JSON request (from admin manage page)
      try {
        const jsonData = await request.json();
        console.log('Parsed as JSON:', jsonData);
        
        // Check if this is a valid manga creation request
        if (jsonData.title && jsonData.author && jsonData.coverImage) {
          isJsonRequest = true;
          coverImage = null; // No file to upload
          dataString = JSON.stringify(jsonData);
          console.log('Processing as JSON request with pre-uploaded image');
        } else {
          return NextResponse.json(
            { error: 'Invalid JSON request. Must include title, author, and coverImage URL' },
            { status: 400 }
          );
        }
      } catch (jsonError) {
        console.error('JSON parsing failed:', jsonError);
        return NextResponse.json(
          { error: 'Failed to parse JSON request' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data or application/json' },
        { status: 400 }
      );
    }
    
    console.log('Received form data:', {
      hasCoverImage: !!coverImage,
      coverImageSize: coverImage?.size,
      coverImageType: coverImage?.type,
      coverImageName: coverImage?.name,
      hasData: !!dataString,
      dataLength: dataString?.length
    });
    
    // Handle cover image - either upload new file or use pre-uploaded URL
    let coverImageUrl: string;
    
    if (coverImage && !isJsonRequest) {
      // Validate file size (max 10MB) - only for FormData requests
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (coverImage.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size too large. Maximum allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(coverImage.type)) {
        return NextResponse.json(
          { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
          { status: 400 }
        );
      }
      
      // Upload new cover image to R2
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = coverImage?.name.split('.').pop(); // Use optional chaining
      const filename = `manga-covers/${timestamp}-${randomString}.${extension}`;
      
      console.log('Uploading cover image:', {
        filename,
        size: coverImage?.size, // Use optional chaining
        type: coverImage?.type // Use optional chaining
      });
      
      // Convert file to buffer
      const buffer = await coverImage?.arrayBuffer(); // Use optional chaining
      
      // Upload to R2
      const uploadResult = await uploadImage(filename, Buffer.from(buffer), coverImage?.type); // Use optional chaining
      
      if (!uploadResult.success) {
        console.error('Cover image upload failed:', uploadResult.error);
        return NextResponse.json(
          { error: `Failed to upload cover image: ${uploadResult.error}` },
          { status: 500 }
        );
      }
      
      console.log('Cover image uploaded successfully:', uploadResult.url);
      coverImageUrl = uploadResult.url;
    } else if (isJsonRequest) {
      // Use pre-uploaded image URL from JSON request
      const parsedData = JSON.parse(dataString);
      coverImageUrl = parsedData.coverImage;
      console.log('Using pre-uploaded image URL:', coverImageUrl);
    } else {
      return NextResponse.json(
        { error: 'No cover image provided' },
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

    // Add the user ID and cover image URL to the manga data
    const newManga = new Manga({
      ...mangaData,
      userId: session.user.id,
      coverImage: coverImageUrl
    });

    console.log('Attempting to save manga:', {
      title: newManga.title,
      author: newManga.author,
      userId: newManga.userId,
      coverImage: newManga.coverImage
    });

    const savedManga = await newManga.save();
    console.log('Manga saved successfully:', savedManga._id);

    return NextResponse.json({ 
      message: 'Manga created successfully',
      manga: savedManga 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating manga:', error);
    
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        console.error('MongoDB validation error:', error.message);
        return NextResponse.json(
          { error: 'Validation error', details: error.message },
          { status: 400 }
        );
      }
      
      if (error.name === 'MongoServerError') {
        console.error('MongoDB server error:', error.message);
        return NextResponse.json(
          { error: 'Database error', details: error.message },
          { status: 500 }
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
      { error: 'Không thể tạo manga', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
