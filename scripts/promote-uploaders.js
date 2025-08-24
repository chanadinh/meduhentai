const mongoose = require('mongoose');
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
  stats: {
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 }
  },
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function promoteUploaders() {
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
      console.log(`Current Role: ${user.role}`);
      console.log('---');
    }

    // Promote specific users to uploader role
    console.log('\n=== PROMOTING USERS TO UPLOADER ROLE ===\n');
    
    const usersToPromote = ['testuser2', 'Admin', 'andinhc254@gmail.com'];
    
    for (const username of usersToPromote) {
      const user = await User.findOne({ username });
      if (user) {
        if (user.role !== 'uploader' && user.role !== 'admin') {
          user.role = 'uploader';
          await user.save();
          console.log(`✅ Promoted ${username} to uploader role`);
        } else {
          console.log(`ℹ️  ${username} already has ${user.role} role (no change needed)`);
        }
      } else {
        console.log(`❌ User ${username} not found`);
      }
    }

    // Final verification
    console.log('\n=== FINAL USER ROLES ===\n');
    const finalUsers = await User.find({});
    
    for (const user of finalUsers) {
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    }
    
    console.log('\n🎉 Role updates completed!');
    console.log('\nNow users with uploader or admin roles can:');
    console.log('1. Upload new manga');
    console.log('2. Upload new chapters');
    console.log('3. Edit existing manga');
    console.log('\nRegular users will see access denied messages.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

promoteUploaders();
