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
  role: String
});

const User = mongoose.model('User', userSchema);

async function verifyPasswords() {
  try {
    console.log('Connected to MongoDB');
    
    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users in database`);
    
    if (users.length === 0) {
      console.log('No users found');
      return;
    }

    console.log('\n=== CURRENT USERS AND PASSWORDS ===\n');
    
    for (const user of users) {
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Original Password: ${user.originalPassword || 'NOT SET'}`);
      console.log(`Hashed Password: ${user.password ? 'SET' : 'NOT SET'}`);
      
      // Test if the original password matches the hash
      if (user.originalPassword && user.password) {
        const isValid = await bcrypt.compare(user.originalPassword, user.password);
        console.log(`Password Match: ${isValid ? 'YES' : 'NO'}`);
      } else {
        console.log(`Password Match: CANNOT TEST`);
      }
      console.log('---');
    }

    // Test login with known passwords
    console.log('\n=== TESTING LOGIN ===\n');
    
    const testPasswords = ['testpass123', 'testpass456', 'password', '123456'];
    
    for (const testPass of testPasswords) {
      for (const user of users) {
        if (user.password) {
          const isValid = await bcrypt.compare(testPass, user.password);
          if (isValid) {
            console.log(`✅ ${user.username} can login with: ${testPass}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

verifyPasswords();
