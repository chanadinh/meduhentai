'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function VisitorTrackerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const currentPage = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
        
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: currentPage,
            referrer: document.referrer || undefined
          }),
        });
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.warn('Failed to track page view:', error);
      }
    };

    // Track page view when component mounts or route changes
    trackPageView();
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}

export default function VisitorTracker() {
  return (
    <Suspense fallback={null}>
      <VisitorTrackerContent />
    </Suspense>
  );
}
