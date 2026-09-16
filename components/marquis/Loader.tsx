"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 1450;

/**
 * The opening screen. It counts to 100 over 1.45s, then waits for the first
 * downward gesture — wheel, arrow/space, or a touch drag — before sliding away
 * and handing the hero its reveal. A gesture made while it is still counting is
 * remembered and honoured the moment it finishes, so an impatient scroll is
 * never swallowed.
 *
 * `onDone` is what flips the root into `ml-hero-revealed`, and fires on
 * dismissal. Reduced motion is handled a level up, in `Shell`, which simply
 * does not mount this at all — so there is no opening to sit through.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const pct = el.querySelector<HTMLElement>(".ml-loader-percent");
    const bar = el.querySelector<HTMLElement>(".ml-loader-line i");
    const start = performance.now();
    let ready = false;
    let scrollAsked = false;
    let dismissed = false;
    let touchY = 0;
    let raf = 0;
    let timer = 0;

    const cleanup = () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };

    const dismiss = () => {
      if (dismissed || !ready) {
        scrollAsked = true;
        return;
      }
      dismissed = true;
      cleanup();
      el.classList.add("ml-loader-scroll-out");
      onDone();
      timer = window.setTimeout(() => setGone(true), 1300);
    };

    function onWheel(e: WheelEvent) {
      if (e.deltaY <= 0) return;
      e.preventDefault();
      scrollAsked = true;
      dismiss();
    }
    function onKey(e: KeyboardEvent) {
      if (!["ArrowDown", "PageDown", " ", "Spacebar"].includes(e.key)) return;
      e.preventDefault();
      scrollAsked = true;
      dismiss();
    }
    function onTouchStart(e: TouchEvent) {
      touchY = e.touches[0]?.clientY ?? 0;
    }
    function onTouchMove(e: TouchEvent) {
      const y = e.touches[0]?.clientY ?? touchY;
      if (touchY - y > 12) {
        e.preventDefault();
        scrollAsked = true;
        dismiss();
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const e = 1 - Math.pow(1 - t, 3);
      if (pct) pct.textContent = String(Math.round(e * 100)).padStart(2, "0");
      if (bar) bar.style.transform = `scaleX(${e})`;
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        ready = true;
        el.classList.add("ml-loader-ready");
        if (scrollAsked) dismiss();
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cleanup();
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [onDone]);

  if (gone) return null;

  return (
    <div className="ml-loader-screen" aria-hidden="true" ref={rootRef}>
      <div className="ml-loader-panel ml-loader-panel-top" />
      <div className="ml-loader-panel ml-loader-panel-bottom" />
      <div className="ml-loader-wordmark">
        <span>MARQUIS</span>
        <span>LIVING</span>
      </div>
      <div className="ml-loader-meta">
        <span>DUBAI / UAE</span>
        <span className="ml-loader-percent">00</span>
      </div>
      <div className="ml-loader-line">
        <i />
      </div>
    </div>
  );
}
