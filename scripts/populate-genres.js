const { MongoClient } = require('mongodb');
require('dotenv').config();

const GENRES = [
  'Action', 'Adventure', 'Anal', 'Ahegao', 'BDSM', 'Beach', 'Big Dick', 'Bikini', 
  'Blindfold', 'Blonde', 'Bondage', 'Bukkake', 'Bunny Costume', 'Cheating', 
  'Chikan', 'Chubby', 'Comedy', 'Cosplay', 'Costume', 'Deepthroat', 'Demon', 
  'Dildo', 'Drama', 'Ecchi', 'Ebony', 'Elbow Gloves', 'Electrocution', 'Elf', 
  'Enema', 'Exhibitionist', 'Fantasy', 'Fat', 'Femdom', 'Fisting', 'Flatchest', 
  'Footjob', 'Futa', 'Futanari', 'Gangbang', 'Gape', 'Glasses', 'Glory Hole', 
  'Gyaru', 'Handjob', 'Harem', 'Huge Ass', 'Huge Breast', 'Huge Dick', 'Horror', 
  'Incest', 'Lady Suit', 'Latex', 'Legwear', 'Lesbian', 'Maid', 'Masturbation', 
  'MILF', 'Mind Break', 'Mind Control', 'Mother', 'Mother and Daughter', 'Nerd', 
  'NTR', 'Oral', 'Orc', 'Orgy', 'Pantyhose', 'Petplay', 'Piercing', 'Piss', 
  'Pregnant', 'Princess', 'Prolapse', 'Prostitution', 'Public', 'Public Toilet', 
  'Public Vibrator', 'Romance', 'School Life', 'Sci-Fi', 'Sex Toys', 'Short Hair', 
  'Sister', 'Slave', 'Slice of Life', 'Slut', 'Slut Dress', 'Sports', 'Squirt', 
  'Stomach Bulge', 'Supernatural', 'Swimsuit', 'Tail', 'Tan', 'Tan Lines', 
  'Tattoo', 'Teacher', 'Tentacles', 'Thriller', 'Tomboy', 'Train', 'Trap', 
  'Uncensored', 'Vanilla', 'Vibrator', 'Warrior', 'Wife', 'Yaoi', 'Yuri'
];

async function populateGenres() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const mangaCollection = db.collection('mangas');

    // Get all manga that don't have genres
    const mangaWithoutGenres = await mangaCollection.find({ 
      $or: [
        { genres: { $exists: false } },
        { genres: { $size: 0 } }
      ]
    }).toArray();

    console.log(`Found ${mangaWithoutGenres.length} manga without genres`);

    if (mangaWithoutGenres.length === 0) {
      console.log('All manga already have genres');
      return;
    }

    // Add random genres to each manga
    for (const manga of mangaWithoutGenres) {
      const randomGenres = getRandomElements(GENRES, Math.floor(Math.random() * 4) + 2); // 2-5 genres
      
      await mangaCollection.updateOne(
        { _id: manga._id },
        { $set: { genres: randomGenres } }
      );
      
      console.log(`Added genres to "${manga.title}": ${randomGenres.join(', ')}`);
    }

    console.log('Genres populated successfully!');
    
    // Show final count
    const totalManga = await mangaCollection.countDocuments();
    const mangaWithGenres = await mangaCollection.countDocuments({ genres: { $exists: true, $ne: [] } });
    
    console.log(`Total manga: ${totalManga}`);
    console.log(`Manga with genres: ${mangaWithGenres}`);

  } catch (error) {
    console.error('Error populating genres:', error);
  } finally {
    await client.close();
  }
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

populateGenres();
