"use client";

import { useEffect, useState } from "react";

/** SSR-safe media query hook. Starts `false`, settles after mount. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export const useIsDesktop = () => useMediaQuery("(min-width: 992px)");
