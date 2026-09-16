/**
 * Hero scroll choreography, sampled from the reference.
 *
 * Measured at 1440x900 with `tools/heroprobe.mjs`, which steps the reference
 * through its pinned hero in 150px increments and records the computed
 * transform of each layer. Rather than guess at an easing function (the
 * reference uses a GSAP `CustomEase`), the measured curves are baked in as
 * evenly-spaced samples and interpolated.
 *
 * What the reference actually does — and what earlier versions of this
 * component got wrong — is:
 *
 *   - the copy slides a full 80vh up and never fades;
 *   - the render stays full-bleed (it does not inset to the gutters);
 *   - the render parallaxes ~44vh, then zooms all the way to 2x.
 *
 * All three are expressed as a fraction of the pinned scroll distance, so they
 * hold at any viewport size.
 */

/** Pinned distance the hero occupies, as a multiple of the viewport height. */
export const HERO_SCREENS = 5.8;

/** Copy travel, as a fraction of viewport height (negative = upward). */
export const COPY_TRAVEL_VH = -0.8;

/** Render parallax, as a fraction of viewport height. */
export const PARALLAX_VH = -0.4444;

/** Final render scale at the end of the pin. */
export const ZOOM_TO = 2;

/**
 * Vertical transform-origin of the zoom. The reference does not scale about
 * the centre: solving its measured top/height pairs puts the focal point about
 * 62% down the *viewport* — roughly on the pool — so the frame swells outward
 * from there rather than symmetrically. Because this layer is viewport-sized
 * and has already parallaxed ~44vh up by the time the zoom starts, that lands
 * at ~107% of the layer's own height.
 */
export const ZOOM_ORIGIN_Y = "106.8%";

/** Fraction of the pin over which the copy completes its slide. */
export const COPY_END = 0.59;

/**
 * Fraction of the pin at which the zoom begins. The parallax keeps running on
 * the copy's ease past this point; the zoom simply overtakes it visually.
 */
export const ZOOM_START = 0.521;

/**
 * The shared "slow scroll" ease used by the copy and the parallax: a gentle
 * start, a fast middle, and a long decelerating tail.
 */
const EASE_SLOW = [
  0, 0.0408, 0.1206, 0.2366, 0.367, 0.4919, 0.5999, 0.6897, 0.7628, 0.8223,
  0.87, 0.9081, 0.9382, 0.9611, 0.9781, 0.9898, 0.9968, 1,
];

/** The zoom ease: almost flat, then a steep cubic run-up at the very end. */
const EASE_ZOOM = [
  0, 0.0057, 0.0096, 0.0146, 0.0213, 0.0308, 0.0427, 0.058, 0.0781, 0.102,
  0.1312, 0.1694, 0.2141, 0.2658, 0.3322, 0.4083, 0.4941, 0.596, 0.7152, 0.8495,
  1,
];

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Linear interpolation across an evenly-spaced sample table. */
function sample(table: number[], t: number) {
  const x = clamp01(t) * (table.length - 1);
  const i = Math.floor(x);
  if (i >= table.length - 1) return table[table.length - 1];
  return table[i] + (table[i + 1] - table[i]) * (x - i);
}

/** Eased progress of the copy slide, from the raw 0–1 pin progress. */
export const copyEase = (p: number) => sample(EASE_SLOW, p / COPY_END);

/** Eased progress of the render parallax — the same ease and range as the copy. */
export const parallaxEase = (p: number) => sample(EASE_SLOW, p / COPY_END);

/** Eased progress of the render zoom. */
export const zoomEase = (p: number) =>
  sample(EASE_ZOOM, (p - ZOOM_START) / (1 - ZOOM_START));
