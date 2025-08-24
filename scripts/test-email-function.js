#!/usr/bin/env node

/**
 * Test Email Function Script
 * 
 * This script tests the actual email function used in the application
 * to identify why emails are failing to send.
 */

require('dotenv').config();

async function testEmailFunction() {
  console.log('🧪 Testing Application Email Function');
  console.log('=====================================');
  
  try {
    // Import the email function from your lib
    const { sendEmail, sendPasswordResetEmail } = require('../lib/email.ts');
    
    console.log('✅ Email functions imported successfully');
    
    // Test 1: Basic email sending
    console.log('\n📧 Test 1: Basic email sending');
    const testEmail = {
      to: 'andinhc254@gmail.com',
      subject: 'Test Email from Application',
      html: '<h1>Test Email</h1><p>This is a test email sent directly from your application.</p>'
    };
    
    console.log('Sending test email...');
    const result = await sendEmail(testEmail);
    
    if (result) {
      console.log('✅ Basic email sent successfully!');
    } else {
      console.log('❌ Basic email sending failed');
    }
    
    // Test 2: Password reset email
    console.log('\n📧 Test 2: Password reset email');
    const resetUrl = 'https://meduhentai.com/auth/reset-password?token=test123';
    const username = 'testuser';
    
    console.log('Sending password reset email...');
    const resetResult = await sendPasswordResetEmail('andinhc254@gmail.com', resetUrl, username);
    
    if (resetResult) {
      console.log('✅ Password reset email sent successfully!');
    } else {
      console.log('❌ Password reset email sending failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing email function:', error);
    console.log('💡 This might be due to TypeScript compilation issues');
    
    // Try to get more details about the error
    if (error.stack) {
      console.log('Stack trace:', error.stack);
    }
  }
}

async function testDirectNodemailer() {
  console.log('\n🔧 Testing Direct Nodemailer Configuration');
  console.log('==========================================');
  
  try {
    const nodemailer = require('nodemailer');
    
    // Use the same configuration as your application
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: parseInt(process.env.SENDGRID_PORT || '587'),
      secure: false,
      requireTLS: true,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      },
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
    
    console.log('✅ Transporter created successfully');
    
    // Test connection
    await transporter.verify();
    console.log('✅ Connection verified successfully');
    
    // Test sending email
    const testEmail = {
      from: process.env.EMAIL_FROM || 'test@example.com',
      to: 'andinhc254@gmail.com',
      subject: 'Direct Nodemailer Test',
      text: 'This is a test email sent directly with nodemailer'
    };
    
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Direct email sent successfully!');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Direct nodemailer test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('🔑 Authentication Error - Check your API key');
    } else if (error.code === 'ECONNECTION') {
      console.log('🌐 Connection Error - Check network/firewall');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⏰ Timeout Error - Port might be blocked');
    }
  }
}

async function runTests() {
  console.log('🚀 Email Function Test Suite');
  console.log('=============================');
  
  // Check environment variables
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found');
    return;
  }
  
  if (!process.env.EMAIL_FROM) {
    console.log('⚠️  EMAIL_FROM not set');
  }
  
  console.log(`🔑 API Key: ${process.env.SENDGRID_API_KEY.substring(0, 10)}...`);
  console.log(`📧 From Email: ${process.env.EMAIL_FROM || 'Not set'}`);
  console.log(`🌐 Port: ${process.env.SENDGRID_PORT || '587'}`);
  
  // Run tests
  await testEmailFunction();
  await testDirectNodemailer();
  
  console.log('\n📋 Test Summary');
  console.log('================');
  console.log('1. ✅ SendGrid connection verified (from previous test)');
  console.log('2. 📧 Testing actual email functions...');
  console.log('3. 🔧 Testing direct nodemailer configuration...');
}

// Run the tests
runTests().catch(console.error);
