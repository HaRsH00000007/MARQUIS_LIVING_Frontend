"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { concept } from "@/lib/content";
import { SplitReveal, FadeIn } from "../ui/Reveal";
import { ButtonCircle } from "../ui/Buttons";
import { FlipGallery } from "../ui/FlipGallery";
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
      <FlipGallery photos={intro.photos} />
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/era-mark.svg" alt="" className={styles.mark} />
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
    if (!el) return;
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
  }, []);

  const { intro, place } = concept.panels;
  const introScale = 0.75 + Math.min(1, progress * 2) * 0.25;
  const introOpacity = Math.min(1, progress * 2.5);

  /*
   * The reference counter-drifts the three title lines across the whole track,
   * `xPercent: wrap([-5, 25, -15]) -> wrap([5, -25, 25])`, linear, scrub .25
   * (docs/webflow-recovery.md §3). Reproduced literally: each line is a plain
   * lerp between its own pair over the section's scroll progress.
   */
  const drift = (from: number, to: number) => from + (to - from) * progress;
  const lineShift1 = drift(-5, 5);
  const lineShift2 = drift(25, -25);
  const lineShift3 = drift(-15, 25);

  return (
    <section ref={sectionRef} data-theme="light" data-canvas="cream" className={`section bleed clip ${styles.section}`}>
      <div className={styles.screen}>
        <div ref={trackRef} className={styles.track}>
          {/* ---------------------------------------------------- panel 1 */}
          <IntroPanel intro={intro} scale={introScale} opacity={introOpacity} />

          {/* ---------------------------------------------------- panel 2 */}
          <article className={`${styles.panel} ${styles.panelPlace}`}>
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

            <div className={styles.placeCopy}>
              <h4 className={`h5 a-left ${styles.placeCaption}`}>{place.caption}</h4>
              <div className="u-16" />
              <p className="p1">{place.body}</p>
            </div>

            {/* The reference parks a 187px circle CTA on the panel's right
                edge, level with the title. The previous build had a pill in
                the bottom-left corner because the 1440 panel had no room. */}
            <div className={styles.placeBtn}>
              <ButtonCircle label={place.cta.label} href={place.cta.href} />
            </div>
          </article>

          {/* ---------------------------------------------------- panel 3 */}
          {/* The concept intro again, closing the flip on the panel it opened
              with. By the time it arrives the section's progress has carried
              the copy to full scale and opacity. */}
          <IntroPanel intro={intro} scale={introScale} opacity={introOpacity} repeat />
        </div>
      </div>
    </section>
  );
}
