"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { concept } from "@/lib/content";
import { SplitReveal, FadeIn } from "../ui/Reveal";
import { ButtonCircle } from "../ui/Buttons";
import { FlipGallery } from "../ui/FlipGallery";
import { Chandelier } from "../ui/Chandelier";
import { EraMark } from "../ui/EraMark";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useFlipPin } from "@/hooks/useFlipPin";
import { scrollProgress } from "@/lib/layout";
import styles from "./Concept.module.css";

type IntroPanelProps = {
  intro: (typeof concept)["panels"]["intro"];
  scale: number;
  opacity: number;
  /** Hides a repeat of the panel from assistive tech, so its copy is read once. */
  repeat?: boolean;
};

/**
 * The concept intro: the flipping photo gallery around the eyebrow, lead, body
 * and mark. The section opens on it and, as a repeat, closes on it too, so both
 * ends of the flip are the same panel rendered from the same markup.
 */
function IntroPanel({ intro, scale, opacity, repeat = false }: IntroPanelProps) {
  return (
    <article className={`${styles.panel} ${styles.panelIntro}`} aria-hidden={repeat || undefined}>
      {/* first in the panel, so the copy below always paints over it */}
      <FlipGallery photos={intro.photos} rightOnlyOnDesktop />
      {/* In the left gutter the photo reel left: unlit here, at both ends of
          the flip. The Built on Ambition page carries the lit one. */}
      <Chandelier side="left" variant="spiral" hover={false} className={styles.chandelierIntro} />
      <div
        className={styles.introInner}
        style={{
          transform: `scale(${scale})`,
          opacity,
          transition: "transform 0.1s ease-out, opacity 0.1s ease-out",
        }}
      >
        {/* upper band — the reference leaves this empty and lets the
            eyebrow + lead sit just above the panel's centre line */}
        <div className={styles.introTop} />

        <div className={styles.introMid}>
          <p className={`l1 a-center ${styles.eyebrow}`}>{intro.eyebrow}</p>
          <div className="u-32" />
          <div className={styles.leadWrap}>
            <h2 className="h4 a-center">
              <SplitReveal mode="word">{intro.lead}</SplitReveal>
            </h2>
          </div>
        </div>

        <div className={styles.introFoot}>
          <p className={`p1 a-center ${styles.introBody}`}>{intro.body}</p>
          <div className="u-32" />
          <EraMark className={styles.mark} />
        </div>
      </div>
    </article>
  );
}

/**
 * Concept / Built on Ambition. On desktop the section pins and its three panels
 * flip over one another in 3D as the page scrolls (`useFlipPin`); below 992px
 * they stack vertically. The first and last panels are the same concept intro,
 * with the burgundy Built on Ambition card between them.
 * Animates intro scale 0.75 -> 1.0 on entrance and horizontal line shifts.
 *
 * The panels are deliberately *not* the same width. Measured off the
 * reference the track is 1354 / 1764 / 1354; here the two outer panels are
 * widened to the full viewport so the track closes on both screen edges at the
 * ends of its travel (see `.screen` in the stylesheet). The middle panel's
 * extra 410px is what makes room for its four-column composition — title,
 * portrait, copy, circle CTA — which is why an equal-width track could never
 * place them correctly.
 *
 * Those widths still set the section's scroll length, and still apply on
 * phones; while the panels flip, each one is laid out a single screen wide
 * (see `.track[data-flip]` in the stylesheet).
 */
