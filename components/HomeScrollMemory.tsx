"use client";

import { useEffect } from "react";
import { useLenis } from "@/components/SmoothScroll";

/** Where the home page was scrolled to when a link last took the visitor away. */
const SAVED = "ml-home-scroll";
/** Set by a page's Back control: the next home mount returns to `SAVED`. */
const RETURN = "ml-home-return";
/** How long the restored position is held while the page settles under it. */
const HOLD_MS = 3000;

/**
 * Asks the home page to reopen where the visitor left it. Returns false when
 * nothing was saved (the page was reached directly), so the caller can fall
 * back to its own destination.
 */
export function requestHomeReturn() {
  try {
    if (sessionStorage.getItem(SAVED) === null) return false;
    sessionStorage.setItem(RETURN, "1");
    return true;
  } catch {
    return false;
  }
}

/**
 * Mounted on the home page. Records the scroll position whenever a link leads
 * off the page, and — when a Back control asked for it — puts the page back
 * there on return.
 *
 */
export function HomeScrollMemory() {
  const lenisRef = useLenis();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      if (a.pathname === window.location.pathname) return;
      try {
        sessionStorage.setItem(SAVED, String(Math.round(window.scrollY)));
      } catch {}
    };
    document.addEventListener("click", onClick, true);

    let target: number | null = null;
    try {
      if (sessionStorage.getItem(RETURN)) {
        const y = Number(sessionStorage.getItem(SAVED));
        if (Number.isFinite(y)) target = y;
      }
    } catch {}

    let timer = 0;
    const stopOn = ["wheel", "touchstart", "keydown"] as const;
    const finish = () => {
      window.clearTimeout(timer);
      stopOn.forEach((t) => window.removeEventListener(t, finish));
      try {
        sessionStorage.removeItem(RETURN);
      } catch {}
    };

    if (target !== null) {
      const top = target;
      const started = performance.now();
      /*
       * Held at the saved position until the page has settled around it: the
       * document grows as the sections below the fold lay out and the pins
       * add their spacers, and Lenis still carries the gallery page's shorter
       * scroll limit until it is told to measure again — so an early jump is
       * clamped short, wherever the page happens to end at that moment.
       * Re-applied for a few seconds, and dropped the moment the visitor
       * scrolls for themselves.
       */
      const hold = () => {
        const lenis = lenisRef?.current;
        lenis?.resize();
        if (Math.abs(window.scrollY - top) >= 2) {
          if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
          else window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
        }
        if (performance.now() - started < HOLD_MS) timer = window.setTimeout(hold, 120);
        else finish();
      };
      stopOn.forEach((t) => window.addEventListener(t, finish, { passive: true }));
      hold();
    }

    return () => {
      document.removeEventListener("click", onClick, true);
      /* not `finish`: the flag stays for the next mount, so Strict Mode's
         double mount in development still restores */
      window.clearTimeout(timer);
      stopOn.forEach((t) => window.removeEventListener(t, finish));
    };
  }, [lenisRef]);

  return null;
}
