const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meduhentai');

// User Schema (simplified for this script)
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  originalPassword: String,
  role: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function updateUserPasswords() {
  try {
    console.log('Connected to MongoDB');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('No users found');
      return;
    }

    console.log('\n=== CURRENT USERS ===\n');
    
    for (const user of users) {
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Has originalPassword: ${!!user.originalPassword}`);
      console.log(`Created: ${user.createdAt}`);
      console.log('---');
    }

    // For demonstration, let's create a test user with a known password
    console.log('\n=== CREATING TEST USER 2 ===\n');
    
    const testUser2 = await User.findOne({ username: 'testuser2' });
    
    if (testUser2) {
      console.log('testuser2 already exists, updating password...');
      testUser2.originalPassword = 'testpass456';
      await testUser2.save();
      console.log('Updated testuser2 with password: testpass456');
    } else {
      console.log('Creating testuser2...');
      const hashedPassword = await bcrypt.hash('testpass456', 10);
      
      const newTestUser = new User({
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: hashedPassword,
        originalPassword: 'testpass456',
        role: 'user',
        avatar: '/medusa.ico'
      });
      
      await newTestUser.save();
      console.log('Created testuser2 with password: testpass456');
    }

    // Also update the existing testuser if it exists
    const testUser = await User.findOne({ username: 'testuser' });
    if (testUser && !testUser.originalPassword) {
      console.log('\nUpdating testuser with original password...');
      testUser.originalPassword = 'testpass123';
      await testUser.save();
      console.log('Updated testuser with password: testpass123');
    }

    console.log('\n=== UPDATED USERS ===\n');
    const updatedUsers = await User.find({});
    
    for (const user of updatedUsers) {
      console.log(`Username: ${user.username}`);
      console.log(`Password: ${user.originalPassword || 'Not available'}`);
      console.log('---');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

updateUserPasswords();
