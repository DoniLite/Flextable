import type { ComputedRef } from 'vue';
import { computed, ref } from 'vue';

export interface DeviceTypeRefs {
  isMobile: Readonly<ComputedRef<boolean>>;
  isDesktop: Readonly<ComputedRef<boolean>>;
}

const MOBILE_BREAKPOINT_QUERY = '(max-width: 768px)';

const isMobileMatch = ref(false);
let mediaQueryListSingleton: MediaQueryList | null = null;
let initialized = false;

const updateMatchStatus = (event: MediaQueryListEvent | MediaQueryList) => {
  isMobileMatch.value = event.matches;
};

function initializeMediaQuery() {
  if (typeof window !== 'undefined' && 'matchMedia' in window && !initialized) {
    mediaQueryListSingleton = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    updateMatchStatus(mediaQueryListSingleton);
    mediaQueryListSingleton.addEventListener('change', updateMatchStatus);
    initialized = true;
    return true;
  }
  return false;
}

export function cleanupDeviceTypeListener(): void {
  if (mediaQueryListSingleton) {
    mediaQueryListSingleton.removeEventListener('change', updateMatchStatus);
    mediaQueryListSingleton = null;
    initialized = false;
  }
}

initializeMediaQuery();

/** SSR-safe mobile/desktop breakpoint detector, sharing a single MediaQueryList listener across all callers. */
export function useDeviceType(): DeviceTypeRefs {
  return {
    isMobile: computed(() => isMobileMatch.value),
    isDesktop: computed(() => !isMobileMatch.value),
  };
}
