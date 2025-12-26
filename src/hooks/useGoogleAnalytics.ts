import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook for Google Analytics page view tracking
 * Automatically tracks route changes and sends page_view events to GA4
 */
export function useGoogleAnalytics(): void {
  const location = useLocation();

  useEffect(() => {
    // Only track in production environment
    if (import.meta.env.MODE !== 'production') {
      console.log('[GA4 Dev Mode] Page view:', location.pathname);
      return;
    }

    // Ensure gtag is available
    if (typeof (window as any).gtag !== 'undefined') {
      // Send page_view event with current path
      (window as any).gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location]);
}

/**
 * Helper function to track custom events
 * @param eventName - Name of the event (e.g., 'button_click', 'form_submit')
 * @param eventParams - Optional parameters for the event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  if (import.meta.env.MODE !== 'production') {
    console.log('[GA4 Dev Mode] Event:', eventName, eventParams);
    return;
  }

  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', eventName, eventParams);
  }
}