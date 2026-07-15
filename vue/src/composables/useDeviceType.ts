import { computed, ref, type ComputedRef } from 'vue'

interface DeviceTypeRefs {
  isMobile: Readonly<ComputedRef<boolean>>
  isDesktop: Readonly<ComputedRef<boolean>>
}

const MOBILE_BREAKPOINT_QUERY = '(max-width: 768px)'

// --- Singleton state and listener logic ---
// This ref will hold the match status and be shared by all useDeviceType calls.
const isMobileMatch = ref(false)
let mediaQueryListSingleton: MediaQueryList | null = null

// This flag ensures initialization happens only once.
let initialized = false

const updateMatchStatus = (event: MediaQueryListEvent | MediaQueryList) => {
  isMobileMatch.value = event.matches
}

// Initialize media query if we're in browser environment
function initializeMediaQuery() {
  if (typeof window !== 'undefined' && 'matchMedia' in window && !initialized) {
    mediaQueryListSingleton = window.matchMedia(MOBILE_BREAKPOINT_QUERY)
    updateMatchStatus(mediaQueryListSingleton)
    mediaQueryListSingleton.addEventListener('change', updateMatchStatus)
    initialized = true
    return true
  }
  return false
}

// Cleanup function that can be called when app is destroyed
export function cleanupDeviceTypeListener() {
  if (mediaQueryListSingleton) {
    mediaQueryListSingleton.removeEventListener('change', updateMatchStatus)
    mediaQueryListSingleton = null
    initialized = false
  }
}

// Initialize on import
initializeMediaQuery()

/**
 * A Vue composable that provides reactive booleans indicating
 * whether the client is on a mobile or desktop view, based on a predefined breakpoint.
 * The underlying media query listener is initialized only once.
 *
 * @returns An object with `isMobile` and `isDesktop` readonly computed refs.
 */
export function useDeviceType(): DeviceTypeRefs {
  const isMobile = computed(() => isMobileMatch.value)
  const isDesktop = computed(() => !isMobileMatch.value)

  return {
    isMobile: isMobile,
    isDesktop: isDesktop
  }
}
