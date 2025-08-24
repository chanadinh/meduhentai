import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Reset password request received');
    
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { message: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { token, password } = body;
    console.log('Request data:', { token: token ? `${token.substring(0, 10)}...` : 'undefined', hasPassword: !!password });

    if (!token || !password) {
      console.error('Missing required fields:', { hasToken: !!token, hasPassword: !!password });
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.error('Password too short:', password.length);
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    console.log('🔌 Connecting to database...');
    await connectToDatabase();
    console.log('✅ Database connected');

    // Find user with valid reset token
    console.log('🔍 Looking for user with reset token...');
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      console.error('❌ User not found or token expired');
      console.error('Token:', token.substring(0, 10) + '...');
      console.error('Current time:', new Date().toISOString());
      
      // Check if user exists but token is expired
      const expiredUser = await User.findOne({ resetToken: token });
      if (expiredUser) {
        console.error('User found but token expired:', {
          userId: expiredUser._id,
          tokenExpiry: expiredUser.resetTokenExpiry,
          currentTime: new Date()
        });
      }
      
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    console.log('✅ User found:', {
      userId: user._id,
      email: user.email,
      username: user.username,
      tokenExpiry: user.resetTokenExpiry
    });

    // Hash new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully');

    // Update user password and clear reset token
    console.log('💾 Updating user in database...');
    try {
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      
      console.log('User object before save:', {
        hasPassword: !!user.password,
        hasResetToken: !!user.resetToken,
        hasResetTokenExpiry: !!user.resetTokenExpiry
      });
      
      const savedUser = await user.save();
      console.log('✅ User saved successfully:', {
        userId: savedUser._id,
        hasPassword: !!savedUser.password,
        hasResetToken: !!savedUser.resetToken,
        hasResetTokenExpiry: !!savedUser.resetTokenExpiry
      });
      
      // Verify the update by fetching the user again
      const verifyUser = await User.findById(user._id);
      console.log('🔍 Verification - User after save:', {
        userId: verifyUser?._id,
        hasPassword: !!verifyUser?.password,
        hasResetToken: !!verifyUser?.resetToken,
        hasResetTokenExpiry: !!verifyUser?.resetTokenExpiry
      });
      
    } catch (saveError) {
      console.error('❌ Failed to save user:', saveError);
      console.error('Save error details:', {
        message: saveError.message,
        code: saveError.code,
        stack: saveError.stack
      });
      throw saveError;
    }

    console.log('🎉 Password reset completed successfully');
    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Reset password error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return NextResponse.json(
      { message: 'An error occurred while resetting the password' },
      { status: 500 }
    );
  }
}
