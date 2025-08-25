const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// SECURITY NOTICE: This script creates users with 'user' role by default.
// Admin roles should only be assigned through the admin panel after proper authentication.
// Never hardcode admin roles in scripts for security reasons.

// Connect to MongoDB using the same connection string
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meduhentai');

// User Schema - match exactly what the admin panel expects
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  originalPassword: String,
  role: String,
  avatar: String,
  stats: {
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 }
  },
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function fixAdminUsers() {
  try {
    console.log('Connected to MongoDB');
    console.log('Connection string:', process.env.MONGODB_URI || 'mongodb://localhost:27017/meduhentai');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('No users found. Let me create the users you showed me...');
      
      // Create the 3 users you showed me in the admin panel
      const usersToCreate = [
        {
          username: 'testuser2',
          email: 'test2@example.com',
          password: await bcrypt.hash('testpass456', 12),
          originalPassword: 'testpass456',
          role: 'user', // Default to user role for security
          avatar: '/medusa.ico',
          stats: { totalViews: 0, totalLikes: 0, totalComments: 0 }
        },
        {
          username: 'Admin',
          email: 'contact@chandinh.org',
          password: await bcrypt.hash('admin123', 12),
          originalPassword: 'admin123',
          role: 'user', // Default to user role for security - promote to admin through admin panel
          avatar: '/medusa.ico',
          stats: { totalViews: 0, totalLikes: 0, totalComments: 0 }
        },
        {
          username: 'andinhc254@gmail.com',
          email: 'andinhc254@gmail.com',
          password: await bcrypt.hash('andinh123', 12),
          originalPassword: 'andinh123',
          role: 'user', // Default to user role for security - promote to admin through admin panel
          avatar: '/medusa.ico',
          stats: { totalViews: 0, totalLikes: 0, totalComments: 0 }
        }
      ];
      
      for (const userData of usersToCreate) {
        const newUser = new User(userData);
        await newUser.save();
        console.log(`✅ Created user: ${userData.username} with password: ${userData.originalPassword}`);
      }
      
    } else {
      console.log('\n=== CURRENT USERS ===\n');
      
      for (const user of users) {
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Has originalPassword: ${!!user.originalPassword}`);
        console.log('---');
      }
      
      // Update existing users with passwords
      console.log('\n=== UPDATING EXISTING USERS ===\n');
      
      for (const user of users) {
        let newPassword;
        
        // Set passwords based on username
        if (user.username === 'testuser2') {
          newPassword = 'testpass456';
        } else if (user.username === 'Admin') {
          newPassword = 'admin123';
        } else if (user.username === 'andinhc254@gmail.com') {
          newPassword = 'andinh123';
        } else {
          newPassword = `${user.username}123`;
        }
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        // Update user
        user.password = hashedPassword;
        user.originalPassword = newPassword;
        
        await user.save();
        
        console.log(`✅ Updated ${user.username}:`);
        console.log(`   New Password: ${newPassword}`);
        console.log(`   Role: ${user.role}`);
        console.log('---');
      }
    }
    
    // Final verification
    console.log('\n=== FINAL VERIFICATION ===\n');
    const finalUsers = await User.find({});
    
    for (const user of finalUsers) {
      console.log(`Username: ${user.username}`);
      console.log(`Password: ${user.originalPassword}`);
      console.log(`Role: ${user.role}`);
      
      // Test login
      const isValid = await bcrypt.compare(user.originalPassword, user.password);
      console.log(`Login Test: ${isValid ? '✅ PASS' : '❌ FAIL'}`);
      console.log('---');
    }
    
    console.log('\n🎉 All users are now ready!');
    console.log('\n📋 PASSWORDS FOR ADMIN PANEL:');
    for (const user of finalUsers) {
      console.log(`${user.username}: ${user.originalPassword}`);
    }
    
    console.log('\nNow go to /admin/users and check "Show Passwords" to see them!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

fixAdminUsers();
