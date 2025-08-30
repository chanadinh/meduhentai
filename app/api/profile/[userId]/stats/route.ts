import { NextRequest, NextResponse } from 'next/server';
import { getUserStats } from '@/lib/user-stats';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Fetch user statistics by userId
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Use the utility function to get user stats (always fresh calculation)
    const stats = await getUserStats(userId);

    return NextResponse.json({ stats });

  } catch (error) {
    console.error('Profile stats GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
