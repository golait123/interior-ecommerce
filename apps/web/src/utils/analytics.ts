/**
 * InteriorG Edge & Client Traffic Analytics Tracker
 * Automatically tracks pageviews, device resolutions, orientations, and referrers.
 */

export interface PageviewEvent {
  path: string;
  title: string;
  referrer: string;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  timestamp: number;
}

export interface TrafficStats {
  totalPageviews: number;
  uniqueVisitors: number;
  activeNow: number;
  deviceBreakdown: {
    mobilePortrait: number;
    mobileLandscape: number;
    tablet: number;
    desktop: number;
  };
  topPages: { path: string; views: number; title: string }[];
  referrers: { source: string; count: number }[];
  recentVisitors: {
    id: string;
    path: string;
    device: string;
    orientation: string;
    timeAgo: string;
    location: string;
  }[];
}

// Local storage session key for tracking unique visits
const SESSION_KEY = 'interiorg_analytics_session';

export function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'vis_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return 'vis_anonymous';
  }
}

export function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}

export function detectOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

/**
 * Tracks a pageview event by sending a lightweight payload to the analytics API endpoint.
 * Silently catches errors to never interrupt user browsing.
 */
export async function trackPageView(path: string, title?: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const event: PageviewEvent = {
    path: path || window.location.pathname,
    title: title || document.title || 'InteriorG',
    referrer: document.referrer || 'Direct',
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: detectOrientation(),
    deviceType: detectDeviceType(),
    timestamp: Date.now(),
  };

  try {
    const payload = JSON.stringify({
      ...event,
      sessionId: getSessionId(),
    });

    const endpoint = '/api/v1/analytics/track';

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Non-blocking telemetry
  }
}
