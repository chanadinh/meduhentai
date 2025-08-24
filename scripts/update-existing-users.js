const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meduhentai');

// User Schema
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

async function updateExistingUsers() {
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
      console.log('---');
    }

    // Update each user with a new password
    console.log('\n=== UPDATING USERS WITH NEW PASSWORDS ===\n');
    
    for (const user of users) {
      let newPassword;
      
      // Set different passwords based on username
      if (user.username === 'testuser2') {
        newPassword = 'testpass456';
      } else if (user.username === 'Admin') {
        newPassword = 'admin123';
      } else if (user.username === 'andinhc254@gmail.com') {
        newPassword = 'andinh123';
      } else {
        newPassword = 'password123';
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update user with new password and original password
      user.password = hashedPassword;
      user.originalPassword = newPassword;
      
      await user.save();
      
      console.log(`✅ Updated ${user.username}:`);
      console.log(`   New Password: ${newPassword}`);
      console.log(`   Role: ${user.role}`);
      console.log('---');
    }

    console.log('\n=== VERIFICATION ===\n');
    
    // Verify the updates
    const updatedUsers = await User.find({});
    
    for (const user of updatedUsers) {
      console.log(`Username: ${user.username}`);
      console.log(`Password: ${user.originalPassword}`);
      console.log(`Role: ${user.role}`);
      
      // Test if the password works
      const isValid = await bcrypt.compare(user.originalPassword, user.password);
      console.log(`Login Test: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
      console.log('---');
    }

    console.log('\n🎉 All users updated successfully!');
    console.log('\nYou can now:');
    console.log('1. Go to /admin/users');
    console.log('2. Check "Show Passwords" checkbox');
    console.log('3. See the actual passwords displayed');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

updateExistingUsers();
