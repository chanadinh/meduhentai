const mongoose = require('mongoose');
require('dotenv').config();

// SECURITY SCRIPT: Fix user roles to ensure proper security
// This script will:
// 1. Check all existing users
// 2. Fix any users with incorrect roles
// 3. Ensure only authorized users have admin/uploader roles

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

async function fixUserRoles() {
  try {
    console.log('🔒 Fixing user roles for security...');
    console.log('Connected to MongoDB');
    
    // Find all users
    const users = await User.find({});
    console.log(`\nFound ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('No users found in database');
      return;
    }

    console.log('\n=== CURRENT USER ROLES ===\n');
    
    for (const user of users) {
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Current Role: ${user.role}`);
      console.log(`Created: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}`);
      console.log('---');
    }

    // Define authorized admin users (only these should have admin role)
    const authorizedAdmins = [
      'andinhc254@gmail.com',  // Main admin
      'Admin'                   // Secondary admin
    ];

    // Define authorized uploader users
    const authorizedUploaders = [
      'asuke'                   // Known uploader
    ];

    console.log('\n=== FIXING USER ROLES ===\n');
    
    let fixedCount = 0;
    
    for (const user of users) {
      let shouldUpdate = false;
      let newRole = user.role;
      let reason = '';

      // Check if user should have admin role
      if (user.role === 'admin') {
        if (!authorizedAdmins.includes(user.username) && !authorizedAdmins.includes(user.email)) {
          newRole = 'user';
          shouldUpdate = true;
          reason = 'Unauthorized admin role - demoting to user';
          console.log(`⚠️  ${user.username}: Unauthorized admin role detected!`);
        }
      }
      
      // Check if user should have uploader role
      else if (user.role === 'uploader') {
        if (!authorizedUploaders.includes(user.username) && !authorizedUploaders.includes(user.email) && 
            !authorizedAdmins.includes(user.username) && !authorizedAdmins.includes(user.email)) {
          newRole = 'user';
          shouldUpdate = true;
          reason = 'Unauthorized uploader role - demoting to user';
          console.log(`⚠️  ${user.username}: Unauthorized uploader role detected!`);
        }
      }

      // Update user if needed
      if (shouldUpdate) {
        user.role = newRole;
        await user.save();
        console.log(`✅ Fixed ${user.username}: ${user.role} → ${newRole} (${reason})`);
        fixedCount++;
      } else {
        console.log(`✅ ${user.username}: Role ${user.role} is correct`);
      }
    }

    // Final verification
    console.log('\n=== FINAL VERIFICATION ===\n');
    const finalUsers = await User.find({});
    
    for (const user of finalUsers) {
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Status: ${user.role === 'admin' ? '🔴 ADMIN' : user.role === 'uploader' ? '🟡 UPLOADER' : '🟢 USER'}`);
      console.log('---');
    }

    console.log(`\n🎉 Role fixing completed!`);
    console.log(`Fixed ${fixedCount} users with incorrect roles`);
    
    console.log('\n📋 SECURITY POLICY:');
    console.log('• New users get "user" role by default');
    console.log('• Only authorized users can have "admin" role');
    console.log('• Only authorized users can have "uploader" role');
    console.log('• Admin roles must be assigned through admin panel');
    
    console.log('\n🔐 AUTHORIZED ADMIN USERS:');
    authorizedAdmins.forEach(admin => console.log(`  - ${admin}`));
    
    console.log('\n📤 AUTHORIZED UPLOADER USERS:');
    authorizedUploaders.forEach(uploader => console.log(`  - ${uploader}`));

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

fixUserRoles();
