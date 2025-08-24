#!/usr/bin/env node

/**
 * SendGrid Connection Test Script
 * 
 * This script helps troubleshoot SendGrid SMTP connection issues
 * by testing different configurations and providing detailed error information.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Test configurations to try
const testConfigs = [
  {
    name: 'Port 587 (STARTTLS)',
    config: {
      host: 'smtp.sendgrid.net',
      port: 587,
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
    }
  },
  {
    name: 'Port 2525 (STARTTLS)',
    config: {
      host: 'smtp.sendgrid.net',
      port: 2525,
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
    }
  },
  {
    name: 'Port 25 (STARTTLS)',
    config: {
      host: 'smtp.sendgrid.net',
      port: 25,
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
    }
  }
];

async function testConnection(config, configName) {
  console.log(`\n🔍 Testing: ${configName}`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Secure: ${config.secure}`);
  console.log(`   Require TLS: ${config.requireTLS}`);
  
  try {
    const transporter = nodemailer.createTransport(config);
    
    // Test connection
    await transporter.verify();
    console.log(`   ✅ Connection successful!`);
    
    // Test sending a simple email
    const testEmail = {
      from: process.env.EMAIL_FROM || 'test@example.com',
      to: 'test@example.com',
      subject: 'SendGrid Test',
      text: 'This is a test email from SendGrid'
    };
    
    const info = await transporter.sendMail(testEmail);
    console.log(`   ✅ Email sent successfully!`);
    console.log(`   Message ID: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log(`   🔑 Authentication Error - Check your API key`);
    } else if (error.code === 'ECONNECTION') {
      console.log(`   🌐 Connection Error - Check network/firewall`);
    } else if (error.code === 'ETIMEDOUT') {
      console.log(`   ⏰ Timeout Error - Port might be blocked`);
    }
    
    return false;
  }
}

async function runTests() {
  console.log('🚀 SendGrid Connection Test Suite');
  console.log('=====================================');
  
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    console.log('\nPlease add to your .env file:');
    console.log('SENDGRID_API_KEY=your_actual_api_key_here');
    process.exit(1);
  }
  
  if (!process.env.EMAIL_FROM) {
    console.log('⚠️  EMAIL_FROM not set, using test@example.com');
  }
  
  console.log(`\n📧 API Key: ${process.env.SENDGRID_API_KEY.substring(0, 10)}...`);
  console.log(`📧 From Email: ${process.env.EMAIL_FROM || 'test@example.com'}`);
  
  let successCount = 0;
  
  for (const testConfig of testConfigs) {
    const success = await testConnection(testConfig.config, testConfig.name);
    if (success) successCount++;
  }
  
  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`✅ Successful: ${successCount}/${testConfigs.length}`);
  console.log(`❌ Failed: ${testConfigs.length - successCount}/${testConfigs.length}`);
  
  if (successCount === 0) {
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Verify your SendGrid API key is correct');
    console.log('2. Check if API key has full permissions');
    console.log('3. Try different ports (587, 2525, 25)');
    console.log('4. Ensure TLS 1.2+ is supported');
    console.log('5. Check firewall/network restrictions');
    console.log('6. Verify sender authentication is configured');
  } else {
    console.log('\n🎉 At least one configuration works!');
    console.log('Use the working configuration in your application.');
  }
}

// Run the tests
runTests().catch(console.error);
