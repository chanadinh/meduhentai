import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Manga from '@/models/Manga';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get manga uploaded by the current user
    const [mangas, total] = await Promise.all([
      Manga.find({ 
        userId: session.user.id,
        isDeleted: { $ne: true } 
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('title coverImage rating views chaptersCount createdAt updatedAt')
        .lean(),
      Manga.countDocuments({ 
        userId: session.user.id,
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
    console.error('Error fetching my manga:', error);
    return NextResponse.json(
      { error: 'Failed to fetch my manga' },
      { status: 500 }
    );
  }
}
