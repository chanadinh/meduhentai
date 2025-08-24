import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const folder = formData.get('folder') as string || 'uploads';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploads: Array<{
      originalName: string;
      filename: string;
      url: string;
      size: number;
      type: string;
    }> = [];

    for (const file of files) {
      if (!file || !(file instanceof File)) {
        continue;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `${folder}/${timestamp}-${randomString}.${extension}`;

      // Convert file to buffer
      const buffer = await file.arrayBuffer();

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
        Key: filename,
        Body: Buffer.from(buffer),
        ContentType: file.type,
      });

      await s3Client.send(command);

      // Generate public URL using the configured public domain
      const publicUrl = `https://${process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${filename}`;

      uploads.push({
        originalName: file.name,
        filename: filename,
        url: publicUrl,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      uploads: uploads,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
