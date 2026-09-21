"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { lightTimeline } from "@/components/ui/Chandelier";

/**
 * How much of a lit panel's rest the lamp takes to catch after it has swung
 * in, and how early before it swings out the lamp starts to go down — so both
 * changes are seen face-on, not only while the page is edge-on.
 */
const LIGHT_ON_SETTLE = 0.3;
const LIGHT_OFF_LEAD = 0.3;

/**
 * The scroll length the section had when its panels slid sideways: two panels
 * one screen wide and the middle one at 1960 design units (122.5vw), end to
 * end. The flip keeps exactly that length, so the pin spacer — and every
 * section below it, the page canvas seams and the scroll rail — stay where
 * they were measured.
 */
const SPAN = 2 + 1960 / 1600;

/** Share of the pinned scroll each flip takes: half out, half in. */
const FLIP = 0.2;

/**
 * Scale a `[data-flip-zoom]` element starts from as its panel flips in, and how
 * far into that panel's rest it finishes growing. 0.3 is the concept photo
 * gallery's card against the middle panel's portrait frame, so the photo reads
 * as the card from the first panel arriving and opening up to full size.
 */
const ZOOM_FROM = 0.3;
const ZOOM_SETTLE = 0.35;

/**
 * Pins a section and turns its panels over one another in 3D as the page
 * scrolls, instead of sliding them sideways — the same flip as the concept
 * photo gallery, driven by scroll rather than a clock.
 *
 * The panels are stacked in place (see `.track[data-flip]`). The showing panel
 * swings to -90deg on Y, edge-on, and only then does the next one swing in
 * from +90deg, so two panels are never on screen together and never cut
 * through each other. Scrolling back plays it in reverse.
 *
 * Anything marked `data-flip-zoom` inside an incoming panel grows from
 * `ZOOM_FROM` to full size while that panel swings in, settling early in its
 * rest. Scale is kept at or below 1, so a frame with `overflow: hidden` never
 * crops it — it simply fills the frame as it grows.
 *
 * The pin itself is the horizontal slide's: same trigger, `pinType:
 * "transform"`, scrub and 2.5% rests at each end, so `scrollProgress` and
 * everything else that reads the pin spacer is unaffected. Disabled below
 * 992px and under reduced motion, where the stylesheet's own layout stands.
 */
export function useFlipPin(
  sectionRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || !enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const panels = [...track.children] as HTMLElement[];
    if (panels.length < 2) return;

    // switches the stylesheet from a sliding row to a stack of flipping panels
    track.dataset.flip = "";

    const ctx = gsap.context(() => {
      const areaHeight = () => window.innerWidth * SPAN;
      const pinLength = () => Math.max(1, areaHeight() - window.innerHeight);

      /* The ends and the flips are fixed shares; the panels split what is left
         evenly. Measured once — the ratio barely moves with the window, and
         the pin's own length is still re-read on every refresh. */
      const lead = Math.min(0.2, (0.025 * areaHeight()) / pinLength());
      const flips = panels.length - 1;
      const rest = Math.max(0.02, (1 - 2 * lead - flips * FLIP) / panels.length);

      gsap.set(panels[0], { rotationY: 0 });
      gsap.set(panels.slice(1), { rotationY: 90 });

      const tl = gsap.timeline({
        defaults: { immediateRender: false },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${pinLength()}`,
          pin: true,
          pinType: "transform",
          scrub: 0.25,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      tl.to({}, { duration: lead + rest });
      for (let i = 0; i < flips; i++) {
        /* A `[data-flip-light]` lamp on the outgoing panel goes down across
           the end of its rest and the swing out. Nested at absolute times
           (inserted, not appended) so no later flip moves. */
        const outLights = panels[i].querySelectorAll("[data-flip-light]");
        const outAt = tl.duration();
        outLights.forEach((lamp) => {
          const early = rest * LIGHT_OFF_LEAD;
          tl.add(lightTimeline(lamp, false).duration(early + FLIP / 2), outAt - early);
        });

        tl.fromTo(panels[i], { rotationY: 0 }, { rotationY: -90, duration: FLIP / 2, ease: "In" }, outAt)
          .fromTo(panels[i + 1], { rotationY: 90 }, { rotationY: 0, duration: FLIP / 2, ease: "Out" });

        /* …and one on the incoming panel catches as it swings in, glowing up
           to full early in its rest. */
        const inAt = outAt + FLIP / 2;
        panels[i + 1].querySelectorAll("[data-flip-light]").forEach((lamp) => {
          tl.add(lightTimeline(lamp, true).duration(FLIP / 2 + rest * LIGHT_ON_SETTLE), inAt);
        });

        /* The zoom starts with the flip-in ("<") and runs on into the rest;
           the rest is shortened by the same amount, so every later flip lands
           at exactly the scroll position it had without one. */
        const zoom = panels[i + 1].querySelectorAll<HTMLElement>("[data-flip-zoom]");
        const settle = zoom.length ? rest * ZOOM_SETTLE : 0;
        if (zoom.length) {
          tl.fromTo(zoom, { scale: ZOOM_FROM }, { scale: 1, duration: FLIP / 2 + settle, ease: "Out" }, inAt);
        }
        /* The rest is appended from the end of the swing-in, not from
           whatever nested tween ends last, so the schedule is unchanged. */
        tl.to({}, { duration: (i === flips - 1 ? rest + lead : rest) }, inAt + FLIP / 2);
      }
    }, section);

    return () => {
      ctx.revert();
      delete track.dataset.flip;
    };
  }, [sectionRef, trackRef, enabled]);
}
