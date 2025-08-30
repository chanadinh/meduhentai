import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Manga from '@/models/Manga';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get manga uploaded by the specific user
    const [mangas, total] = await Promise.all([
      Manga.find({ 
        userId: (await params).userId,
        isDeleted: { $ne: true } 
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title coverImage views chaptersCount createdAt updatedAt')
        .lean(),
      Manga.countDocuments({ 
        userId: (await params).userId,
        isDeleted: { $ne: true } 
      })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      mangas,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching user manga:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user manga' },
      { status: 500 }
    );
  }
}
