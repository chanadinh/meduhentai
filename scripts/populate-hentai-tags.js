const mongoose = require('mongoose');
const path = require('path');

// Try to load environment variables, but also accept command line arguments
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Get MongoDB URI from command line argument or environment variable
const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI || 'mongodb+srv://chandinhjobs:Khanhngo12309@cluster0.mknpcws.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0';

// Define the Manga schema inline since we can't import the model directly
const MangaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  genres: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    trim: true
  },
  artist: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'hiatus', 'cancelled'],
    default: 'ongoing'
  },
  views: {
    type: Number,
    default: 0
  },
  chaptersCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Make it optional for existing documents
  }
}, {
  timestamps: true
});

// Connect to MongoDB
async function connectToDatabase() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined. Please provide it as a command line argument or set it in .env.local');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Comprehensive list of hentai tags based on ahegao.online
const hentaiTags = [
  // A
  'Ahegao', 'Anal', 'Anime',
  
  // B
  'BDSM', 'Beach', 'Big Dick', 'Bikini', 'Blindfold', 'Blonde', 'Bondage', 'Bukkake', 'Bunny Costume',
  
  // C
  'Cheating', 'Cheating Behind Door', 'Chikan', 'Chubby', 'Cosplay', 'Costume',
  
  // D
  'Deepthroat', 'Demon', 'Dildo',
  
  // E
  'Ebony', 'Elbow Gloves', 'Electrocution', 'Elf', 'Enema', 'Exhibitionist',
  
  // F
  'Fat', 'Femdom', 'Fisting', 'Flatchest', 'Footjob', 'Futa', 'Futanari',
  
  // G
  'Gangbang', 'Gape', 'Glasses', 'Glory Hole', 'Gyaru',
  
  // H
  'Handjob', 'Harem', 'Huge Ass', 'Huge Breast', 'Huge Dick',
  
  // I
  'Incest',
  
  // L
  'Lady Suit', 'Latex', 'Legwear', 'Lesbian',
  
  // M
  'Maid', 'Masturbation', 'MILF', 'Mind Break', 'Mind Control', 'Mother', 'Mother and Daughter',
  
  // N
  'Nerd', 'NTR',
  
  // O
  'Oral', 'Orc', 'Orgasm', 'Orgy',
  
  // P
  'Pantyhose', 'Petplay', 'Piercing', 'Piss', 'Pregnant', 'Princess', 'Prolapse', 'Prostitution', 'Public', 'Public Toilet', 'Public Vibrator',
  
  // S
  'Sex Toys', 'Short Hair', 'Sister', 'Slave', 'Slut', 'Slut Dress', 'Squirt', 'Stomach Bulge', 'Swimsuit',
  
  // T
  'Tail', 'Tan', 'Tan Lines', 'Tattoo', 'Teacher', 'Tentacles', 'Tomboy', 'Train', 'Trap',
  
  // U
  'Uncensored',
  
  // V
  'Vanilla', 'Vibrator',
  
  // W
  'Warrior', 'Wife',
  
  // Y
  'Yuri'
];

// Additional popular tags that are commonly used
const additionalTags = [
  'School', 'Office', 'Nurse', 'Doctor', 'Police', 'Military', 'Fantasy', 'Sci-Fi', 'Historical', 'Modern',
  'Romance', 'Drama', 'Comedy', 'Action', 'Adventure', 'Horror', 'Mystery', 'Slice of Life', 'Supernatural',
  'Vampire', 'Werewolf', 'Angel', 'Devil', 'Ghost', 'Zombie', 'Robot', 'Android', 'Monster', 'Dragon',
  'Magic', 'Sword', 'Gun', 'Martial Arts', 'Sports', 'Music', 'Art', 'Cooking', 'Gaming', 'Technology',
  'Business', 'Politics', 'Religion', 'Philosophy', 'Psychology', 'Science', 'Medicine', 'Law', 'Education',
  'Family', 'Friendship', 'Love Triangle', 'Revenge', 'Betrayal', 'Redemption', 'Transformation', 'Possession',
  'Hypnosis', 'Brainwashing', 'Stockholm Syndrome', 'Gaslighting', 'Manipulation', 'Corruption', 'Corruption of Innocence',
  'Virgin', 'Experienced', 'Shy', 'Confident', 'Tsundere', 'Yandere', 'Kuudere', 'Dandere', 'Genki',
  'Loli', 'Shotacon', 'MILF', 'DILF', 'Cougar', 'Sugar Daddy', 'Sugar Mommy', 'Age Gap', 'May-December Romance',
  'Forbidden Love', 'Secret Relationship', 'Public Sex', 'Voyeurism', 'Exhibitionism', 'Roleplay', 'Dress-up',
  'Uniform', 'School Uniform', 'Nurse Uniform', 'Maid Uniform', 'Police Uniform', 'Military Uniform',
  'Traditional Clothing', 'Kimono', 'Yukata', 'Hanfu', 'Cheongsam', 'Sari', 'Kilt', 'Dirndl',
  'Western Clothing', 'Dress', 'Skirt', 'Pants', 'Shirt', 'Blouse', 'Jacket', 'Coat', 'Shoes', 'Boots',
  'Accessories', 'Glasses', 'Hat', 'Scarf', 'Jewelry', 'Piercing', 'Tattoo', 'Makeup', 'Hair Accessories',
  'Body Types', 'Slim', 'Athletic', 'Curvy', 'Plus Size', 'Tall', 'Short', 'Petite', 'Voluptuous',
  'Hair Colors', 'Black Hair', 'Brown Hair', 'Blonde Hair', 'Red Hair', 'Blue Hair', 'Green Hair', 'Purple Hair', 'Pink Hair', 'White Hair', 'Gray Hair',
  'Hair Styles', 'Long Hair', 'Short Hair', 'Twin Tails', 'Ponytail', 'Bob Cut', 'Pixie Cut', 'Undercut', 'Mullet', 'Afro', 'Dreadlocks',
  'Eye Colors', 'Brown Eyes', 'Blue Eyes', 'Green Eyes', 'Hazel Eyes', 'Gray Eyes', 'Amber Eyes', 'Violet Eyes', 'Heterochromia',
  'Skin Tones', 'Fair Skin', 'Tan Skin', 'Dark Skin', 'Olive Skin', 'Pale Skin', 'Freckles', 'Moles', 'Birthmarks',
  'Personality Traits', 'Shy', 'Bold', 'Aggressive', 'Submissive', 'Dominant', 'Masochist', 'Sadist', 'Switch',
  'Sexual Preferences', 'Top', 'Bottom', 'Versatile', 'Dominant', 'Submissive', 'Switch', 'Vanilla', 'Kinky',
  'Fetishes', 'Foot Fetish', 'Hand Fetish', 'Hair Fetish', 'Clothing Fetish', 'Food Fetish', 'Object Fetish',
  'Scenarios', 'First Time', 'Virgin', 'Experienced', 'Teacher-Student', 'Boss-Employee', 'Doctor-Patient',
  'Settings', 'Home', 'School', 'Office', 'Hospital', 'Hotel', 'Beach', 'Forest', 'Mountain', 'City', 'Countryside',
  'Time Periods', 'Modern', 'Historical', 'Victorian', 'Medieval', 'Ancient', 'Future', 'Post-Apocalyptic',
  'Cultural Elements', 'Japanese', 'Chinese', 'Korean', 'Western', 'European', 'African', 'Middle Eastern', 'Indian',
  'Art Styles', 'Realistic', 'Cartoon', 'Anime', 'Manga', 'Chibi', 'Semi-Realistic', 'Abstract', 'Impressionist'
];

