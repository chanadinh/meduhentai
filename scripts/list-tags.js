const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Get MongoDB URI
const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI || 'mongodb+srv://chandinhjobs:Khanhngo12309@cluster0.mknpcws.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0';

// Define the Manga schema
const MangaSchema = new mongoose.Schema({
  title: String,
  genres: [String],
  tags: [String]
});

async function listTags() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully\n');

    const Manga = mongoose.models.Manga || mongoose.model('Manga', MangaSchema);

    // Get all unique genres and tags
    const genresData = await Manga.aggregate([
      { $unwind: '$genres' },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const tagsData = await Manga.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('=== GENRES ===');
    console.log(`Total unique genres: ${genresData.length}`);
    genresData.forEach(genre => {
      console.log(`${genre._id}: ${genre.count} manga`);
    });

    console.log('\n=== TAGS ===');
    console.log(`Total unique tags: ${tagsData.length}`);
    tagsData.forEach(tag => {
      console.log(`${tag._id}: ${tag.count} manga`);
    });

    console.log('\n=== SUMMARY ===');
    console.log(`Total manga documents: ${await Manga.countDocuments()}`);
    console.log(`Manga with genres: ${await Manga.countDocuments({ genres: { $exists: true, $ne: [] } })}`);
    console.log(`Manga with tags: ${await Manga.countDocuments({ tags: { $exists: true, $ne: [] } })}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

listTags();
