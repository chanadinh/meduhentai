const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meduhentai');
    console.log('Connected to MongoDB');
    console.log('Database:', mongoose.connection.db.databaseName);
    
    // User Schema
    const userSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      role: String,
      avatar: String,
      createdAt: Date,
      updatedAt: Date
    });

    const User = mongoose.model('User', userSchema);
    
    // Find all users
    const users = await User.find({});
    console.log(`\nFound ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('No users found');
      return;
    }

    console.log('\n=== CURRENT USERS AND ROLES ===\n');
    
    for (const user of users) {
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Current Role: ${user.role}`);
      console.log(`User ID: ${user._id}`);
      console.log('---');
    }

    // Check specific users
    console.log('\n=== CHECKING SPECIFIC USERS ===\n');
    
    const testUsers = ['testuser2', 'Admin', 'andinhc254@gmail.com'];
    
    for (const username of testUsers) {
      const user = await User.findOne({ username });
      if (user) {
        console.log(`✅ Found user: ${username}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Can upload: ${user.role === 'uploader' || user.role === 'admin' ? 'YES' : 'NO'}`);
      } else {
        console.log(`❌ User not found: ${username}`);
      }
      console.log('---');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

checkUsers();
