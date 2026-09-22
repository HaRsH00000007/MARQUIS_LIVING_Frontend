"use client";

import { useEffect, useRef } from "react";
import styles from "./EraMark.module.css";
import { useLenis } from "../SmoothScroll";

/*
 * The Marquis lotus, traced from the client's logo (see
 * public/icons/marquis-lotus.svg, the same outline as a file).
 */
const LOTUS_PATH =
  "M30.50 54.68 L30.00 54.57 L29.40 54.00 L27.03 50.38 L26.08 48.75 L25.17 46.25 L24.86 44.38 L24.96 40.12 L25.96 37.00 L26.53 35.75 L26.35 35.25 L25.62 34.38 L24.75 33.82 L24.00 33.66 L18.88 34.50 L16.38 34.53 L12.62 33.92 L9.75 32.87 L7.82 31.75 L5.65 29.88 L1.88 25.55 L0.73 24.12 L0.56 23.62 L0.64 23.25 L1.00 22.95 L2.50 22.63 L4.75 21.95 L8.12 21.36 L12.25 21.38 L15.62 22.03 L18.00 23.06 L19.88 24.15 L21.17 25.12 L23.25 27.20 L23.88 27.37 L24.50 27.12 L24.81 26.62 L24.83 26.12 L23.99 24.00 L23.02 18.88 L23.08 15.88 L23.95 11.12 L25.08 8.00 L26.09 6.12 L29.31 1.00 L29.88 0.36 L30.38 0.10 L30.75 0.27 L31.75 1.69 L34.83 6.62 L35.83 8.62 L36.91 12.00 L37.51 16.12 L37.54 18.12 L36.88 22.75 L35.83 26.12 L35.91 26.75 L36.25 27.19 L36.75 27.34 L37.50 27.01 L39.62 24.97 L40.75 24.12 L42.62 23.07 L45.38 22.00 L48.88 21.42 L53.12 21.37 L57.00 21.97 L59.62 22.89 L59.97 23.12 L60.12 23.50 L59.94 24.00 L58.12 26.54 L57.10 27.75 L55.12 29.76 L52.50 31.77 L50.60 32.88 L48.12 33.90 L44.38 34.55 L41.75 34.54 L36.38 33.62 L35.38 33.96 L34.33 34.88 L34.01 35.38 L33.99 35.88 L34.74 37.25 L34.98 38.00 L35.75 41.62 L35.80 43.75 L35.39 45.75 L34.71 48.12 L33.75 50.04 L30.88 54.35 L30.50 54.68Z M27.56 23.50 L27.86 23.00 L29.27 17.88 L29.82 16.62 L30.25 16.23 L30.50 16.26 L30.76 16.62 L31.12 18.38 L31.70 19.75 L32.16 21.75 L32.48 22.50 L33.00 23.14 L33.38 23.29 L33.71 23.00 L33.88 22.36 L34.46 18.50 L34.51 16.88 L33.94 13.00 L32.75 9.39 L32.20 8.50 L31.68 7.25 L30.88 5.96 L30.50 5.66 L30.00 5.78 L29.44 6.38 L28.12 8.63 L27.65 10.00 L27.07 11.12 L26.67 13.12 L26.12 15.12 L26.07 18.88 L26.18 20.12 L26.91 23.00 L27.25 23.51 L27.56 23.50Z M17.00 17.88 L15.62 17.97 L14.20 17.62 L13.08 16.62 L12.61 15.62 L12.49 14.88 L12.52 14.12 L12.65 13.12 L12.87 12.50 L13.25 12.02 L14.12 11.29 L15.00 10.84 L16.25 10.71 L17.33 11.00 L18.62 11.91 L19.32 12.88 L19.54 13.38 L19.61 15.00 L19.35 15.88 L18.17 17.38 L17.62 17.70 L17.00 17.88Z M45.50 17.90 L44.25 17.95 L42.72 17.62 L42.36 17.38 L41.52 16.38 L41.17 15.62 L41.10 13.62 L41.38 12.63 L42.36 11.62 L43.28 11.00 L43.88 10.77 L45.25 10.77 L46.38 11.27 L47.36 12.12 L47.93 12.88 L48.11 13.38 L48.15 15.12 L47.85 16.12 L46.75 17.45 L46.25 17.71 L45.50 17.90Z M15.84 31.25 L16.36 31.12 L16.47 30.38 L17.23 29.62 L18.00 29.24 L19.45 28.88 L19.81 28.50 L19.74 28.12 L19.41 27.75 L17.25 26.19 L14.75 25.04 L12.00 24.36 L10.38 24.10 L7.88 24.20 L6.25 24.61 L5.78 25.00 L5.72 25.50 L5.93 25.88 L7.85 27.75 L9.12 28.78 L10.70 29.75 L12.75 30.76 L14.50 31.16 L15.84 31.25Z M45.26 31.25 L47.75 30.82 L50.00 29.71 L51.62 28.61 L54.00 26.59 L54.76 25.62 L54.83 25.25 L54.74 25.00 L54.48 24.75 L54.00 24.55 L51.50 24.07 L49.88 24.13 L47.75 24.56 L45.58 25.12 L43.62 26.07 L41.88 27.21 L40.97 28.00 L40.80 28.38 L40.98 28.75 L43.38 29.62 L44.34 30.38 L44.63 31.12 L45.26 31.25Z M30.84 33.12 L31.94 32.75 L32.90 31.88 L33.62 30.50 L33.69 29.88 L33.59 29.38 L32.78 27.88 L31.75 26.99 L30.50 26.76 L28.75 27.06 L28.12 27.48 L27.12 28.82 L26.92 29.88 L27.05 30.88 L27.42 31.50 L28.62 32.80 L29.75 33.15 L30.84 33.12Z M18.51 31.75 L18.68 31.62 L18.70 31.38 L18.26 31.12 L17.50 31.09 L16.79 31.25 L16.95 31.50 L17.49 31.75 L18.00 31.84 L18.51 31.75Z M16.38 44.25 L15.62 44.37 L15.12 44.30 L14.76 44.00 L14.65 43.62 L14.88 42.75 L16.22 40.50 L17.38 39.36 L18.87 38.25 L21.50 37.31 L22.12 37.28 L22.69 37.50 L22.93 38.00 L22.75 39.11 L21.57 41.00 L19.38 43.06 L17.75 43.95 L16.38 44.25Z M45.50 44.30 L44.88 44.35 L42.88 43.96 L41.11 43.00 L39.65 41.88 L38.12 39.75 L37.40 38.25 L37.36 37.88 L37.50 37.55 L37.75 37.38 L38.25 37.28 L39.75 37.49 L41.62 38.27 L43.19 39.38 L44.88 41.30 L45.88 43.25 L45.91 43.88 L45.50 44.30Z M30.50 49.12 L30.88 48.81 L31.75 47.24 L32.44 44.75 L32.68 42.75 L32.38 41.03 L32.00 40.37 L31.62 40.32 L31.39 40.50 L31.14 41.12 L30.73 43.12 L30.50 43.49 L30.25 43.52 L29.88 42.99 L28.88 40.26 L28.62 39.84 L28.38 39.75 L28.11 40.12 L27.91 41.50 L27.93 43.88 L28.09 45.12 L29.33 48.38 L29.89 49.00 L30.50 49.12Z";

