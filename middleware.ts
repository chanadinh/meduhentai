import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if this is an API route that needs body size validation
  if (request.nextUrl.pathname.startsWith('/api/upload') && request.method === 'POST') {
    const contentLength = request.headers.get('content-length');
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const maxSize = 100 * 1024 * 1024; // 100MB
      
      if (sizeInBytes > maxSize) {
        return NextResponse.json(
          { 
            error: 'Request too large. Maximum size is 100MB.',
            size: sizeInBytes,
            maxSize: maxSize
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
