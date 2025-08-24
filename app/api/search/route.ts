import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'title';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    if (!query.trim()) {
      return NextResponse.json({ 
        mangas: [], 
        totalPages: 0, 
        currentPage: page,
        totalResults: 0 
      });
    }

    // Create search regex for case-insensitive search
    const searchRegex = new RegExp(query, 'i');
    
    // Build search query
    const searchQuery = {
      $or: [
        { title: searchRegex },
        { author: searchRegex },
        { genres: { $in: [searchRegex] } },
        { tags: { $in: [searchRegex] } },
        { description: searchRegex }
      ]
    };

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute search with pagination
    const [mangas, totalResults] = await Promise.all([
      Manga.find(searchQuery)
        .sort(sortObject)
        .skip(skip)
        .limit(limit)
        .select('title author coverImage rating views totalChapters type genres tags createdAt')
        .lean(),
      Manga.countDocuments(searchQuery)
    ]);

    const totalPages = Math.ceil(totalResults / limit);

    return NextResponse.json({
      mangas,
      totalPages,
      currentPage: page,
      totalResults,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Search error:', error);
    
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
      if (error.message.includes('Manga')) {
        return NextResponse.json(
          { error: 'Manga model error' },
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
