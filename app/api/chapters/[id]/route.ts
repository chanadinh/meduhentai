import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Get a specific chapter
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await connectToDatabase();

    const Chapter = mongoose.models.Chapter;
    if (!Chapter) {
      return NextResponse.json(
        { error: 'Chapter model not found' },
        { status: 500 }
      );
    }

    const chapter = await Chapter.findById(id).lean();

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ chapter });

  } catch (error) {
    console.error('Chapter GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
}

// PUT - Update a chapter
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { title, chapterNumber, pages } = body;

    await connectToDatabase();

    const Chapter = mongoose.models.Chapter;
    const Manga = mongoose.models.Manga;
    
    if (!Chapter || !Manga) {
      return NextResponse.json(
        { error: 'Models not found' },
        { status: 500 }
      );
    }

    // Find the chapter and check permissions
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Check if user owns the manga or is admin
    const manga = await Manga.findById(chapter.mangaId);
    if (!manga) {
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      );
    }

    if (manga.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to edit this chapter' },
        { status: 403 }
      );
    }

    // Check if new chapter number conflicts with existing chapters (excluding current chapter)
    if (chapterNumber && chapterNumber !== chapter.chapterNumber) {
      const existingChapter = await Chapter.findOne({
        mangaId: chapter.mangaId,
        chapterNumber: chapterNumber,
        _id: { $ne: id }
      });

      if (existingChapter) {
        return NextResponse.json(
          { error: `Chapter ${chapterNumber} already exists for this manga` },
          { status: 400 }
        );
      }
    }

    // Update the chapter
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (chapterNumber !== undefined) updateData.chapterNumber = chapterNumber;
    if (pages !== undefined) {
      updateData.pages = pages.map((page: any, index: number) => ({
        pageNumber: page.pageNumber || index + 1,
        imageUrl: page.imageUrl,
        width: page.width || 800,
        height: page.height || 1200
      }));
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({ 
      message: 'Chapter updated successfully',
      chapter: updatedChapter 
    });

  } catch (error) {
    console.error('Chapter PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update chapter' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chapter
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    await connectToDatabase();

    const Chapter = mongoose.models.Chapter;
    const Manga = mongoose.models.Manga;
    
    if (!Chapter || !Manga) {
      return NextResponse.json(
        { error: 'Models not found' },
        { status: 500 }
      );
    }

    // Find the chapter and check permissions
    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    // Check if user owns the manga or is admin
    const manga = await Manga.findById(chapter.mangaId);
    if (!manga) {
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      );
    }

    if (manga.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized to delete this chapter' },
        { status: 403 }
      );
    }

    // Delete the chapter
    await Chapter.findByIdAndDelete(id);

    // Update manga's chapter count
    await Manga.findByIdAndUpdate(chapter.mangaId, {
      $inc: { chaptersCount: -1 }
    });

    return NextResponse.json({ 
      message: 'Chapter deleted successfully' 
    });

  } catch (error) {
    console.error('Chapter DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chapter' },
      { status: 500 }
    );
  }
}
