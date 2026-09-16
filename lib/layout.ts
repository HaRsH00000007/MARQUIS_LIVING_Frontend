/**
 * Layout-space measurement helpers.
 *
 * Anything that reads a section's position in order to drive scroll maths has
 * to be careful on this page, because two of its sections are pinned. While a
 * pin is engaged ScrollTrigger *translates* the section, so
 * `getBoundingClientRect()` reports where the section is being painted, not
 * where it lives in the document — the rect travels with the scroll. Reading
 * that value produced two separate defects: the page canvas placed the
 * Concept section's colour stop up to 4 600px late, and the Concept panels'
 * own scroll progress never left zero.
 *
 * `offsetTop` and `offsetHeight` are layout, not paint: transforms do not move
 * them. These helpers are the only thing the scroll code should use.
 */

/** Distance from the top of the document, immune to any transform. */
export function documentTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

/**
 * The box that holds a section's place in the document flow.
 *
 * A pinned section keeps its own height (one screen) and hands its scroll
 * length to a spacer that ScrollTrigger inserts around it. That spacer is the
 * box whose height is the section's real scroll range, so it — not the section
 * — is what a progress calculation has to measure.
 */
export function layoutBox(el: HTMLElement): HTMLElement {
  const parent = el.parentElement;
  return parent?.classList.contains("pin-spacer") ? parent : el;
}

/**
 * How far through a section's scroll range the page currently is, 0 → 1.
 * Correct whether or not the section is pinned.
 */
export function scrollProgress(el: HTMLElement): number {
  const box = layoutBox(el);
  const span = box.offsetHeight - window.innerHeight;
  if (span <= 0) {
    // Not a scroll-length section: fall back to its travel through the viewport.
    const top = documentTop(box);
    const through = window.scrollY + window.innerHeight - top;
    const total = box.offsetHeight + window.innerHeight;
    return Math.min(1, Math.max(0, through / total));
  }
  return Math.min(1, Math.max(0, (window.scrollY - documentTop(box)) / span));
}
