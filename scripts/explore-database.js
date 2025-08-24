const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meduhentai');

async function exploreDatabase() {
  try {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n=== ALL COLLECTIONS IN DATABASE ===\n');
    
    for (const collection of collections) {
      console.log(`Collection: ${collection.name}`);
      console.log(`Type: ${collection.type}`);
      console.log('---');
    }
    
    // Check each collection for users
    console.log('\n=== SEARCHING FOR USERS IN ALL COLLECTIONS ===\n');
    
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`Collection: ${collection.name} - ${count} documents`);
        
        if (count > 0) {
          // Look for documents that might be users
          const sample = await db.collection(collection.name).findOne({});
          if (sample) {
            console.log(`Sample document keys: ${Object.keys(sample).join(', ')}`);
            
            // Check if this looks like a user document
            if (sample.username || sample.email || sample.password) {
              console.log(`✅ This looks like a user collection!`);
              
              // Find all users in this collection
              const users = await db.collection(collection.name).find({}).toArray();
              console.log(`Found ${users.length} users in ${collection.name}:`);
              
              for (const user of users) {
                console.log(`  - ${user.username || user.email || 'Unknown'}`);
              }
            }
          }
          console.log('---');
        }
      } catch (error) {
        console.log(`Error checking collection ${collection.name}:`, error.message);
      }
    }
    
    // Also check the specific 'users' collection
    console.log('\n=== CHECKING SPECIFIC USER COLLECTIONS ===\n');
    
    const userCollections = ['users', 'user', 'Users', 'User'];
    
    for (const collName of userCollections) {
      try {
        const exists = await db.listCollections({ name: collName }).toArray();
        if (exists.length > 0) {
          const count = await db.collection(collName).countDocuments();
          console.log(`Collection '${collName}': ${count} documents`);
          
          if (count > 0) {
            const users = await db.collection(collName).find({}).toArray();
            console.log(`Users in '${collName}':`);
            for (const user of users) {
              console.log(`  - ${user.username || user.email || 'Unknown'}`);
            }
          }
        } else {
          console.log(`Collection '${collName}' does not exist`);
        }
      } catch (error) {
        console.log(`Error checking '${collName}':`, error.message);
      }
      console.log('---');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

exploreDatabase();
