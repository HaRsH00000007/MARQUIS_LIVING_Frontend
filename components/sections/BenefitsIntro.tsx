"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { benefitsIntro } from "@/lib/content";
import { EraMark } from "../ui/EraMark";
import { SplitReveal } from "../ui/Reveal";
import styles from "./BenefitsIntro.module.css";

/**
 * The arch section that rises over the hero. The section title rides the rim
 * of the arch on an SVG `textPath`, followed by the `MARQUIS ✳ LIVING` lockup,
 * a vertical rule and the strapline.
 *
 * The title's path is an ellipse inset from the dome's own edge (the section's
 * `border-top-*-radius: 50% 47vw`), measured at runtime so it tracks the rim at
 * every width. Each word is placed on its own, with equal gaps.
 *
 * Scroll scrub: as the dome rises, the words start gathered at the crown and
 * stretch apart along the rim until the title runs from the dome's left
 * shoulder to its right shoulder (fully open when the crown reaches the top of
 * the viewport). Scrolling back up gathers them again.
 */

const VIEW_W = 1000;
/* how far inside the rim the baseline sits, in viewBox units */
const INSET = 68;
/* where the path ends on each shoulder: degrees above the ellipse's centre */
const END_ANGLE = 28;
/* share of the path left empty at each end */
const END_PAD = 0.03;
/* gap between words when they are gathered at the crown, in viewBox units */
const TIGHT_GAP = 18;
/* share of the full shoulder-to-shoulder gap used once the words have opened */
const OPEN_GAP = 0.6;

const words = benefitsIntro.curvedTitle.split(" ");
/* first paint, before measuring: spread the words evenly */
const fallbackOffsets = words.map((_, i) => ((i + 0.5) / words.length) * 100);

export function BenefitsIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const wordRefs = useRef<(SVGTextPathElement | null)[]>([]);
  const [arc, setArc] = useState("M 124,250 A 432,402 0 0 1 876,250");
  const [layout, setLayout] = useState<{ tight: number[]; wide: number[] } | null>(null);
  const [spread, setSpread] = useState(0);

  /* trace the dome's rim in the SVG's own coordinates */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;

    const measure = () => {
      const sRect = section.getBoundingClientRect();
      const vRect = svg.getBoundingClientRect();
      if (!vRect.width) return;
      const k = VIEW_W / vRect.width; // px -> viewBox units
      const rx = (sRect.width / 2) * k;
      const ry = 0.47 * window.innerWidth * k;
      const cx = (sRect.left + sRect.width / 2 - vRect.left) * k;
      const crownY = (sRect.top - vRect.top) * k;
      const cy = crownY + ry;

      const a = rx - INSET;
      const b = ry - INSET;
      const t = (END_ANGLE * Math.PI) / 180;
      const x0 = cx - a * Math.cos(t);
      const x1 = cx + a * Math.cos(t);
      const y = cy - b * Math.sin(t);
      const f = (n: number) => n.toFixed(1);
      setArc(`M ${f(x0)},${f(y)} A ${f(a)},${f(b)} 0 0 1 ${f(x1)},${f(y)}`);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  /* space the words evenly along the traced path */
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true));
  }, []);

  useLayoutEffect(() => {
    const path = arcRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const widths = wordRefs.current.map((w) => w?.getComputedTextLength() ?? 0);
    const used = widths.reduce((sum, w) => sum + w, 0);
    const span = total * (1 - END_PAD * 2);
    /* the words stand further apart on a phone, where the arc is short and
       four words set close together read as one block of type */
    const open = window.matchMedia("(max-width: 991px)").matches ? 1 : OPEN_GAP;
    const gap = Math.max(0, (span - used) / Math.max(1, words.length - 1)) * open;
    const wideLen = used + gap * (words.length - 1);

    const place = (start: number, g: number) => {
      let at = start;
      return widths.map((w) => {
        const mid = at + w / 2;
        at += w + g;
        return mid;
      });
    };
    const tightLen = used + TIGHT_GAP * (words.length - 1);
    setLayout({
      tight: place((total - tightLen) / 2, TIGHT_GAP),
      wide: place((total - wideLen) / 2, gap),
    });
  }, [arc, fontsReady]);

  /* scroll progress: 0 as the dome enters from below, 1 when its crown
     reaches the top of the viewport */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const viewH = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (viewH - top) / viewH));
      // ease-out so the stretch settles gently into place
      setSpread(1 - Math.pow(1 - p, 2));
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
        <svg ref={svgRef} viewBox="0 0 1000 150" className={styles.curvedSvg} aria-hidden>
          <defs>
            <path ref={arcRef} id="benefits-arc" d={arc} fill="none" />
          </defs>
          <text className={styles.curvedText}>
            {words.map((word, i) => (
              <textPath
                key={word + i}
                ref={(el) => {
                  wordRefs.current[i] = el;
                }}
                href="#benefits-arc"
                startOffset={
                  layout
                    ? (layout.tight[i] + (layout.wide[i] - layout.tight[i]) * spread).toFixed(1)
                    : `${fallbackOffsets[i]}%`
                }
                textAnchor="middle"
              >
                {word}
              </textPath>
            ))}
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
