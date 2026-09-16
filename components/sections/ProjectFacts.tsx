"use client";

import { useEffect, useRef, useState } from "react";
import { projectFacts } from "@/lib/content";
import { EraMark } from "../ui/EraMark";
import { SplitReveal } from "../ui/Reveal";
import { scrollProgress } from "@/lib/layout";
import styles from "./ProjectFacts.module.css";

/*
 * How far each card travels, in vw, from the start of the section's pass to
 * the end. It runs from -amp to +amp, so a card is left of its place on the
 * way in and right of it on the way out.
 *
 * The three differ so the row does not read as one rigid block sliding: the
 * card furthest right travels furthest, which opens and closes the gaps
 * between them as the section goes by.
 *
 * No value here may exceed `--max-travel` in the stylesheet — that is the
 * padding the track reserves on each side for this movement, and it is what
 * keeps a drifting card inside the container instead of running out past its
 * right edge.
 */
const TRAVEL = [1.5, 2.5, 3.5];

/**
 * The measures the place is composed to.
 *
 * Set as the centred dark statement the apartment intro uses — strap, display
 * lead, mark — rather than the cream two-by-two field this was. The three
 * measures sit between the lead and the closing line as a row of cards that
 * drifts left to right as the section passes the viewport, each card on its
 * own amplitude.
 *
 * The drift is written straight onto the elements from a rAF-throttled scroll
 * handler, so scrolling never re-renders the section, and it is skipped
 * outright under reduced motion — where the row simply sits in its places.
 */
export function ProjectFacts() {
  const sectionRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      // -1 at the section's first frame on screen, +1 at its last
      const t = scrollProgress(el) * 2 - 1;
      el.style.setProperty("--drift", t.toFixed(4));
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

  /*
   * Deliberately no `bleed` and no `data-canvas`: this block paints its own
   * burgundy and meets the cream above and below it on a clean line.
   *
   * `bleed` would drop the fill and let <PageCanvas> show through, and a
   * `data-canvas` here would have that canvas declare a colour change at each
   * of this section's edges — which is the dissolve that was washing the
   * burgundy out into the section below. Without the declaration the canvas
   * sees cream on both sides of this block, finds no seam at all, and the only
   * thing between them is this section's own flat fill.
   */
  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      className={`section clip theme_on-brand ${styles.section}`}
    >
      <div className="container">
        <div className="divider">
          <span className="line-v" />
        </div>
        <div className="u-48" />

        <p className="l1 a-center">
          <SplitReveal mode="line">{projectFacts.strap}</SplitReveal>
        </p>

        <div className="u-160" />

        <div className={styles.leadWrap}>
          <p className="h4 a-center">
            <SplitReveal mode="word">{projectFacts.lead}</SplitReveal>
          </p>
        </div>

        <ul className={styles.track}>
          {projectFacts.items.map((item, i) => (
            <li
              key={item.id}
              className={styles.card}
              style={reduced ? undefined : { "--travel": TRAVEL[i] ?? 0 } as React.CSSProperties}
            >
              <span className={`l1 reg ${styles.index}`}>{item.index}</span>
              <h3 className={`h4 ${styles.label}`}>{item.label}</h3>
              <p className={`p1 ${styles.body}`}>{item.value}</p>
            </li>
          ))}
        </ul>

        <p className={`l1 reg a-center ${styles.close}`}>{projectFacts.close}</p>

        <div className="u-96" />
        <EraMark className={styles.mark} />
      </div>
    </section>
  );
}
