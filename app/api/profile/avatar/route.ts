import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// POST - Upload avatar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File;

    if (!avatarFile) {
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!avatarFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (avatarFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Initialize R2 client
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });

    // Generate unique filename
    const fileExtension = avatarFile.name.split('.').pop();
    const filename = `avatar-${session.user.id}-${uuidv4()}.${fileExtension}`;

    // Convert File to Buffer
    const bytes = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: `avatars/${filename}`,
        Body: buffer,
        ContentType: avatarFile.type,
        ACL: 'public-read',
      })
    );

    // Generate public URL
    const avatarUrl = `https://${process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/avatars/${filename}`;

    // Update user avatar
    await User.findByIdAndUpdate(session.user.id, { avatar: avatarUrl });

    return NextResponse.json({ avatar: avatarUrl });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get current user to check if they have a custom avatar
    const user = await User.findById(session.user.id);
    
    if (user?.avatar && user.avatar.includes('r2.dev')) {
      // Initialize R2 client
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
        },
      });

      try {
        // Extract key from URL
        const urlParts = user.avatar.split('/');
        const key = urlParts.slice(-2).join('/'); // Get 'avatars/filename'
        
        // Delete from R2
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: key,
          })
        );
      } catch (error) {
        console.error('Error deleting from R2:', error);
        // Continue with profile update even if R2 deletion fails
      }
    }

    // Reset avatar to default
    await User.findByIdAndUpdate(session.user.id, { avatar: '/medusa.ico' });

    return NextResponse.json({ message: 'Avatar removed successfully' });

  } catch (error) {
    console.error('Avatar removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