// Combine all tags
const allTags = [...hentaiTags, ...additionalTags];

// Function to populate tags
async function populateTags() {
  try {
    await connectToDatabase();
    
    console.log('Starting tag population...');
    console.log(`Total tags to add: ${allTags.length}`);
    
    // Get the Manga model
    const Manga = mongoose.models.Manga || mongoose.model('Manga', MangaSchema);
    
    // Check if there are any existing manga documents
    const existingManga = await Manga.findOne();
    
    if (!existingManga) {
      console.log('No existing manga found. Creating a sample manga with all tags...');
      
      // Create a sample manga with all tags for demonstration
      const sampleManga = new Manga({
        title: 'Sample Manga with All Tags',
        description: 'This is a sample manga that contains all the available tags for demonstration purposes.',
        coverImage: 'https://via.placeholder.com/300x400',
        genres: allTags.slice(0, 50), // Use first 50 as genres
        tags: allTags.slice(50), // Use the rest as tags
        author: 'System',
        artist: 'System',
        status: 'completed',
        userId: new mongoose.Types.ObjectId(), // Create a dummy ObjectId
        views: 0,
        chaptersCount: 1,
        likes: 0,
        dislikes: 0,
        isDeleted: false
      });
      
      await sampleManga.save();
      console.log('Sample manga created with all tags');
    } else {
      console.log('Existing manga found. Adding tags to existing documents...');
      
      // Add some random tags to existing manga documents
      const mangas = await Manga.find().limit(10); // Limit to first 10 manga
      
      for (let i = 0; i < mangas.length; i++) {
        const manga = mangas[i];
        
        // Add some random genres and tags
        const randomGenres = getRandomElements(allTags.slice(0, 50), Math.floor(Math.random() * 5) + 1);
        const randomTags = getRandomElements(allTags.slice(50), Math.floor(Math.random() * 10) + 1);
        
        // Merge with existing genres and tags, removing duplicates
        const newGenres = [...new Set([...(manga.genres || []), ...randomGenres])];
        const newTags = [...new Set([...(manga.tags || []), ...randomTags])];
        
        // Update the document directly to avoid validation issues
        await Manga.updateOne(
          { _id: manga._id },
          { 
            $set: { 
              genres: newGenres, 
              tags: newTags 
            } 
          }
        );
        console.log(`Updated manga: ${manga.title}`);
      }
    }
    
    console.log('Tag population completed successfully!');
    console.log(`Total unique tags available: ${allTags.length}`);
    
    // Display some statistics
    const totalManga = await Manga.countDocuments();
    const mangaWithGenres = await Manga.countDocuments({ genres: { $exists: true, $ne: [] } });
    const mangaWithTags = await Manga.countDocuments({ tags: { $exists: true, $ne: [] } });
    
    console.log('\nStatistics:');
    console.log(`Total manga: ${totalManga}`);
    console.log(`Manga with genres: ${mangaWithGenres}`);
    console.log(`Manga with tags: ${mangaWithTags}`);
    
  } catch (error) {
    console.error('Error populating tags:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Helper function to get random elements from an array
function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Run the script
populateTags();
