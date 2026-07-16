import { useCallback, useEffect, useRef, useState } from 'react';

export interface DeviceType {
  isMobile: boolean;
  isDesktop: boolean;
  cleanupDeviceTypeListener: () => void;
}

const MOBILE_BREAKPOINT_QUERY = '(max-width: 768px)';

/** SSR-safe mobile/desktop breakpoint detector, ported from obaas-frontend's hooks/useDeviceType.ts. */
export function useDeviceType(): DeviceType {
  const [isMobileMatch, setMobileMatch] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      return window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
    }
    return false;
  });

  const mqlRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;

    const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    mqlRef.current = mql;

    const handler = (event: MediaQueryListEvent) => setMobileMatch(event.matches);
    setMobileMatch(mql.matches);
    mql.addEventListener('change', handler);

    return () => {
      mql.removeEventListener('change', handler);
      mqlRef.current = null;
    };
  }, []);

  const cleanupDeviceTypeListener = useCallback(() => {
    mqlRef.current = null;
  }, []);

  return {
    isMobile: isMobileMatch,
    isDesktop: !isMobileMatch,
    cleanupDeviceTypeListener,
  };
}
