import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: chapterId } = params;

    await connectToDatabase();

    const Chapter = mongoose.models.Chapter;
    if (!Chapter) {
      return NextResponse.json(
        { error: 'Chapter model not found' },
        { status: 500 }
      );
    }

    // Increment view count
    const chapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'View count updated',
      views: chapter.views 
    });

  } catch (error) {
    console.error('Chapter view update error:', error);
    return NextResponse.json(
      { error: 'Failed to update view count' },
      { status: 500 }
    );
  }
}
