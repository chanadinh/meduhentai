import { NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      hasAccessKey: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      hasEndpoint: !!process.env.CLOUDFLARE_R2_ENDPOINT,
      hasBucket: !!process.env.CLOUDFLARE_R2_BUCKET_NAME,
      hasPublicDomain: !!process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN,
      hasAccountId: !!process.env.CLOUDFLARE_R2_ACCOUNT_ID,
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      // Don't expose actual values, just check if they exist
      accessKeyLength: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.length || 0,
      secretKeyLength: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.length || 0,
      endpointUrl: process.env.CLOUDFLARE_R2_ENDPOINT || 'NOT_SET',
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'NOT_SET',
      publicDomain: process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || 'NOT_SET'
    };

    return NextResponse.json({
      status: 'success',
      message: 'R2 configuration check',
      config: envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('R2 config check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
