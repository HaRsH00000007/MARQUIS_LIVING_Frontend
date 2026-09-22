"use client";

import { useEffect, useRef } from "react";
import { documentTop } from "@/lib/layout";
import styles from "./PageCanvas.module.css";

/**
 * The page's ground.
 *
 * The reference reads as one uninterrupted surface even though its markup is a
 * stack of sections, because a change of palette is never a flat edge between
 * two blocks — it is either hidden behind an arch that rises over the block
 * above, or spread across a band of the page.
 *
 * This paints that second case. One fixed layer sits behind everything and
 * carries a gradient built from the sections' own declarations: a section names
 * the colour the page should be while it is on screen with
 * `data-canvas="<token>"`, and sections that carry `bleed` drop their own fill
 * and let this show through. Wherever two neighbours name different colours,
 * the layer dissolves between them over ~a fifth of a screen.
 *
 * The dissolve is spatial rather than timed, which is the whole point: a single
 * flat colour cross-fading on scroll cannot serve two sections at once when one
 * wants dark ink and the other light. A band in the page means each section's
 * own text always sits on its own ground, and only the gap between them moves.
 *
 * Nothing here re-renders React: the element's background is written directly
 * from a rAF-throttled scroll handler, as with the hero's scroll curves.
 */

type RGB = [number, number, number];
type Stop = { at: number; rgb: RGB };
type Seam = { at: number; from: RGB; to: RGB };

/** Height of a dissolve, as a fraction of the viewport. */
const BAND = 0.2;
/**
 * How much of that band sits above the seam. Weighted upward so the incoming
 * section's own area is almost entirely its own colour, and the dissolve is
 * carried by the outgoing section's bottom padding.
 */
const LEAD = 0.7;

const smooth = (t: number) => t * t * (3 - 2 * t);
const css = (c: RGB) => `rgb(${c[0]} ${c[1]} ${c[2]})`;

function mix(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** Reads `--c-<token>` off the root, so the palette stays defined in tokens.css. */
function readToken(token: string, cache: Map<string, RGB>): RGB {
  const hit = cache.get(token);
  if (hit) return hit;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--c-${token}`)
    .trim();
  const hex = raw.replace("#", "");
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex;
  const rgb: RGB = [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ];
  cache.set(token, rgb);
  return rgb;
}

export function PageCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cache = new Map<string, RGB>();
    let seams: Seam[] = [];
    let first: RGB = [0, 0, 0];
    let frame = 0;

    const measure = () => {
      /* `data-canvas-phone` overrides `data-canvas` below 992px, for a seam
         whose dissolve is wrong on a phone — see Interiors, where the cream
         swept up around the climbing dome. Read at measure time, and the
         measure re-runs on resize, so the desktop value is never stale. */
      const phone = window.innerWidth < 992;
      const stops: Stop[] = [...document.querySelectorAll<HTMLElement>("[data-canvas]")]
        .map((node) => ({
          at: documentTop(node),
          rgb: readToken(
            (phone ? node.dataset.canvasPhone : undefined) ?? node.dataset.canvas ?? "",
            cache,
          ),
        }))
        .sort((a, b) => a.at - b.at);

      first = stops[0]?.rgb ?? readToken("plum", cache);
      seams = [];
      for (let i = 1; i < stops.length; i++) {
        const from = stops[i - 1].rgb;
        const to = stops[i].rgb;
        if (from[0] === to[0] && from[1] === to[1] && from[2] === to[2]) continue;
        seams.push({ at: stops[i].at, from, to });
      }
    };

    /** The ground colour at an absolute document position. */
    const colourAt = (y: number, band: number): RGB => {
      let current = first;
      for (const seam of seams) {
        const a = seam.at - band * LEAD;
        const b = seam.at + band * (1 - LEAD);
        if (y >= b) {
          current = seam.to;
          continue;
        }
        if (y <= a) return current;
        return mix(seam.from, seam.to, smooth((y - a) / (b - a)));
      }
      return current;
    };

    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

    const paint = () => {
      frame = 0;
      const vh = window.innerHeight;
      const band = vh * BAND;
      const y0 = window.scrollY;
      const y1 = y0 + vh;

      // Only the seams crossing the window need stops. A gradient's first and
      // last stops extend past their positions, which covers everything else.
      const parts: string[] = [];
      let lastPct = -Infinity;
      for (const seam of seams) {
        const a = seam.at - band * LEAD;
        const b = seam.at + band * (1 - LEAD);
        if (b < y0 || a > y1) continue;
        // Positions must not decrease; two seams closer together than the band
        // would otherwise collapse into an invalid gradient.
        const aPct = Math.max(lastPct, ((a - y0) / vh) * 100);
        const bPct = Math.max(aPct, ((b - y0) / vh) * 100);
        parts.push(`${css(seam.from)} ${aPct.toFixed(2)}%`, `${css(seam.to)} ${bPct.toFixed(2)}%`);
        lastPct = bPct;
      }

      if (parts.length) {
        el.style.backgroundImage = `linear-gradient(to bottom, ${parts.join(", ")})`;
      } else {
        el.style.backgroundImage = "none";
        el.style.backgroundColor = css(colourAt(y0 + vh * 0.5, band));
      }

      // Mobile browsers tint their own chrome from this, so the address bar
      // travels with the page instead of holding the hero's plum all the way
      // down. Sampled near the top of the screen, which is what it sits over.
      const top = css(colourAt(y0 + vh * 0.08, band));
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "theme-color";
        document.head.appendChild(meta);
      }
      meta.content = top;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    };

    const remeasure = () => {
      measure();
      paint();
    };

    remeasure();

    // Section heights move as fonts settle and images decode, and several
    // sections are sized in vw — so watch the document, not just the window.
    const ro = new ResizeObserver(remeasure);
    const main = document.getElementById("main");
    if (main) ro.observe(main);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", remeasure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={ref} className={styles.canvas} aria-hidden />;
}
