/** Motion constants mirroring the reference's CSS motion tokens. */

export const DUR = { s: 0.4, m: 0.8, l: 1.2 } as const;

export const EASE = {
  /* the reference's own value — 0.75/0.25, not the 0.76/0.24 approximation */
  inOut: [0.75, 0, 0.25, 1],
  out: [0.25, 1, 0.5, 1],
  in: [0.5, 0, 0.75, 0],
  base: [0.25, 0.1, 0.25, 1],
  write: [0.333, 0, 0.667, 1],
} as const;

const bez = (e: readonly number[]) => `cubic-bezier(${e.join(",")})`;

export const CSS_EASE = {
  inOut: bez(EASE.inOut),
  out: bez(EASE.out),
  in: bez(EASE.in),
  base: bez(EASE.base),
  write: bez(EASE.write),
} as const;

/**
 * Evaluates a cubic-bezier timing curve at `t`, for scroll-scrubbed values that
 * have to be eased in JS rather than by a CSS transition.
 *
 * Newton-Raphson on x, which converges in a handful of steps for the curves
 * used here; the bisection fallback covers the flat-tangent case.
 */
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = sampleX(t) - x;
      if (Math.abs(d) < 1e-5) return sampleY(t);
      const s = slopeX(t);
      if (Math.abs(s) < 1e-6) break;
      t -= d / s;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const v = sampleX(t);
      if (Math.abs(v - x) < 1e-5) break;
      if (x > v) lo = t;
      else hi = t;
      t = (hi - lo) / 2 + lo;
    }
    return sampleY(t);
  };
}

/** The reference's own named eases (docs/webflow-recovery.md §3), for JS use. */
export const ease = {
  inOut: bezier(0.75, 0, 0.25, 1),
  out: bezier(0.25, 1, 0.5, 1),
  in: bezier(0.5, 0, 0.75, 0),
  base: bezier(0.25, 0.1, 0.25, 1),
  horScroll: bezier(0.25, 0, 0.75, 1),
} as const;

/** Clamps to 0..1 — the shape almost every scroll-driven value here needs. */
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Progress through a sub-range of an outer 0..1 progress, itself clamped. */
export const phase = (p: number, from: number, to: number) => clamp01((p - from) / (to - from));

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Per-item stagger delay, in seconds, capped so long lines never crawl. */
export const stagger = (index: number, step = 0.045, max = 0.6) =>
  Math.min(index * step, max);
