import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT;
const R2_PUBLIC_DOMAIN = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN;
const R2_REGION = process.env.R2_REGION || 'auto';

// Check environment variables at runtime
function validateR2Config() {
  const missingVars = [];
  if (!R2_ACCOUNT_ID) missingVars.push('CLOUDFLARE_R2_ACCOUNT_ID');
  if (!R2_ACCESS_KEY_ID) missingVars.push('CLOUDFLARE_R2_ACCESS_KEY_ID');
  if (!R2_SECRET_ACCESS_KEY) missingVars.push('CLOUDFLARE_R2_SECRET_ACCESS_KEY');
  if (!R2_BUCKET_NAME) missingVars.push('CLOUDFLARE_R2_BUCKET_NAME');
  if (!R2_ENDPOINT) missingVars.push('CLOUDFLARE_R2_ENDPOINT');
  if (!R2_PUBLIC_DOMAIN) missingVars.push('CLOUDFLARE_R2_PUBLIC_DOMAIN');
  
  if (missingVars.length > 0) {
    throw new Error(`Missing R2 environment variables: ${missingVars.join(', ')}`);
  }
}

const s3Client = new S3Client({
  region: R2_REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function uploadImage(
  key: string,
  buffer: Buffer,
  contentType: string,
  metadata?: Record<string, string>
) {
  try {
    // Validate configuration before attempting upload
    validateR2Config();
    
    console.log('R2 upload attempt:', {
      key,
      bufferSize: buffer.length,
      contentType,
      bucket: R2_BUCKET_NAME,
      endpoint: R2_ENDPOINT
    });
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
    });

    const result = await s3Client.send(command);
    console.log('R2 upload successful:', {
      key,
      etag: result.ETag,
      url: getPublicImageUrl(key)
    });
    
    return {
      success: true,
      key,
      etag: result.ETag,
      url: getPublicImageUrl(key),
    };
  } catch (error) {
    console.error('Error uploading to R2:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      key,
      bufferSize: buffer.length,
      contentType
    });
    
    // Check for specific AWS/R2 errors
    if (error instanceof Error) {
      if (error.name === 'AccessDenied') {
        return {
          success: false,
          error: 'Access denied to R2 bucket. Check credentials and permissions.',
        };
      }
      if (error.name === 'NoSuchBucket') {
        return {
          success: false,
          error: 'R2 bucket does not exist. Check bucket name configuration.',
        };
      }
      if (error.name === 'InvalidAccessKeyId') {
        return {
          success: false,
          error: 'Invalid R2 access key. Check credentials.',
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteImage(key: string) {
  try {
    validateR2Config();
    
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error deleting from R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getSignedImageUrl(key: string, expiresIn: number = 3600) {
  try {
    validateR2Config();
    
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
}

export function getPublicImageUrl(key: string) {
  // Use the public domain if available, otherwise fall back to the endpoint
  if (R2_PUBLIC_DOMAIN) {
    return `https://${R2_PUBLIC_DOMAIN}/${key}`;
  }
  return `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`;
}

export function generateImageKey(folder: string, filename: string, timestamp: number) {
  const extension = filename.split('.').pop();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${folder}/${timestamp}_${sanitizedFilename}`;
}
