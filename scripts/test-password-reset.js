#!/usr/bin/env node

/**
 * Test Password Reset Functionality
 * 
 * This script tests the complete password reset flow to verify
 * that passwords are being updated correctly in MongoDB.
 */

require('dotenv').config();

async function testPasswordResetFlow() {
  console.log('🧪 Testing Password Reset Flow');
  console.log('===============================');
  
  try {
    // Step 1: Request password reset
    console.log('\n📧 Step 1: Requesting password reset...');
    const email = 'andinhc254@gmail.com';
    
    const resetRequest = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!resetRequest.ok) {
      throw new Error(`Failed to request password reset: ${resetRequest.status}`);
    }
    
    const resetData = await resetRequest.json();
    console.log('✅ Password reset requested:', resetData.message);
    
    // Step 2: Check if user has reset token in database
    console.log('\n🔍 Step 2: Checking database for reset token...');
    
    const { connectToDatabase } = require('../lib/mongodb');
    const User = require('../models/User');
    
    await connectToDatabase();
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('User not found in database');
    }
    
    console.log('✅ User found:', {
      userId: user._id,
      email: user.email,
      username: user.username,
      hasResetToken: !!user.resetToken,
      hasResetTokenExpiry: !!user.resetTokenExpiry,
      resetTokenExpiry: user.resetTokenExpiry
    });
    
    if (!user.resetToken) {
      throw new Error('No reset token found in database');
    }
    
    // Step 3: Test password reset with the token
    console.log('\n🔐 Step 3: Testing password reset...');
    const newPassword = 'newtestpassword123';
    
    const resetResponse = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        token: user.resetToken,
        password: newPassword 
      }),
    });
    
    if (!resetResponse.ok) {
      const errorData = await resetResponse.json();
      throw new Error(`Password reset failed: ${errorData.message}`);
    }
    
    const resetResult = await resetResponse.json();
    console.log('✅ Password reset successful:', resetResult.message);
    
    // Step 4: Verify password was updated in database
    console.log('\n🔍 Step 4: Verifying password update in database...');
    
    const updatedUser = await User.findById(user._id);
    if (!updatedUser) {
      throw new Error('User not found after password reset');
    }
    
    console.log('✅ User after password reset:', {
      userId: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username,
      hasPassword: !!updatedUser.password,
      hasResetToken: !!updatedUser.resetToken,
      hasResetTokenExpiry: !!updatedUser.resetTokenExpiry,
      passwordChanged: updatedUser.password !== user.password
    });
    
    if (updatedUser.password === user.password) {
      throw new Error('Password was not updated in database');
    }
    
    if (updatedUser.resetToken || updatedUser.resetTokenExpiry) {
      throw new Error('Reset token was not cleared from database');
    }
    
    console.log('🎉 Password reset test completed successfully!');
    console.log('✅ Password was updated in MongoDB');
    console.log('✅ Reset token was cleared from database');
    
  } catch (error) {
    console.error('❌ Password reset test failed:', error.message);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

async function checkDatabaseConnection() {
  console.log('\n🔌 Testing Database Connection');
  console.log('==============================');
  
  try {
    const { connectToDatabase } = require('../lib/mongodb');
    await connectToDatabase();
    console.log('✅ Database connection successful');
    
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log(`✅ Database accessible, ${userCount} users found`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Password Reset Test Suite');
  console.log('=============================');
  
  // Check if server is running
  try {
    const healthCheck = await fetch('http://localhost:3000');
    console.log('✅ Server is running on localhost:3000');
  } catch (error) {
    console.error('❌ Server is not running on localhost:3000');
    console.log('Please start your Next.js development server first');
    return;
  }
  
  // Run tests
  await checkDatabaseConnection();
  await testPasswordResetFlow();
  
  console.log('\n📋 Test Summary');
  console.log('================');
  console.log('1. ✅ Server connectivity verified');
  console.log('2. 🔌 Database connection tested');
  console.log('3. 🔐 Password reset flow tested');
  console.log('4. 📊 Results analyzed');
}

// Run the tests
runTests().catch(console.error);
