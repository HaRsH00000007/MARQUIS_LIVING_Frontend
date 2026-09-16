"use client";

import { useEffect, useRef, useState } from "react";
import { benefitsIntro } from "@/lib/content";
import { EraMark } from "../ui/EraMark";
import { SplitReveal } from "../ui/Reveal";
import styles from "./BenefitsIntro.module.css";

/**
 * The arch section that rises over the hero. The section title rides the crown
 * of the arch on an SVG `textPath`, followed by the `COSTA ✳ DEL SOL` lockup,
 * a vertical rule and the strapline.
 * Scroll scrub expands the curved title's word-spacing from 0rem to 10rem.
 */
export function BenefitsIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const [wordSpacing, setWordSpacing] = useState("0rem");

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      const dist = rect.height + viewH;
      const current = viewH - rect.top;
      const p = Math.min(1, Math.max(0, current / dist));
      setWordSpacing(`${(p * 10).toFixed(2)}rem`);
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
  }, []);

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      data-canvas="sky"
      className={`section arch clip theme_on-brand ${styles.section}`}
      aria-labelledby="benefits-title"
    >
      <h2 id="benefits-title" className={styles.curved}>
        <span className="sr-only">{benefitsIntro.curvedTitle}</span>
        <svg viewBox="0 0 1000 150" className={styles.curvedSvg} aria-hidden>
          <defs>
            <path id="benefits-arc" d="M 190,140 A 560,560 0 0 1 810,140" fill="none" />
          </defs>
          <text className={styles.curvedText} style={{ wordSpacing }}>
            <textPath href="#benefits-arc" startOffset="50%" textAnchor="middle">
              {benefitsIntro.curvedTitle}
            </textPath>
          </text>
        </svg>
      </h2>

      <div className="container">
        <div className={styles.lockup}>
          <span className="l1">{benefitsIntro.logoLeft}</span>
          <EraMark className={styles.mark} />
          <span className="l1">{benefitsIntro.logoRight}</span>
        </div>

        <div className="u-48" />
        <div className="divider">
          <span className="line-v" />
        </div>
        <div className="u-48" />

        <p className="l1 a-center">
          <SplitReveal mode="line">{benefitsIntro.strap}</SplitReveal>
        </p>
      </div>
    </section>
  );
}
