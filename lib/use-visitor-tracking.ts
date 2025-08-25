import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface TrackingOptions {
  enabled?: boolean;
  trackReferrer?: boolean;
  trackPageViews?: boolean;
}

export function useVisitorTracking(options: TrackingOptions = {}) {
  const {
    enabled = true,
    trackReferrer = true,
    trackPageViews = true
  } = options;
  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const trackPageView = useCallback(async (page: string, referrer?: string) => {
    if (!enabled) return;
    
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page,
          referrer: trackReferrer ? referrer : undefined
        }),
      });
      
      if (!response.ok) {
        console.warn('Failed to track page view');
      }
    } catch (error) {
      console.warn('Error tracking page view:', error);
    }
  }, [enabled, trackReferrer]);
  
  // Track page views automatically
  useEffect(() => {
    if (!enabled || !trackPageViews) return;
    
    const currentPage = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    const referrer = trackReferrer ? document.referrer : undefined;
    
    trackPageView(currentPage, referrer);
  }, [pathname, searchParams, trackPageView, enabled, trackPageViews, trackReferrer]);
  
  // Track custom events
  const trackEvent = useCallback(async (eventName: string, eventData?: Record<string, any>) => {
    if (!enabled) return;
    
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: pathname,
          event: eventName,
          eventData,
          referrer: trackReferrer ? document.referrer : undefined
        }),
      });
      
      if (!response.ok) {
        console.warn('Failed to track event');
      }
    } catch (error) {
      console.warn('Error tracking event:', error);
    }
  }, [enabled, pathname, trackReferrer]);
  
  return {
    trackPageView,
    trackEvent
  };
}