export function Concept() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const [progress, setProgress] = useState(0);

  useFlipPin(sectionRef, trackRef, isDesktop);

  useEffect(() => {
    const el = sectionRef.current;
    // Phones stack the panels, so there is no track for the scale, fade and
    // drift below to follow — and re-rendering the section on every scrolled
    // frame was pure cost there. The mobile values are fixed further down.
    if (!el || !isDesktop) return;
    let frame = 0;

    /*
     * Measured from layout, not from the section's rect: this section is
     * pinned, so its rect is translated with the scroll and `rect.top` never
     * leaves the top of the viewport. Reading it left `progress` effectively
     * frozen, which is why the panel titles barely drifted.
     */
    const update = () => {
      frame = 0;
      setProgress(scrollProgress(el));
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
  }, [isDesktop]);

  const { intro, place } = concept.panels;
  /*
   * On phones the intro is read in the normal flow of the page, so it sits at
   * full size and opacity: scaled from 0.75 and faded in off the section's
   * progress, it was still pale and shrunken by the time it reached the eye.
   */
  const introScale = isDesktop ? 0.75 + Math.min(1, progress * 2) * 0.25 : 1;
  const introOpacity = isDesktop ? Math.min(1, progress * 2.5) : 1;

  /*
   * The reference counter-drifts the three title lines across the whole track,
   * `xPercent: wrap([-5, 25, -15]) -> wrap([5, -25, 25])`, linear, scrub .25
   * (docs/webflow-recovery.md §3). Reproduced literally: each line is a plain
   * lerp between its own pair over the section's scroll progress.
   */
  // no drift on phones: at 20% of a phone-width word it pushed "Built" and
  // "Ambition" off the edge of the screen
  const drift = (from: number, to: number) => (isDesktop ? from + (to - from) * progress : 0);
  const lineShift1 = drift(-5, 5);
  const lineShift2 = drift(25, -25);
  const lineShift3 = drift(-15, 25);

  return (
    /*
     * React-owned wrapper for the pin. ScrollTrigger wraps the pinned section
     * in a `.pin-spacer`, and its cleanup (an effect) only runs after React has
     * removed the DOM — so without this, leaving the page asked <main> to
     * remove a section that now lived inside the spacer, and navigation threw
     * `removeChild: not a child of this node`. React removes this div instead.
     */
    <div>
    <section ref={sectionRef} data-theme="light" data-canvas="cream" className={`section bleed clip ${styles.section}`}>
      <div className={styles.screen}>
        <div ref={trackRef} className={styles.track}>
          {/* ---------------------------------------------------- panel 1 */}
          <IntroPanel intro={intro} scale={introScale} opacity={introOpacity} />

          {/* ---------------------------------------------------- panel 2 */}
          <article className={`${styles.panel} ${styles.panelPlace}`}>
            {/* Lit by the flip itself (useFlipPin): it catches as this page
                swings in and goes down as it swings out. */}
            <Chandelier side="right" variant="spiral" hover={false} flipLight className={styles.chandelierPlace} />

            <div className={styles.country}>
              <p className="c1 a-center">{place.country}</p>
            </div>

            <div className={styles.placeTitleWrap}>
              <h3 className={`h1 ${styles.placeTitle}`}>
                {place.title.map((word, i) => {
                  const shift = i === 0 ? lineShift1 : i === 1 ? lineShift2 : lineShift3;
                  return (
                    <span
                      key={word}
                      className={`${styles.placeLine} ${styles[`placeWord${i + 1}` as keyof typeof styles]}`}
                      style={{ transform: `translateX(${shift}%)`, transition: "transform 0.1s ease-out" }}
                    >
                      <SplitReveal mode="char">{word}</SplitReveal>
                    </span>
                  );
                })}
              </h3>
            </div>

            {/* The same interiors render as one of the first panel's flipping
                cards: `data-flip-zoom` has it grow from that card's size to
                fill this frame as the panel flips in. The zoom sits on the
                image, not on FadeIn's frame, whose own transform transition
                would drag a scroll-driven scale behind the scroll. */}
            <FadeIn className={styles.placeImg}>
              <Image
                src={place.image}
                alt="Three Marquis Living interiors: a living room, a hallway and a bedroom"
                width={1181}
                height={1331}
                sizes="(max-width: 991px) 90vw, 34vw"
                className={styles.placeImgTag}
                data-flip-zoom=""
              />
            </FadeIn>

            {/* The CTA leads the copy block, directly above its heading, so the
                three travel together wherever the block sits. */}
            <div className={styles.placeCopy}>
              <div className={styles.placeBtn}>
                <ButtonCircle label={place.cta.label} href={place.cta.href} />
              </div>
              <div className="u-32" />
              <h4 className={`h5 a-left ${styles.placeCaption}`}>{place.caption}</h4>
              <div className="u-16" />
              <p className="p1">{place.body}</p>
            </div>
          </article>

          {/* ---------------------------------------------------- panel 3 */}
          {/* The concept intro again, closing the flip on the panel it opened
              with. By the time it arrives the section's progress has carried
              the copy to full scale and opacity. */}
          {/* On phones the pages stack rather than flip, so this reads as the
              same panel twice; it is kept so the running order matches the
              desktop, with its copy hidden from assistive tech (`repeat`). */}
          <IntroPanel intro={intro} scale={introScale} opacity={introOpacity} repeat />
        </div>
      </div>
    </section>
    </div>
  );
}