/**
 * The Marquis lotus symbol — the brand mark used across the site (footer,
 * section marks, preloader, header badge). `currentColor`, so it inherits the
 * active theme's ink. Named for the ERA mark it replaced, so every caller
 * picked the lotus up unchanged.
 */
export function EraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 55" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d={LOTUS_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/**
 * The rotating header lockup: the lotus inside a turning ring of
 * repeated `MARQUIS · LIVING` text set on a circular path.
 * When scrolling down, it rotates clockwise; when scrolling up, anti-clockwise.
 */
export function EraBadge({ className }: { className?: string }) {
  const ringRef = useRef<SVGSVGElement>(null);
  const lenisRef = useLenis();

  useEffect(() => {
    const ringEl = ringRef.current;
    if (!ringEl) return;

    let rotation = 0;
    let targetSpeed = 12; // deg/sec: positive = clockwise, negative = anti-clockwise
    let currentSpeed = 12;
    let dir = 1;
    let lastTime = performance.now();
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const handleVelocity = (vel: number) => {
      if (Math.abs(vel) > 0.01) {
        dir = vel > 0 ? 1 : -1;
        targetSpeed = dir * (12 + Math.min(Math.abs(vel) * 40, 180));

        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          targetSpeed = dir * 12;
        }, 150);
      }
    };

    // 1. Lenis scroll listener
    const lenis = lenisRef?.current;
    let unsubscribeLenis: (() => void) | null = null;
    if (lenis) {
      const onLenisScroll = (e: { velocity: number }) => {
        handleVelocity(e.velocity);
      };
      lenis.on("scroll", onLenisScroll);
      unsubscribeLenis = () => {
        lenis.off("scroll", onLenisScroll);
      };
    }

    // 2. Native scroll listener fallback
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastScrollY;
      lastScrollY = currentY;
      handleVelocity(deltaY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // 3. Wheel event fallback
    const onWheel = (e: WheelEvent) => {
      handleVelocity(e.deltaY);
    };
    window.addEventListener("wheel", onWheel, { passive: true });

    // 4. Touch events fallback
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const curY = e.touches[0].clientY;
        const delta = touchY - curY;
        touchY = curY;
        handleVelocity(delta);
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    // Animation loop
    let animId: number;
    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      currentSpeed += (targetSpeed - currentSpeed) * 0.12;
      rotation = (rotation + currentSpeed * dt) % 360;

      ringEl.style.transform = `rotate(${rotation}deg)`;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      if (unsubscribeLenis) unsubscribeLenis();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [lenisRef]);

  return (
    <span className={[styles.badge, className].filter(Boolean).join(" ")}>
      <svg
        ref={ringRef}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.ring}
        aria-hidden
      >
        <defs>
          <path
            id="badge-ring"
            d="M60 14a46 46 0 1 1 0 92 46 46 0 1 1 0-92"
            fill="none"
          />
        </defs>
        <text className={styles.ringText} fill="currentColor">
          <textPath href="#badge-ring" startOffset="0" textLength="289" lengthAdjust="spacing">
            MARQUIS · LIVING · MARQUIS · LIVING ·
          </textPath>
        </text>
      </svg>
      <EraMark className={styles.mark} />
    </span>
  );
}
