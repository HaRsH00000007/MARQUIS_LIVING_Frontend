"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Maps a pinned section's scroll progress onto a discrete active index — the
 * mechanism behind the reference's amenity scroller, where scrolling advances
 * the tab rather than moving the page. Returns the index plus a setter so the
 * tabs stay clickable too.
 *
 * `hold` is a number of screen heights at the end of the section that belong
 * to a pinned hold rather than to the tabs: the last tab stays active through
 * it, and the tabs share only the scroll before it.
 */
export function useScrollTabs(
  sectionRef: RefObject<HTMLElement | null>,
  count: number,
  enabled = true,
  hold = 0,
) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !enabled || count < 2) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const distance = el.offsetHeight - window.innerHeight * (1 + hold);
      if (distance <= 0) return;
      const p = Math.min(0.999, Math.max(0, -rect.top / distance));
      setIndex(Math.floor(p * count));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sectionRef, count, enabled, hold]);

  return [index, setIndex] as const;
}
