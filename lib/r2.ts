import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT!;
const R2_PUBLIC_DOMAIN = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN!;
const R2_REGION = process.env.R2_REGION || 'auto';

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_ENDPOINT) {
  throw new Error('Missing R2 environment variables. Please check CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET_NAME, and CLOUDFLARE_R2_ENDPOINT');
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
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    Metadata: metadata,
  });

  try {
    const result = await s3Client.send(command);
    return {
      success: true,
      key,
      etag: result.ETag,
      url: getPublicImageUrl(key),
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function deleteImage(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  try {
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
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  try {
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
