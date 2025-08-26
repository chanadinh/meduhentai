import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname: string) => {
        // Authenticate users before generating the token
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
          throw new Error('Not authenticated');
        }

        // Check if user has admin or uploader privileges
        if (session.user.role !== 'admin' && session.user.role !== 'uploader') {
          throw new Error('Not authorized - admin or uploader access required');
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            userEmail: session.user.email,
            uploadType: 'manga',
            timestamp: Date.now(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Handle upload completion
        console.log('Manga blob upload completed:', blob, tokenPayload);
        
        try {
          const payload = JSON.parse(tokenPayload);
          console.log('Upload completed for user:', payload.userId);
          
          // Here you can:
          // 1. Update database with the blob URL
          // 2. Send notifications
          // 3. Log the upload
          // 4. Trigger any post-upload processing
          
          // Example: Log to database or external service
          // await db.logUpload({
          //   userId: payload.userId,
          //   blobUrl: blob.url,
          //   uploadType: 'manga',
          //   timestamp: payload.timestamp,
          //   size: blob.size,
          // });
          
        } catch (error) {
          console.error('Error processing upload completion:', error);
          // Don't throw here as the upload was successful
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { 
        error: (error as Error).message,
        details: 'Failed to generate upload token or process upload'
      },
      { status: 400 }
    );
  }
}
