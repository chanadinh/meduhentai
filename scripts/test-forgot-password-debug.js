#!/usr/bin/env node

/**
 * Debug Script for Forgot Password Message Channel Error
 * 
 * This script helps identify the exact cause of the message channel error
 * by testing the API endpoint and response handling.
 */

require('dotenv').config();

async function testForgotPasswordAPI() {
  console.log('🔍 Debugging Forgot Password Message Channel Error');
  console.log('==================================================');
  
  const testEmails = [
    'test@example.com',
    'nonexistent@example.com',
    'invalid-email',
    ''
  ];
  
  for (const email of testEmails) {
    console.log(`\n📧 Testing with email: "${email}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`   Response:`, data);
        } catch (parseError) {
          console.log(`   Parse Error:`, parseError.message);
        }
      } else {
        try {
          const errorData = await response.json();
          console.log(`   Error Response:`, errorData);
        } catch (parseError) {
          console.log(`   Error Parse Error:`, parseError.message);
        }
      }
      
    } catch (error) {
      console.log(`   Network Error:`, error.message);
    }
  }
}

async function testWithRealUser() {
  console.log('\n👤 Testing with a real user email from your database...');
  
  // You can replace this with an actual email from your database
  const realEmail = process.env.TEST_EMAIL || 'em8943@meduhentai.com';
  
  if (realEmail) {
    console.log(`📧 Testing with real email: ${realEmail}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: realEmail }),
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Response:`, data);
        
        // Check if the user actually exists and token was generated
        console.log(`   ✅ API call successful`);
        console.log(`   📧 Check if email was actually sent`);
      } else {
        const errorData = await response.json();
        console.log(`   Error:`, errorData);
      }
      
    } catch (error) {
      console.log(`   Network Error:`, error.message);
    }
  } else {
    console.log('   ⚠️  No TEST_EMAIL set in environment variables');
  }
}

async function checkServerLogs() {
  console.log('\n📋 Server Logs Analysis');
  console.log('========================');
  console.log('1. Check your Next.js server console for any errors');
  console.log('2. Look for database connection issues');
  console.log('3. Check for email sending errors');
  console.log('4. Verify MongoDB connection');
  console.log('5. Check for any middleware errors');
  
  console.log('\n🔍 Common causes of message channel errors:');
  console.log('- Service worker conflicts');
  console.log('- Browser extension interference');
  console.log('- Network request timeouts');
  console.log('- Response parsing issues');
  console.log('- Async/await handling problems');
}

async function runDebugTests() {
  console.log('🚀 Forgot Password Debug Suite');
  console.log('===============================');
  
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
  await testForgotPasswordAPI();
  await testWithRealUser();
  await checkServerLogs();
  
  console.log('\n💡 Next Steps:');
  console.log('1. Check browser console for the exact error message');
  console.log('2. Look for any service worker errors');
  console.log('3. Test in an incognito/private browser window');
  console.log('4. Disable browser extensions temporarily');
  console.log('5. Check if the error occurs in different browsers');
}

// Run the debug tests
runDebugTests().catch(console.error);
