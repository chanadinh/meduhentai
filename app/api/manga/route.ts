import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
        .select('title coverImage views chaptersCount createdAt updatedAt genres')
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

    const mangaData = await request.json();
    
    // Add the user ID to the manga data
    const newManga = new Manga({
      ...mangaData,
      userId: session.user.id
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
    }
    
    return NextResponse.json(
      { error: 'Failed to create manga' },
      { status: 500 }
    );
  }
}
