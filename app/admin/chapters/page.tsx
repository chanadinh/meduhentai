'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChaptersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/manage');
  }, [router]);

  return (
    <div className="min-h-screen bg-dark-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-dark-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
