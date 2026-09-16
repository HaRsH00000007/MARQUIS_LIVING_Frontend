"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Pins a section and maps its vertical scroll onto horizontal travel of an
 * inner track — the mechanism behind the reference's Concept / Location panels.
 * Disabled below 992px, where the reference degrades to a vertical stack.
 *
 * The mapping is the reference's own, recovered from its animation bundle
 * (docs/webflow-recovery.md §3):
 *
 *   o.style.height = track.scrollWidth
 *   gsap.to(track, { x: -(scrollWidth - areaWidth), ease: "horScroll",
 *                    scrollTrigger: { start: "2.5% top", end: "97.5% bottom",
 *                                     scrub: 0.25 } })
 *
 * Three things in there matter, and this hook previously had all three wrong:
 *
 *  - **the ease.** `horScroll` is `cubic-bezier(0.25, 0, 0.75, 1)`, not linear.
 *    A linear map runs ahead of it through the first half of the travel, which
 *    is what put every element on the track a uniform ~427px too far left.
 *  - **the 2.5% insets.** The track holds still for the first and last 2.5% of
 *    the area, so the first panel settles before it starts moving and the last
 *    one rests before the pin releases. The old code spent that budget as
 *    *extra travel* instead, overshooting the track's own overflow by 540px.
 *  - **the scrub.** 0.25, not 1 — a much tighter follow.
 *
 * The pin itself is unchanged: same ScrollTrigger, same `pinType: "transform"`,
 * same `invalidateOnRefresh`. Only the numbers fed to it have changed.
 */
export function useHorizontalPin(
  sectionRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      /*
       * The reference sizes the scroll area to the track's own scroll width, so
       * a screen-height sticky panel leaves `scrollWidth - vh` of travel. That
       * lands within ~50px of the height this section already had, so the page
       * geometry the rest of the build is measured against does not move.
       */
      /*
       * The track's *content* width — the panels themselves, summed — rather
       * than `scrollWidth`. The reference reads `scrollWidth`, but on both
       * sites that number also counts the bougainvillea videos bleeding past
       * the last panel: 42px of overhang there, 99px here. Measuring the
       * panels instead keeps the mapping identical on both sides (4472px) and
       * stops a decorative element from silently setting the pin's length.
       */
      const contentWidth = () =>
        [...track.children].reduce((w, el) => w + (el as HTMLElement).offsetWidth, 0);

      const areaHeight = () => contentWidth();
      const pinLength = () => Math.max(1, areaHeight() - window.innerHeight);

      /* Travel is the track's overflow out of its own scroll area. Measured
         off the area rather than `innerWidth`: the two differ wherever the
         area is inset, as the reference's is, and a vertical scrollbar keeps
         them apart even here. */
      const areaWidth = () => track.parentElement?.clientWidth || window.innerWidth;
      const travel = () => Math.max(0, contentWidth() - areaWidth());

      /* 2.5% of the *area*, expressed as a fraction of the pinned travel. */
      const lead = () => Math.min(0.2, (0.025 * areaHeight()) / pinLength());

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${pinLength()}`,
            pin: true,
            /*
             * Pin by translating rather than by switching the section to
             * `position: fixed`. The fixed/static swap is a layout change, and
             * engaging and releasing this pin was contributing ~1.9 of layout
             * shift on a full-page scroll — the only shifts on the page.
             */
            pinType: "transform",
            scrub: 0.25,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
        .to({}, { duration: lead() })
        .to(track, { x: () => -travel(), ease: "horScroll", duration: () => 1 - 2 * lead() })
        .to({}, { duration: lead() });
    }, section);

    return () => ctx.revert();
  }, [sectionRef, trackRef, enabled]);
}
