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

    const body = await request.json();
    const { type, mangaId, title, chapterNumber, volume, pageCount, fileName, contentType } = body;

    // Validate input
    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400 }
      );
    }

    if (type === 'manga-cover') {
      // Handle manga cover upload
      if (!fileName || !contentType) {
        return NextResponse.json(
          { error: 'Missing required fields for manga cover: fileName, contentType' },
          { status: 400 }
        );
      }

      // Generate unique key for cover image
      const timestamp = Date.now();
      const extension = fileName.split('.').pop();
      const sanitizedFilename = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `manga-covers/${timestamp}_${sanitizedFilename}`;

      // Create presigned URL for PUT operation
      const putObjectCommand = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME!,
        Key: key,
        ContentType: contentType,
        Metadata: {
          uploadedBy: session.user.id,
          uploadedAt: timestamp.toString(),
          originalFilename: fileName,
          type: 'manga-cover',
        },
      });

      // Generate presigned URL that expires in 1 hour
      const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: 3600, // 1 hour
      });

      return NextResponse.json({
        success: true,
        presignedUrl,
        fileKey: key,
        bucket: R2_BUCKET_NAME,
        expiresIn: 3600,
      });

    } else if (type === 'chapter-pages') {
      // Handle chapter pages upload
      if (!mangaId || !title || !chapterNumber || !pageCount) {
        return NextResponse.json(
          { error: 'Missing required fields for chapter pages: mangaId, title, chapterNumber, pageCount' },
          { status: 400 }
        );
      }

      // Generate unique chapter ID
      const chapterId = `${mangaId}_${chapterNumber}_${Date.now()}`;
      const presignedUrls: string[] = [];
      const fileKeys: string[] = [];

      // Generate presigned URLs for each page
      for (let i = 1; i <= pageCount; i++) {
        const timestamp = Date.now();
        // Use a generic extension since we don't know the actual file extension at this point
        const key = `chapters/${mangaId}/${chapterId}/page_${i}`;

        const putObjectCommand = new PutObjectCommand({
          Bucket: R2_BUCKET_NAME!,
          Key: key,
          ContentType: 'image/jpeg',
          Metadata: {
            uploadedBy: session.user.id,
            uploadedAt: timestamp.toString(),
            mangaId: mangaId,
            chapterNumber: chapterNumber.toString(),
            pageNumber: i.toString(),
            type: 'chapter-page',
          },
        });

        const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
          expiresIn: 3600, // 1 hour
        });

        presignedUrls.push(presignedUrl);
        fileKeys.push(key);
      }

      return NextResponse.json({
        success: true,
        presignedUrls,
        fileKeys,
        chapterId,
        bucket: R2_BUCKET_NAME,
        expiresIn: 3600,
      });

    } else if (type === 'chapter-page') {
      // Handle individual chapter page upload
      const { mangaId, chapterNumber, pageNumber, fileName, contentType } = body;
      
      if (!mangaId || !chapterNumber || !pageNumber || !fileName || !contentType) {
        return NextResponse.json(
          { error: 'Missing required fields for chapter page: mangaId, chapterNumber, pageNumber, fileName, contentType' },
          { status: 400 }
        );
      }

      // Generate unique key for the page
      const timestamp = Date.now();
      const extension = fileName.split('.').pop();
      const sanitizedFilename = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `chapters/${mangaId}/chapter_${chapterNumber}/page_${pageNumber}_${timestamp}.${extension}`;

      // Create presigned URL for PUT operation
      const putObjectCommand = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME!,
        Key: key,
        ContentType: contentType,
        Metadata: {
          uploadedBy: session.user.id,
          uploadedAt: timestamp.toString(),
          mangaId: mangaId,
          chapterNumber: chapterNumber.toString(),
          pageNumber: pageNumber.toString(),
          type: 'chapter-page',
        },
      });

      // Generate presigned URL that expires in 1 hour
      const presignedUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: 3600, // 1 hour
      });

      return NextResponse.json({
        success: true,
        presignedUrl,
        fileKey: key,
        bucket: R2_BUCKET_NAME,
        expiresIn: 3600,
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid type. Must be "manga-cover", "chapter-pages", or "chapter-page"' },
        { status: 400 }
      );
    }

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
