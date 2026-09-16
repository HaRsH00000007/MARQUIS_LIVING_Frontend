"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLong } from "./ui/Icons";
import { useSectionTheme } from "@/hooks/useSectionTheme";
import styles from "./ScrollRail.module.css";

/**
 * The fixed left-hand progress rail: a hairline track whose thumb — labelled
 * with a two-digit percentage — tracks document scroll, plus a rotated
 * "Scroll ↓" hint below it.
 */
export function ScrollRail() {
  const [progress, setProgress] = useState(0);
  const frame = useRef(0);
  const dark = useSectionTheme();

  useEffect(() => {
    const update = () => {
      frame.current = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div className={`${styles.rail} ${dark ? "theme_on-image" : "theme_on-light"}`} aria-hidden>
      <div className={styles.track}>
        <div className={styles.thumb} style={{ top: `${progress * 100}%` }}>
          <span className="l1">{String(Math.round(progress * 100)).padStart(2, "0")}</span>
        </div>
      </div>
      <div className={`${styles.hint} ${progress > 0.985 ? styles.hintOut : ""}`}>
        <span className="l2">Scroll</span>
        <span className={styles.arrow}>
          <ArrowLong />
        </span>
      </div>
    </div>
  );
}
