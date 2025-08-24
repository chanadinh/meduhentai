'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Redirect to the user's specific profile page
    if (session.user?.id) {
      router.push(`/profile/${session.user.id}`);
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-dark-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
