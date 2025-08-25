import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Test database connection
    await connectToDatabase();
    
    // Check if Chapter model exists
    const Chapter = mongoose.models.Chapter;
    const hasChapterModel = !!Chapter;
    
    // Check if we can query chapters
    let chaptersCount = 0;
    let sampleChapter = null;
    
    if (Chapter) {
      try {
        chaptersCount = await Chapter.countDocuments();
        if (chaptersCount > 0) {
          sampleChapter = await Chapter.findOne().select('_id title chapterNumber').lean();
        }
      } catch (error) {
        console.error('Error querying chapters:', error);
      }
    }
    
    // Check environment variables
    const hasMongoUri = !!process.env.MONGODB_URI;
    const mongoUriLength = process.env.MONGODB_URI?.length || 0;
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection test',
      database: {
        connected: true,
        hasMongoUri,
        mongoUriLength,
        hasChapterModel,
        chaptersCount,
        sampleChapter
      },
      models: Object.keys(mongoose.models),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('MongoDB test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'MongoDB connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      hasMongoUri: !!process.env.MONGODB_URI,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
