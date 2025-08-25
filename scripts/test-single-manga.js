const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Define schemas (simplified versions for the script)
const mangaSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  chapters: [mongoose.Schema.Types.ObjectId],
  chaptersCount: Number,
  totalChapters: Number
});

const chapterSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  mangaId: mongoose.Schema.Types.ObjectId,
  title: String,
  chapterNumber: Number
});

const Manga = mongoose.model('Manga', mangaSchema);
const Chapter = mongoose.model('Chapter', chapterSchema);

async function testSingleManga(mangaId) {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log(`🔍 Testing manga with ID: ${mangaId}`);
    
    // Get the manga document
    const manga = await Manga.findById(mangaId).lean();
    if (!manga) {
      console.error('❌ Manga not found');
      return;
    }

    console.log(`📖 Manga: "${manga.title}"`);
    console.log(`📊 Current counts:`);
    console.log(`   chaptersCount: ${manga.chaptersCount || 0}`);
    console.log(`   totalChapters: ${manga.totalChapters || 0}`);
    console.log(`   chapters array length: ${manga.chapters ? manga.chapters.length : 0}`);

    // Get actual chapter count from Chapter collection
    const actualChapterCount = await Chapter.countDocuments({ 
      $or: [
        { mangaId: mangaId },
        { manga: mangaId }
      ]
    });
    console.log(`🔍 Actual chapters in Chapter collection: ${actualChapterCount}`);

    // Get chapters array length (if it exists)
    const chaptersArrayLength = manga.chapters ? manga.chapters.length : 0;
    
    // Determine what the correct count should be
    let correctCount = actualChapterCount;
    
    if (chaptersArrayLength > 0) {
      correctCount = chaptersArrayLength;
      console.log(`💡 Using chapters array length (${chaptersArrayLength}) as source of truth`);
    } else if (actualChapterCount > 0) {
      console.log(`💡 Using Chapter collection count (${actualChapterCount}) as source of truth`);
    } else {
      console.log(`💡 No chapters found, setting count to 0`);
    }

    // Check if update is needed
    const currentChaptersCount = manga.chaptersCount || 0;
    const currentTotalChapters = manga.totalChapters || 0;
    
    if (currentChaptersCount !== correctCount || currentTotalChapters !== correctCount) {
      console.log(`🔧 Update needed! Current: ${currentChaptersCount}, Should be: ${correctCount}`);
      
      // Ask for confirmation
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Do you want to fix this manga? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          try {
            await Manga.findByIdAndUpdate(mangaId, {
              $set: {
                chaptersCount: correctCount,
                totalChapters: correctCount
              }
            });
            console.log('✅ Manga updated successfully!');
          } catch (error) {
            console.error('❌ Error updating manga:', error.message);
          }
        } else {
          console.log('⏭️ Skipped updating');
        }
        rl.close();
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
      });
    } else {
      console.log('✅ No update needed - counts are already correct');
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
    await mongoose.disconnect();
  }
}

// Get manga ID from command line argument
const mangaId = process.argv[2];

if (!mangaId) {
  console.error('❌ Please provide a manga ID as an argument');
  console.log('Usage: node test-single-manga.js <manga-id>');
  console.log('Example: node test-single-manga.js 68abbf6785e60218005c5507');
  process.exit(1);
}

// Run the script
testSingleManga(mangaId);
