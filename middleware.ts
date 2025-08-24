import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is an API route that needs body size validation
  if (request.nextUrl.pathname.startsWith('/api/upload') && request.method === 'POST') {
    const contentLength = request.headers.get('content-length');
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const maxSize = 1024 * 1024 * 1024; // 1GB (Vercel's actual limit)
      
      // Note: Vercel sees payload size as ~3-4x larger than actual file size
      // due to base64 encoding, FormData overhead, and HTTP headers
      if (sizeInBytes > maxSize) {
        return NextResponse.json(
          { 
            error: 'Request too large. Maximum size is 1GB (Vercel server limit).',
            size: sizeInBytes,
            maxSize: maxSize,
            note: 'Vercel payload includes encoding overhead (~3-4x actual file size). Consider using direct R2 uploads for larger files.'
          },
          { status: 413 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
