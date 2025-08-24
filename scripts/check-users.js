const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkUsers() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Find all users
    const users = await usersCollection.find({ isDeleted: { $ne: true } })
      .project({ username: 1, email: 1, role: 1, originalPassword: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('\n=== USERS IN DATABASE ===\n');
    
    if (users.length === 0) {
      console.log('No users found in database');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password: ${user.originalPassword || 'Not available (created before password storage feature)'}`);
      console.log(`   Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}`);
      console.log('');
    });

    console.log(`Total users: ${users.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

checkUsers();
