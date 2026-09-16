"use client";

import { useEffect, useRef } from "react";

/**
 * Shared IntersectionObserver used by every reveal primitive. One observer for
 * the whole page rather than one per element — the reference reveals hundreds
 * of split words and lines.
 */
let observer: IntersectionObserver | null = null;
const once = new WeakSet<Element>();

function getObserver() {
  if (observer || typeof window === "undefined") return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-revealed");
        once.add(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    // Fire a little before the element is fully on screen, matching the
    // reference's ScrollTrigger start of roughly "top 85%".
    { rootMargin: "0px 0px -15% 0px", threshold: 0 },
  );
  return observer;
}

/**
 * @param immediate reveal on mount rather than on viewport entry. Needed for
 * above-the-fold content inside pinned/sticky areas, which never crosses the
 * observer's threshold because it does not move with the page.
 * @param gate when a boolean is passed, the shared observer is bypassed
 * entirely and the reveal waits for it to become true. Sticky sections need
 * this: their content is on screen long before the moment the reference
 * chooses to reveal it, so viewport entry is the wrong signal.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(
  immediate = false,
  gate?: boolean,
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (gate !== undefined) {
      if (!gate) return;
      const id = requestAnimationFrame(() => el.classList.add("is-revealed"));
      once.add(el);
      return () => cancelAnimationFrame(id);
    }

    if (immediate || once.has(el)) {
      // next frame, so the initial (hidden) state paints first and the
      // transition actually runs
      const id = requestAnimationFrame(() => el.classList.add("is-revealed"));
      once.add(el);
      return () => cancelAnimationFrame(id);
    }

    const obs = getObserver();
    obs?.observe(el);
    return () => obs?.unobserve(el);
  }, [immediate, gate]);

  return ref;
}
