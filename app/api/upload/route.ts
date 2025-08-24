import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/r2';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Debug environment variables in production
    console.log('Environment check:', {
      hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      hasEndpoint: !!process.env.CLOUDFLARE_R2_ENDPOINT,
      hasBucket: !!process.env.CLOUDFLARE_R2_BUCKET_NAME,
      hasPublicDomain: !!process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN,
      hasAccountId: !!process.env.CLOUDFLARE_R2_ACCOUNT_ID,
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL
    });

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const folder = formData.get('folder') as string || 'uploads';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Check file sizes (100MB server limit - Vercel constraint)
    const maxSize = 1024 * 1024 * 1024; // 1GB in bytes (Vercel server limit)
    for (const file of files) {
      if (file.size > maxSize) {
        return NextResponse.json(
          { 
            error: `File ${file.name} is too large. Maximum size is 100MB (server limit). Client limit is 1GB but server processing is capped at 100MB.`,
            fileSize: file.size,
            maxSize: maxSize,
            note: 'Consider using direct R2 uploads for larger files'
          },
          { status: 413 }
        );
      }
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

      // Upload to R2 using the existing utility function
      console.log('Attempting to upload file:', {
        filename,
        size: file.size,
        type: file.type
      });

      let uploadResult;
      try {
        uploadResult = await uploadImage(filename, Buffer.from(buffer), file.type);

        if (!uploadResult.success) {
          console.error('R2 upload error for file:', filename, uploadResult.error);
          throw new Error(`R2 upload failed for ${filename}: ${uploadResult.error}`);
        }

        console.log('Upload result:', uploadResult);
      } catch (uploadError) {
        console.error('Upload function error:', uploadError);
        throw new Error(`Upload function failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
      }

      console.log('File uploaded successfully:', filename);

      uploads.push({
        originalName: file.name,
        filename: filename,
        url: uploadResult.url,
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
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload files';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Missing R2 environment variables')) {
        errorMessage = 'Server configuration error';
        statusCode = 500;
      } else if (error.message.includes('credentials')) {
        errorMessage = 'Authentication failed';
        statusCode = 500;
      } else if (error.message.includes('bucket')) {
        errorMessage = 'Storage bucket error';
        statusCode = 500;
      } else if (error.message.includes('R2 upload failed')) {
        errorMessage = 'File upload to storage failed';
        statusCode = 500;
      } else if (error.message.includes('AccessDenied')) {
        errorMessage = 'Access denied to storage bucket';
        statusCode = 500;
      } else if (error.message.includes('NoSuchBucket')) {
        errorMessage = 'Storage bucket not found';
        statusCode = 500;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}
