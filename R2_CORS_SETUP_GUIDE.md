# R2 CORS Setup Guide

## Problem
When using direct R2 uploads with presigned URLs, you get CORS errors:
```
Access to fetch at 'https://project-image.86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com/...' from origin 'https://meduhentai.com' has been blocked by CORS policy
```

## Solution: Configure R2 CORS

### Method 1: Using Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Navigate to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Select your account

2. **Go to R2 Object Storage**
   - Click on "R2 Object Storage" in the left sidebar
   - Select your bucket (`project-image`)

3. **Configure CORS**
   - Click on "Settings" tab
   - Scroll down to "CORS Configuration"
   - Click "Add CORS rule"

4. **Add CORS Rule**
   ```json
   {
     "AllowedOrigins": [
       "https://meduhentai.com",
       "https://www.meduhentai.com",
       "http://localhost:3000"
     ],
     "AllowedMethods": [
       "GET",
       "PUT",
       "POST",
       "DELETE",
       "HEAD"
     ],
     "AllowedHeaders": [
       "*"
     ],
     "ExposeHeaders": [
       "ETag",
       "x-amz-meta-*"
     ],
     "MaxAgeSeconds": 3600
   }
   ```

5. **Save the rule**

### Method 2: Using AWS CLI (Alternative)

If you prefer command line:

1. **Install AWS CLI**
   ```bash
   brew install awscli
   ```

2. **Configure credentials**
   ```bash
   aws configure
   # Enter your R2 credentials:
   # AWS Access Key ID: your_r2_access_key
   # AWS Secret Access Key: your_r2_secret_key
   # Default region name: auto
   # Default output format: json
   ```

3. **Create CORS configuration file**
   Create `cors.json`:
   ```json
   {
     "CORSRules": [
       {
         "AllowedOrigins": [
           "https://meduhentai.com",
           "https://www.meduhentai.com",
           "http://localhost:3000"
         ],
         "AllowedMethods": [
           "GET",
           "PUT",
           "POST",
           "DELETE",
           "HEAD"
         ],
         "AllowedHeaders": [
           "*"
         ],
         "ExposeHeaders": [
           "ETag",
           "x-amz-meta-*"
         ],
         "MaxAgeSeconds": 3600
       }
     ]
   }
   ```

4. **Apply CORS configuration**
   ```bash
   aws s3api put-bucket-cors \
     --bucket project-image \
     --cors-configuration file://cors.json \
     --endpoint-url https://86a9e43542ceb9d9b531800759299f28.r2.cloudflarestorage.com
   ```

### Method 3: Using R2 API (Programmatic)

You can also set CORS programmatically using the R2 API:

```typescript
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const corsConfig = {
  CORSRules: [
    {
      AllowedOrigins: [
        'https://meduhentai.com',
        'https://www.meduhentai.com',
        'http://localhost:3000'
      ],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag', 'x-amz-meta-*'],
      MaxAgeSeconds: 3600
    }
  ]
};

await s3Client.send(new PutBucketCorsCommand({
  Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  CORSConfiguration: corsConfig
}));
```

## Important Notes

1. **AllowedOrigins**: Include all domains that will upload to R2
   - Production: `https://meduhentai.com`
   - Development: `http://localhost:3000`

2. **AllowedMethods**: Must include `PUT` for direct uploads

3. **AllowedHeaders**: `*` allows all headers (including custom metadata)

4. **ExposeHeaders**: Include `ETag` and `x-amz-meta-*` for proper response handling

5. **MaxAgeSeconds**: How long browsers cache CORS preflight responses

## Testing

After setting up CORS:

1. **Test direct upload** from your admin panel
2. **Check browser console** for CORS errors
3. **Verify files upload** to R2 successfully

## Troubleshooting

- **CORS still failing?** Check that the rule was saved and applied
- **Wrong domain?** Ensure your domain is exactly correct in AllowedOrigins
- **Method not allowed?** Verify PUT is in AllowedMethods
- **Headers blocked?** Check AllowedHeaders includes what you need

## Alternative: Server-Side Upload

If CORS setup is problematic, you can fall back to server-side uploads:
- Files go through your API first
- No CORS issues
- But limited by server processing limits
