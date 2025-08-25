const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

async function setupR2CORS() {
  try {
    console.log('Setting up R2 CORS configuration...');
    
    // Initialize S3 client for R2
    const s3Client = new S3Client({
      region: process.env.R2_REGION || 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });

    // CORS configuration
    const corsConfig = {
      CORSRules: [
        {
          AllowedOrigins: [
            'https://meduhentai.com',
            'https://www.meduhentai.com',
            'http://localhost:3000'
          ],
          AllowedMethods: [
            'GET',
            'PUT',
            'POST',
            'DELETE',
            'HEAD'
          ],
          AllowedHeaders: [
            '*'
          ],
          ExposeHeaders: [
            'ETag',
            'x-amz-meta-*'
          ],
          MaxAgeSeconds: 3600
        }
      ]
    };

    console.log('CORS Configuration:', JSON.stringify(corsConfig, null, 2));
    console.log('Bucket:', process.env.CLOUDFLARE_R2_BUCKET_NAME);
    console.log('Endpoint:', process.env.CLOUDFLARE_R2_ENDPOINT);

    // Apply CORS configuration
    const command = new PutBucketCorsCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      CORSConfiguration: corsConfig
    });

    await s3Client.send(command);
    
    console.log('✅ CORS configuration applied successfully!');
    console.log('\nYour R2 bucket now allows direct uploads from:');
    corsConfig.CORSRules[0].AllowedOrigins.forEach(origin => {
      console.log(`  - ${origin}`);
    });
    
    console.log('\nDirect uploads should now work without CORS errors.');
    console.log('Note: Changes may take a few minutes to propagate.');

  } catch (error) {
    console.error('❌ Error setting up R2 CORS:', error);
    
    if (error.name === 'AccessDenied') {
      console.error('\nAccess denied. Check your R2 credentials and permissions.');
    } else if (error.name === 'NoSuchBucket') {
      console.error('\nBucket not found. Check your bucket name.');
    } else if (error.name === 'InvalidAccessKeyId') {
      console.error('\nInvalid access key. Check your R2 credentials.');
    }
    
    console.error('\nYou may need to set up CORS manually through the Cloudflare dashboard.');
  }
}

// Run the setup
setupR2CORS();
