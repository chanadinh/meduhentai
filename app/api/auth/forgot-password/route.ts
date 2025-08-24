import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
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

    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to user
    try {
      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();
    } catch (saveError) {
      console.error('Failed to save reset token:', saveError);
      return NextResponse.json(
        { message: 'Failed to process password reset request' },
        { status: 500 }
      );
    }

    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://meduhentai.com'}/auth/reset-password?token=${resetToken}`;
    
    // Send password reset email
    try {
      console.log(`📧 Attempting to send password reset email to: ${email}`);
      const emailSent = await sendPasswordResetEmail(email, resetUrl, user.username);
      
      if (emailSent) {
        console.log(`✅ Password reset email sent successfully to: ${email}`);
      } else {
        console.error(`❌ Failed to send password reset email to: ${email}`);
        console.error('Email function returned false - this indicates a failure in the email sending process');
        
        // Log additional debugging information
        console.error('Debug info:', {
          email,
          resetUrl: resetUrl.substring(0, 50) + '...',
          username: user.username,
          timestamp: new Date().toISOString()
        });
        
        // In production, you might want to handle this differently
        // For now, we'll continue but log the failure
      }
    } catch (emailError) {
      console.error(`❌ Email sending error for ${email}:`, emailError);
      console.error('Error details:', {
        message: emailError.message,
        code: emailError.code,
        stack: emailError.stack,
        timestamp: new Date().toISOString()
      });
      
      // Continue with the process even if email fails
      // The user can still use the reset token if they have it
      console.log('⚠️  Continuing with password reset process despite email failure');
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, a password reset link has been sent.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Return a generic error message for security
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
