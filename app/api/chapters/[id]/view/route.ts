import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Chapter from '@/models/Chapter';

// POST - Increment chapter view count
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chapterId = params.id;

    if (!chapterId) {
      return NextResponse.json(
        { error: 'Chapter ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Increment view count without updating timestamps
    const result = await Chapter.updateOne(
      { _id: chapterId },
      { $inc: { views: 1 } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Get the updated chapter to return the new view count
    const chapter = await Chapter.findById(chapterId);

    return NextResponse.json({ 
      message: 'View count updated',
      views: chapter.views 
    });

  } catch (error) {
    console.error('Chapter view error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
