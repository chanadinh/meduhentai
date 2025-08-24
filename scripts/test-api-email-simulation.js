#!/usr/bin/env node

/**
 * API Email Simulation Test
 * 
 * This script simulates exactly what happens in the API route
 * to identify why emails are failing there but working in direct tests.
 */

require('dotenv').config();

async function simulateAPIRoute() {
  console.log('🧪 Simulating API Route Email Sending');
  console.log('=====================================');
  
  try {
    // Simulate the exact flow from the API route
    const { connectToDatabase } = require('../lib/mongodb');
    const User = require('../models/User');
    const crypto = require('crypto');
    const { sendPasswordResetEmail } = require('../lib/email');
    
    console.log('✅ All modules imported successfully');
    
    // Simulate the API route logic
    const email = 'andinhc254@gmail.com';
    console.log(`📧 Processing password reset for: ${email}`);
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected');
    
    // Find user by email
    console.log('👤 Looking up user...');
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ User found: ${user.username}`);
    
    // Generate reset token
    console.log('🔑 Generating reset token...');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Save reset token to user
    console.log('💾 Saving reset token...');
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();
    console.log('✅ Reset token saved');
    
    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://meduhentai.com'}/auth/reset-password?token=${resetToken}`;
    console.log(`🔗 Reset URL: ${resetUrl}`);
    
    // Send password reset email
    console.log('📧 Sending password reset email...');
    try {
      const emailSent = await sendPasswordResetEmail(email, resetUrl, user.username);
      if (emailSent) {
        console.log('✅ Password reset email sent successfully!');
      } else {
        console.log('❌ Password reset email sending failed');
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      console.error('Error details:', {
        message: emailError.message,
        code: emailError.code,
        stack: emailError.stack
      });
    }
    
  } catch (error) {
    console.error('❌ Simulation failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔍 Environment Variables Check');
  console.log('===============================');
  
  const requiredVars = [
    'SENDGRID_API_KEY',
    'EMAIL_FROM',
    'MONGODB_URI',
    'NEXTAUTH_URL'
  ];
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      if (varName === 'SENDGRID_API_KEY') {
        console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: Not set`);
    }
  }
}

async function testEmailFunctionInContext() {
  console.log('\n📧 Testing Email Function in API Context');
  console.log('=========================================');
  
  try {
    const { sendPasswordResetEmail } = require('../lib/email');
    
    // Test with the same parameters as the API route
    const testEmail = 'andinhc254@gmail.com';
    const testResetUrl = 'https://meduhentai.com/auth/reset-password?token=test123';
    const testUsername = 'testuser';
    
    console.log('📧 Sending test email...');
    const result = await sendPasswordResetEmail(testEmail, testResetUrl, testUsername);
    
    if (result) {
      console.log('✅ Test email sent successfully!');
    } else {
      console.log('❌ Test email sending failed');
    }
    
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
}

async function runSimulation() {
  console.log('🚀 API Route Email Simulation Test');
  console.log('==================================');
  
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
  await testEnvironmentVariables();
  await testEmailFunctionInContext();
  await simulateAPIRoute();
  
  console.log('\n📋 Simulation Summary');
  console.log('======================');
  console.log('1. ✅ Environment variables checked');
  console.log('2. 📧 Email function tested in context');
  console.log('3. 🔄 API route flow simulated');
  console.log('4. 📊 Results analyzed');
}

// Run the simulation
runSimulation().catch(console.error);
