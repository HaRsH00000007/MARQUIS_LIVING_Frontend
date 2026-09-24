"use client";

import { createContext, useContext, useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

/** Access the live Lenis instance (or null before it is created / when
 *  reduced motion is preferred). */
export const useLenis = () => useContext(LenisContext);

/**
 * Whether a deliberate jump (the badge, the rail's hint, "To top", a hash
 * arrival) is under way. Sections that hijack the scroll on their own — the
 * book closing itself when the reader scrolls up off its last spread — check
 * this and stand aside, or a glide to the hero is parked halfway up the page.
 */
export const isScrollJump = () =>
  typeof document !== "undefined" && document.documentElement.dataset.scrollJump !== undefined;

const JUMP_MS = 1600;

/**
 * Scroll the page to `top`, through Lenis when it is running.
 *
 * `window.scrollTo({ behavior: "smooth" })` and Lenis are two animations racing
 * for the same scroll position: the browser's own easing sets it, Lenis's rAF
 * immediately lerps back toward its stale target, and the page judders the
 * whole way. Routing through Lenis keeps one animation in charge.
 */
export function useScrollTo() {
  const lenisRef = useContext(LenisContext);
  return (top: number) => {
    const lenis = lenisRef?.current;
    const root = document.documentElement;
    root.dataset.scrollJump = "";
    window.clearTimeout(Number(root.dataset.scrollJumpTimer ?? 0));
    root.dataset.scrollJumpTimer = String(
      window.setTimeout(() => delete root.dataset.scrollJump, JUMP_MS),
    );

    if (lenis) {
      lenis.scrollTo(top, { duration: 1.4 });
      return;
    }
    window.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };
}

/**
 * Lenis smooth scrolling driven from GSAP's ticker, with ScrollTrigger kept in
 * sync — the same pairing the reference uses so every pinned section reads the
 * lerped scroll position rather than the native one.
 *
 * The instance lives in a ref rather than state: it is an external system, and
 * nothing about the React tree needs to re-render when it is created.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({
      /*
       * A lerp rather than a fixed duration: every wheel tick eases toward the
       * target from wherever the page currently is, so continuous scrolling
       * never restarts an easing curve mid-flight. That matters more here than
       * on a normal page, because the pinned sections read the lerped position
       * directly — a restarting curve shows up as a stutter in the hero zoom
       * and the amenities tabs.
       */
      lerp: 0.1,
      smoothWheel: true,
      /* each wheel notch travels 40% further than the browser's own step —
         at 1 the long pinned sections felt like a slow crawl */
      wheelMultiplier: 1.4,
      /*
       * Touch is left to the browser. `syncTouch` re-implemented finger
       * scrolling in JavaScript — every frame of a swipe went through the main
       * thread, competing with the pinned sections' own scroll work — and was
       * the main reason the site stuttered on phones. Native touch scrolling
       * runs on the compositor and keeps its own momentum; ScrollTrigger reads
       * it just the same.
       */
      syncTouch: false,
    });

    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    lenisRef.current = instance;

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
