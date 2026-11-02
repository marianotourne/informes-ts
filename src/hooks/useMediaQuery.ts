import { useCallback, useSyncExternalStore } from "react";

// Whether a CSS media query matches, updated when it changes (e.g. on rotation)
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
  );
}

// Same breakpoint as Tailwind's `md:`
export const useIsDesktop = () => useMediaQuery("(min-width: 768px)");
