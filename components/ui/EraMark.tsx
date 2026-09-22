"use client";

import { useEffect, useRef } from "react";
import styles from "./EraMark.module.css";
import { useLenis } from "../SmoothScroll";

/**
 * The ERA quatrefoil symbol, traced from the reference's inline SVG.
 * `currentColor` throughout so it inherits the active theme's ink.
 */
export function EraMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M6.555 9.124C4.817 7.386 4.69 4.694 4.69 4.694s2.692.127 4.43 1.865c1.738 1.739 1.865 4.43 1.865 4.43s-2.691-.127-4.43-1.865Z"
        fill="currentColor"
      />
      <path
        d="M20 .002 16.157 8.12a4.5 4.5 0 0 0 0 3.762l2.342 4.947a3.1 3.1 0 0 0-1.646 1.68l-4.972-2.353a4.5 4.5 0 0 0-3.762 0L0 20v-.823c0-.828.423-1.598 1.122-2.041l6.523-4.141a4.5 4.5 0 0 1 4.711-.002l1.75 1.111-1.11-1.75a4.5 4.5 0 0 1 0-4.711l4.14-6.522A2.42 2.42 0 0 1 19.178 0L20 .002Z"
        fill="currentColor"
      />
      <path
        d="M33.445 30.876c1.738 1.738 1.865 4.43 1.865 4.43s-2.692-.127-4.43-1.866c-1.739-1.738-1.866-4.43-1.866-4.43s2.692.128 4.43 1.866Z"
        fill="currentColor"
      />
      <path
        d="m20 39.998 3.843-8.117a4.5 4.5 0 0 0 0-3.762l-2.342-4.948a3.1 3.1 0 0 0 1.646-1.68l4.972 2.353a4.5 4.5 0 0 0 3.762 0L40 20v.823c0 .828-.423 1.598-1.122 2.042l-6.523 4.14a4.5 4.5 0 0 1-4.711.002l-1.75-1.111 1.11 1.75a4.5 4.5 0 0 1 0 4.71l-4.14 6.523A2.42 2.42 0 0 1 20.822 40L20 39.998Z"
        fill="currentColor"
      />
      <path
        d="M30.876 6.555c1.738-1.738 4.43-1.865 4.43-1.865s-.127 2.692-1.866 4.43c-1.738 1.738-4.43 1.865-4.43 1.865s.128-2.691 1.866-4.43Z"
        fill="currentColor"
      />
      <path
        d="m39.999 20-8.118-3.843a4.5 4.5 0 0 0-3.762 0l-4.948 2.342a3.1 3.1 0 0 0-1.68-1.646l2.353-4.972a4.5 4.5 0 0 0 0-3.762L20 0l.823 0c.828 0 1.598.423 2.041 1.122l4.141 6.523a4.5 4.5 0 0 1 .002 4.711l-1.111 1.75 1.75-1.11a4.5 4.5 0 0 1 4.711 0l6.522 4.14A2.42 2.42 0 0 1 40 19.178L39.999 20Z"
        fill="currentColor"
      />
      <path
        d="M9.124 33.445c-1.738 1.738-4.43 1.865-4.43 1.865s.127-2.692 1.865-4.43c1.739-1.739 4.43-1.866 4.43-1.866s-.127 2.692-1.865 4.43Z"
        fill="currentColor"
      />
      <path
        d="m.001 20 8.118 3.843a4.5 4.5 0 0 0 3.762 0l4.948-2.342a3.1 3.1 0 0 0 1.68 1.646l-2.353 4.972a4.5 4.5 0 0 0 0 3.762L20 40l-.823 0a2.42 2.42 0 0 1-2.041-1.122l-4.141-6.523a4.5 4.5 0 0 1-.002-4.711l1.111-1.75-1.75 1.11a4.5 4.5 0 0 1-4.711 0l-6.522-4.14A2.42 2.42 0 0 1 0 20.822L.001 20Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * The rotating header lockup: the quatrefoil inside a turning ring of
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
      {/* the Marquis lotus, painted in the header's current ink through a
          mask so it turns navy or cream with the theme, as the ring does */}
      <span className={`${styles.mark} ${styles.lotus}`} aria-hidden />
    </span>
  );
}
