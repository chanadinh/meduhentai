import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT;
const R2_REGION = process.env.R2_REGION || 'auto';

const s3Client = new S3Client({
  region: R2_REGION,
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has admin or uploader privileges
    if (session.user.role !== 'admin' && session.user.role !== 'uploader') {
      return NextResponse.json(
        { error: 'Not authorized - admin or uploader access required' },
        { status: 403 }
      );
    }

    const { filename, contentType, folder, fileSize } = await request.json();

    // Validate input
    if (!filename || !contentType || !folder) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, contentType, folder' },
        { status: 400 }
      );
    }

    // Validate file size (1GB limit)
    const maxSize = 1024 * 1024 * 1024; // 1GB
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 1GB limit' },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Generate unique key for the file
    const timestamp = Date.now();
    const extension = filename.split('.').pop();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${timestamp}_${sanitizedFilename}`;

    // Create presigned URL for PUT operation
    const putObjectCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
      Metadata: {
        uploadedBy: session.user.id,
        uploadedAt: timestamp.toString(),
        originalFilename: filename,
      },
    });

    // Generate presigned URL that expires in 1 hour
    const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600, // 1 hour
    });

    // Return the presigned URL and file information
    return NextResponse.json({
      success: true,
      presignedUrl,
      key,
      bucket: R2_BUCKET_NAME,
      expiresIn: 3600,
      uploadInfo: {
        filename,
        contentType,
        folder,
        key,
        uploadedBy: session.user.id,
        uploadedAt: timestamp,
      },
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
