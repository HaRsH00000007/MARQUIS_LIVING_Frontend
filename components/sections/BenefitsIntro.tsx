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
 * every width. Each word is placed on its own, pivoting on the crown: the
 * middle of the phrase (the gap between the two middle words) sits on the
 * crown, so it reads as centred even though "DESIGNED" is twice "LIFE". Two
 * layouts are blended by `BALANCE`: equal gaps between the words, and word
 * centres at equal steps mirrored about the crown (even ends, uneven gaps).
 *
 * The blend alone still left "DESIGNED" reaching further down the left
 * shoulder than "LIFE" on the right, so the result is then slid along the path
 * until both ends sit the same distance from the dome's edge.
 *
 * On a phone the arc is short and the type large, so the blend is dropped:
 * equal gaps, the whole phrase centred, then nudged right by `PHONE_NUDGE`.
 * Even with both ends centred, the heavy "DESIGNED AROUND" half made the
 * title read as sitting left of the lockup below it.
 *
 * Scroll scrub: as the dome rises, the words start gathered at the crown and
 * stretch apart along the rim until the title runs from the dome's left
 * shoulder to its right shoulder (fully open when the crown reaches the top of
 * the viewport). The type grows with it, from `MIN_SCALE` to full size.
 * Scrolling back up gathers and shrinks them again.
 */

const VIEW_W = 1000;
/* how far inside the rim the baseline sits, in viewBox units */
const INSET = 68;
/*
 * The same distance on a phone, where the SVG is a third of the width, works
 * out at ~23px — less than the cap height of the type sitting on it, so the
 * letters crossed the dome's edge. Set deeper in, in the SVG's own units.
 */
const INSET_PHONE = 118;
/* where the path ends on each shoulder: degrees above the ellipse's centre */
const END_ANGLE = 28;
/* share of the path left empty at each end */
const END_PAD = 0.03;
/* gap between words when they are gathered at the crown, in viewBox units */
const TIGHT_GAP = 18;
/* share of the full shoulder-to-shoulder gap used once the words have opened */
const OPEN_GAP = 0.6;
/* type size while the words are gathered, as a share of the full size */
const MIN_SCALE = 0.45;
/* 0 = equal gaps between words, 1 = word centres mirrored about the crown */
const BALANCE = 0.5;
/* phone only: optical nudge to the right, as a share of the path length.
   Must stay under END_PAD or "LIFE" runs off the end of the path. */
const PHONE_NUDGE = 0.025;

const words = benefitsIntro.curvedTitle.split(" ");
/* first paint, before measuring: spread the words evenly */
const fallbackOffsets = words.map((_, i) => ((i + 0.5) / words.length) * 100);

export function BenefitsIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arcRef = useRef<SVGPathElement>(null);
  const wordRefs = useRef<(SVGTextPathElement | null)[]>([]);
  const [arc, setArc] = useState("M 124,250 A 432,402 0 0 1 876,250");
  /* path length, and each word's width at full type size */
  const [metrics, setMetrics] = useState<{ total: number; widths: number[] } | null>(null);
  const [spread, setSpread] = useState(0);
  const scale = MIN_SCALE + (1 - MIN_SCALE) * spread;
  /* the scale the words were painted at, so measured widths can be normalised */
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

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

      const inset = window.matchMedia("(max-width: 991px)").matches ? INSET_PHONE : INSET;
      const a = rx - inset;
      const b = ry - inset;
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
    const s = scaleRef.current;
    setMetrics({
      total: path.getTotalLength(),
      widths: wordRefs.current.map((w) => (w?.getComputedTextLength() ?? 0) / s),
    });
  }, [arc, fontsReady]);

  /* word centres along the path for the current spread and type size */
  let offsets: number[] | null = null;
  if (metrics) {
    const { total } = metrics;
    const widths = metrics.widths.map((w) => w * scale);
    const span = total * (1 - END_PAD * 2);
    /* the words stand further apart on a phone, where the arc is short and
       four words set close together read as one block of type */
    const phone =
      typeof window !== "undefined" && window.matchMedia("(max-width: 991px)").matches;
    const open = phone ? 1 : OPEN_GAP;
    const n = words.length;
    const half = Math.max(0.5, (n - 1) / 2); // gaps on each side of the crown
    const mix = (a: number, b: number, t: number) => a + (b - a) * t;

    /* equal gaps, with the middle of the phrase on the crown */
    const sideW = (from: number, to: number) => {
      let w = 0;
      for (let i = from; i < to; i++) w += widths[i];
      /* an odd middle word straddles the crown: half of it on each side */
      return n % 2 ? w + widths[(n - 1) / 2] / 2 : w;
    };
    const longSide = Math.max(sideW(0, Math.floor(n / 2)), sideW(Math.ceil(n / 2), n));
    const maxGap = (span / 2 - longSide) / half;
    const gap = mix(TIGHT_GAP, Math.max(TIGHT_GAP, mix(TIGHT_GAP, maxGap, open)), spread);
    const centres: number[] = [];
    let at = 0;
    widths.forEach((w) => {
      centres.push(at + w / 2);
      at += w + gap;
    });
    const pivot =
      n % 2 ? centres[(n - 1) / 2] : (centres[n / 2 - 1] + centres[n / 2]) / 2;
    const equal = centres.map((c) => c - pivot + total / 2);

    /* word centres at equal steps, mirrored about the crown */
    let tightStep = 0;
    for (let i = 0; i < n - 1; i++) {
      tightStep = Math.max(tightStep, (widths[i] + widths[i + 1]) / 2 + TIGHT_GAP);
    }
    const outer = Math.max(widths[0], widths[n - 1]) / 2;
    const maxStep = (span / 2 - outer) / half;
    const step = mix(tightStep, Math.max(tightStep, mix(tightStep, maxStep, open)), spread);
    const mirrored = widths.map((_, i) => total / 2 + (i - (n - 1) / 2) * step);

    if (phone) {
      /* equal gaps, whole phrase centred on the path, then nudged right */
      const used = widths.reduce((sum, w) => sum + w, 0);
      const fullGap = Math.max(TIGHT_GAP, (span - used) / Math.max(1, n - 1));
      const g = mix(TIGHT_GAP, fullGap, spread);
      let x = (total - (used + g * (n - 1))) / 2 + total * PHONE_NUDGE;
      offsets = widths.map((w) => {
        const mid = x + w / 2;
        x += w + g;
        return mid;
      });
    } else {
      const blended = equal.map((e, i) => mix(e, mirrored[i], BALANCE));
      /* slide along the path until both ends are equally far from the crown,
         keeping the gaps */
      const start = blended[0] - widths[0] / 2;
      const end = blended[n - 1] + widths[n - 1] / 2;
      const shift = (total - end - start) / 2;
      offsets = blended.map((o) => o + shift);
    }
  }

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
          <text
            className={styles.curvedText}
            style={{ "--title-scale": scale.toFixed(3) } as React.CSSProperties}
          >
            {words.map((word, i) => (
              <textPath
                key={word + i}
                ref={(el) => {
                  wordRefs.current[i] = el;
                }}
                href="#benefits-arc"
                startOffset={offsets ? offsets[i].toFixed(1) : `${fallbackOffsets[i]}%`}
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
