/**
 * The scroll-progress primitives the WordPress build animates everything from.
 * Ported one-for-one so the timings below read against the same numbers the
 * original did — every keyframe pair in the sections is quoted from it.
 */

export const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Normalise `n` onto 0..1 across [a, b]. */
export const range = (n: number, a: number, b: number) => clamp((n - a) / (b - a));

/** `range`, eased with smoothstep — the original's only easing function. */
export const smooth = (n: number, a: number, b: number) => {
  const t = range(n, a, b);
  return t * t * (3 - 2 * t);
};

/**
 * How far the viewport has travelled through `el`, 0 at the moment its top
 * reaches the top of the screen and 1 when its bottom does.
 *
 * The original read `geom.admin` here — the WordPress admin-bar offset. There
 * is no admin bar outside WP, so that term is simply 0.
 */
export const percentage = (el: HTMLElement | null) => {
  if (!el) return 0;
  const top = el.getBoundingClientRect().top;
  return clamp(-top / Math.max(1, el.offsetHeight - window.innerHeight));
};
