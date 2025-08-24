const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Manga = require('../models/Manga');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

async function testNotifications() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Find test users
    const testUser = await User.findOne({ username: 'testuser' });
    const testUploader = await User.findOne({ username: 'testuploader' });
    
    if (!testUser || !testUploader) {
      console.log('Test users not found. Creating them...');
      
      // Create test uploader if it doesn't exist
      if (!testUploader) {
        const newUploader = await User.create({
          username: 'testuploader',
          email: 'testuploader@test.com',
          password: 'testpass123',
          role: 'uploader'
        });
        console.log('Created test uploader:', newUploader.username);
      }
      
      // Create test user if it doesn't exist
      if (!testUser) {
        const newUser = await User.create({
          username: 'testuser',
          email: 'testuser@test.com',
          password: 'testpass123',
          role: 'user'
        });
        console.log('Created test user:', newUser.username);
      }
    }

    // Find or create test manga
    let testManga = await Manga.findOne({ title: 'Test Manga' });
    if (!testManga) {
      testManga = await Manga.create({
        title: 'Test Manga',
        description: 'A test manga for notification testing',
        coverImage: 'https://via.placeholder.com/300x400',
        genres: ['test', 'Ahegao', 'Anal', 'BDSM'],
    
        author: 'Test Author',
        artist: 'Test Artist',
        status: 'ongoing',
        userId: testUploader._id
      });
      console.log('Created test manga:', testManga.title);
    }

    // Create a test comment
    const testComment = await Comment.create({
      content: 'This is a test comment to test notifications',
      user: testUser._id,
      manga: testManga._id,
      isDeleted: false
    });
    console.log('Created test comment:', testComment.content);

    // Check if notification was created
    const notification = await Notification.findOne({
      userId: testUploader._id,
      type: 'manga_comment',
      'data.commentId': testComment._id
    });

    if (notification) {
      console.log('✅ Notification created successfully!');
      console.log('Notification details:', {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        recipient: testUploader.username,
        from: testUser.username
      });
    } else {
      console.log('❌ No notification found');
    }

    // Clean up test data
    await Comment.findByIdAndDelete(testComment._id);
    await Notification.deleteMany({
      userId: testUploader._id,
      type: 'manga_comment'
    });
    console.log('Cleaned up test data');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

testNotifications();
