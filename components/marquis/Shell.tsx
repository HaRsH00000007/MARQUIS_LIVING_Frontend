"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Loader } from "./Loader";
import {
  getMotionServerSnapshot,
  getMotionSnapshot,
  setReducedMotion,
  subscribeMotion,
} from "./motion";

/**
 * The Marquis Living shell: the fixed chrome (nav, scroll rail, motion toggle)
 * and the `.ml-v2` root every rule in `marquis.css` is namespaced under.
 *
 * The root carries `data-view` and the `ml-hero-revealed` / `data-ready` flags
 * the stylesheet keys its opening states off, exactly as the WordPress build
 * set them — the difference is that React owns them rather than the script
 * writing them onto the DOM.
 */
export function Shell({ children }: { children: ReactNode }) {
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [loaderDone, setLoaderDone] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // With motion reduced there is no loader to sit through, so the hero is
  // revealed from the start — derived, never assigned from inside an effect.
  const revealed = loaderDone || prefersReduced;

  const reduced = useSyncExternalStore(
    subscribeMotion,
    getMotionSnapshot,
    getMotionServerSnapshot,
  );

  const onLoaderDone = useCallback(() => setLoaderDone(true), []);

  // the left-hand scroll rail: a scaled bar plus a two-digit read-out
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const bar = el.querySelector<HTMLElement>("b");
    const out = el.querySelector<HTMLElement>("output");
    let frame = 0;

    const draw = () => {
      frame = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const global = Math.max(0, Math.min(1, window.scrollY / max));
      if (bar) bar.style.transform = `scaleY(${global})`;
      if (out) out.textContent = String(Math.round(global * 100)).padStart(2, "0");
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className={`ml-v2${revealed ? " ml-hero-revealed" : ""}`}
      data-view="home"
      data-ready="true"
      data-motion={reduced ? "reduced" : "full"}
    >
      <div id="ml-start" />

      <a href="#ml-content" className="ml-skip">
        Skip to content
      </a>

      <header className="ml-shell-nav">
        <a className="ml-brandlink" href="/marquis" aria-label="Marquis Living home">
          <span className="ml-mark" aria-hidden="true" />
        </a>
        <nav className="ml-nav-right" aria-label="Main navigation">
          <a className="ml-nav-main" href="/marquis">
            Explore the collection
          </a>
          <button type="button" className="ml-label">
            Begin a project
          </button>
          <a className="ml-label" href="/contact">
            Contact
          </a>
        </nav>
        <button type="button" className="ml-menu-button">
          MENU +
        </button>
      </header>

      <div className="ml-side-progress" aria-hidden="true" ref={progressRef}>
        <span>SCROLL</span>
        <i>
          <b />
        </i>
        <output>00</output>
      </div>

      <button
        type="button"
        className="ml-motion-button"
        aria-pressed={!reduced}
        onClick={() => setReducedMotion(!reduced)}
      >
        REDUCE MOTION
      </button>

      {!prefersReduced && <Loader onDone={onLoaderDone} />}

      <main className="ml-main">{children}</main>
    </div>
  );
}
