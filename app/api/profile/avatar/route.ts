import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

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

    // For now, we'll use a placeholder URL
    // In a real implementation, you'd upload to R2/cloud storage
    const avatarUrl = `/api/avatar/${session.user.id}?t=${Date.now()}`;

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
