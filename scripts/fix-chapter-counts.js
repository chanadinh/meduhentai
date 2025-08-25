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

async function fixChapterCounts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all manga documents
    console.log('📚 Fetching all manga documents...');
    const allManga = await Manga.find({}).lean();
    console.log(`📖 Found ${allManga.length} manga documents`);

    let updatedCount = 0;
    let errors = [];

    for (const manga of allManga) {
      try {
        console.log(`\n🔍 Processing: "${manga.title}" (ID: ${manga._id})`);
        
        // Get actual chapter count from Chapter collection
        const actualChapterCount = await Chapter.countDocuments({ 
          $or: [
            { mangaId: manga._id },
            { manga: manga._id }
          ]
        });

        // Get chapters array length (if it exists)
        const chaptersArrayLength = manga.chapters ? manga.chapters.length : 0;
        
        // Get current counts from the document
        const currentChaptersCount = manga.chaptersCount || 0;
        const currentTotalChapters = manga.totalChapters || 0;

        console.log(`   📊 Current counts:`);
        console.log(`      chaptersCount: ${currentChaptersCount}`);
        console.log(`      totalChapters: ${currentTotalChapters}`);
        console.log(`      chapters array length: ${chaptersArrayLength}`);
        console.log(`   🔍 Actual chapters in Chapter collection: ${actualChapterCount}`);

        // Determine what the correct count should be
        let correctCount = actualChapterCount;
        
        // If chapters array exists and has data, use that as the source of truth
        if (chaptersArrayLength > 0) {
          correctCount = chaptersArrayLength;
          console.log(`   💡 Using chapters array length (${chaptersArrayLength}) as source of truth`);
        } else if (actualChapterCount > 0) {
          console.log(`   💡 Using Chapter collection count (${actualChapterCount}) as source of truth`);
        } else {
          console.log(`   💡 No chapters found, setting count to 0`);
        }

        // Check if update is needed
        if (currentChaptersCount !== correctCount || currentTotalChapters !== correctCount) {
          console.log(`   🔧 Updating counts to ${correctCount}...`);
          
          await Manga.findByIdAndUpdate(manga._id, {
            $set: {
              chaptersCount: correctCount,
              totalChapters: correctCount
            }
          });
          
          console.log(`   ✅ Updated successfully`);
          updatedCount++;
        } else {
          console.log(`   ✅ Counts are already correct`);
        }

      } catch (error) {
        console.error(`   ❌ Error processing manga ${manga._id}:`, error.message);
        errors.push({ mangaId: manga._id, title: manga.title, error: error.message });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log(`📚 Total manga processed: ${allManga.length}`);
    console.log(`🔧 Manga updated: ${updatedCount}`);
    console.log(`❌ Errors encountered: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(error => {
        console.log(`   - ${error.title} (${error.mangaId}): ${error.error}`);
      });
    }

    if (updatedCount > 0) {
      console.log('\n🎉 Data inconsistency has been fixed!');
      console.log('💡 The chaptersCount and totalChapters fields now match the actual chapter data.');
    } else {
      console.log('\n✅ No updates were needed - all manga already have correct chapter counts.');
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  fixChapterCounts()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixChapterCounts };
