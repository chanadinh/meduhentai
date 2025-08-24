#!/usr/bin/env node

/**
 * Test Environment Variables in API Context
 * 
 * This script checks if environment variables are being loaded correctly
 * and if there are any differences between test and API contexts.
 */

require('dotenv').config();

console.log('🔍 Environment Variables Check');
console.log('===============================');

const requiredVars = [
  'SENDGRID_API_KEY',
  'EMAIL_FROM',
  'MONGODB_URI',
  'NEXTAUTH_URL',
  'NODE_ENV'
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

console.log('\n🔧 Testing Email Function Import');
console.log('=================================');

try {
  // Try to import the email function
  const { sendEmail } = require('../lib/email.ts');
  console.log('✅ Email function imported successfully');
  
  // Test if we can call it
  console.log('📧 Testing email function call...');
  const testResult = sendEmail({
    to: 'test@example.com',
    subject: 'Test',
    html: '<p>Test</p>'
  });
  
  console.log('✅ Email function call successful');
  
} catch (error) {
  console.error('❌ Failed to import or call email function:', error.message);
  console.error('Stack trace:', error.stack);
}

console.log('\n📋 Summary');
console.log('===========');
console.log('1. Environment variables checked');
console.log('2. Email function import tested');
console.log('3. Email function call tested');
