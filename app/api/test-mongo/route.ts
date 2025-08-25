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
    let chaptersWithMangaRefs = [];
    let testQueryResult = null;
    
    if (Chapter) {
      try {
        chaptersCount = await Chapter.countDocuments();
        if (chaptersCount > 0) {
          sampleChapter = await Chapter.findOne().select('_id title chapterNumber mangaId manga').lean();
          
          // Get a few chapters to see their structure
          chaptersWithMangaRefs = await Chapter.find()
            .select('_id title chapterNumber mangaId manga')
            .limit(5)
            .lean();
          
          // Test the exact query that the manga API uses
          if (chaptersWithMangaRefs.length > 0) {
            const testMangaId = chaptersWithMangaRefs[0].mangaId;
            testQueryResult = await Chapter.find({ 
              $or: [
                { mangaId: testMangaId },
                { manga: testMangaId }
              ]
            }).select('_id title chapterNumber').lean();
          }
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
        sampleChapter,
        chaptersWithMangaRefs,
        testQueryResult,
        testQueryMangaId: chaptersWithMangaRefs.length > 0 ? chaptersWithMangaRefs[0].mangaId : null
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
