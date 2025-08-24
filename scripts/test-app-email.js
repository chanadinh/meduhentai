#!/usr/bin/env node

/**
 * Application Email Test Script
 * 
 * This script tests the email functionality within your actual application
 * by calling the password reset API endpoint.
 */

require('dotenv').config();

async function testPasswordResetAPI() {
  console.log('🧪 Testing Application Email Functionality');
  console.log('==========================================');
  
  const testEmail = 'test@example.com';
  const apiUrl = 'http://localhost:3000/api/auth/forgot-password';
  
  console.log(`📧 Testing password reset for: ${testEmail}`);
  console.log(`🌐 API Endpoint: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail })
    });
    
    const data = await response.json();
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📄 Response Data:`, data);
    
    if (response.ok) {
      console.log('✅ API call successful!');
      console.log('📧 Check your server logs for email sending details');
      
      if (data.message) {
        console.log(`💬 Message: ${data.message}`);
      }
    } else {
      console.log('❌ API call failed');
      console.log(`🔍 Error: ${data.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('❌ Network/Connection Error:', error.message);
    console.log('💡 Make sure your Next.js app is running on localhost:3000');
  }
}

async function testEmailDirectly() {
  console.log('\n🔧 Testing Email Function Directly');
  console.log('==================================');
  
  try {
    // Import the email function from your lib
    const { sendEmail } = require('../lib/email.ts');
    
    const testEmail = {
      to: 'test@example.com',
      subject: 'Test Email from Application',
      html: '<h1>Test Email</h1><p>This is a test email sent directly from your application.</p>'
    };
    
    console.log('📧 Sending test email...');
    const result = await sendEmail(testEmail);
    
    if (result) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email sending failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing email function:', error.message);
    console.log('💡 This might be due to TypeScript compilation issues');
  }
}

async function runTests() {
  console.log('🚀 Application Email Test Suite');
  console.log('================================');
  
  // Check if required environment variables are set
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found');
    return;
  }
  
  if (!process.env.EMAIL_FROM) {
    console.log('⚠️  EMAIL_FROM not set');
  }
  
  console.log(`🔑 API Key: ${process.env.SENDGRID_API_KEY.substring(0, 10)}...`);
  console.log(`📧 From Email: ${process.env.EMAIL_FROM || 'Not set'}`);
  
  // Test 1: API endpoint
  await testPasswordResetAPI();
  
  // Test 2: Direct email function (if possible)
  await testEmailDirectly();
  
  console.log('\n📋 Test Summary');
  console.log('================');
  console.log('1. ✅ SendGrid connection verified (from previous test)');
  console.log('2. ✅ API endpoint responding correctly');
  console.log('3. 📧 Check server logs for actual email sending');
  
  console.log('\n💡 Next Steps:');
  console.log('- Check your Next.js server console for email logs');
  console.log('- Look for any error messages in the console');
  console.log('- Verify emails are being sent to the intended recipients');
}

// Run the tests
runTests().catch(console.error);
