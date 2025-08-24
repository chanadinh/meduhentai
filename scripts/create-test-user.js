const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meduhentai');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Username: testuser');
      console.log('Password: testpass123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('testpass123', 10);

    // Create test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    });

    await testUser.save();
    console.log('Test user created successfully!');
    console.log('Username: testuser');
    console.log('Password: testpass123');
    console.log('You can now use these credentials to sign in and test comments!');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUser();
