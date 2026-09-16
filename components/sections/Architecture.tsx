"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { architecture, architectureNotes } from "@/lib/content";
import { SplitReveal } from "../ui/Reveal";
import { ButtonCircle } from "../ui/Buttons";
import { documentTop } from "@/lib/layout";
import { clamp01, ease, lerp, phase } from "@/lib/motion";
import styles from "./Architecture.module.css";

/**
 * Architecture.
 *
 * The reference's composition here is **one render seen through two cream
 * shutters**, not two photographs side by side. `.arch-intro-s` is a sticky,
 * viewport-sized layer holding two solid cream panels — one over each half of
 * the screen — and each carries a `clip-path` that cuts a rectangular hole in
 * it. The render and its type sit behind, in `.arch-w`. As the holes grow the
 * render is revealed; once they reach the centre line the whole cream layer
 * scales to 1.84 and leaves the screen.
 *
 * The polygons and timings below are the reference's own, transcribed from its
 * animation bundle (docs/webflow-recovery.md §5). Its timeline is:
 *
 *   trigger .arch-intro-s, start "top bottom", end "200% top", scrub
 *     0 -> .5   both shutters open to their aligned window   (ease none)
 *     .5 -> .6  each hole runs out to the centre line        (ease none)
 *     .6 -> 1   shutters scale 1 -> 1.84, flowers scale and spread by ∓50%,
 *               and the render panel scales .75 -> 1         (ease InOut)
 *
 * The panel itself is 1579 tall at 1440 — `aspect-ratio: 144/168` on the
 * reference — and is `position: sticky` inside the 3379-tall scroll area, so it
 * holds at the top of the screen through the reveal and then scrolls away on
 * its own when the area runs out from under it. That is what keeps the credits
 * block below the fold until the render is fully open.
 *
 * Nothing about the page's scroll system changed to do this: no Lenis change,
 * no ScrollTrigger, the same rAF progress handler this component already used.
 * Only the composition it drives is different.
 */

/** Hole corners, in element percent, at each of the reference's keyframes. */
const LEFT = {
  from: { x0: 44.444, x1: 98.889, y0: 36.111, y1: 99.074 },
  mid: { x0: 44.444, x1: 98.889, y0: 18.519, y1: 81.481 },
  open: { x0: 44.444, x1: 100, y0: 18.519, y1: 81.481 },
};
const RIGHT = {
  from: { x0: 1.111, x1: 55.556, y0: 0.926, y1: 63.889 },
  mid: { x0: 1.111, x1: 55.556, y0: 18.519, y1: 81.481 },
  open: { x0: 0, x1: 55.556, y0: 18.519, y1: 81.481 },
};

type Hole = { x0: number; x1: number; y0: number; y1: number };

const mixHole = (a: Hole, b: Hole, t: number): Hole => ({
  x0: lerp(a.x0, b.x0, t),
  x1: lerp(a.x1, b.x1, t),
  y0: lerp(a.y0, b.y0, t),
  y1: lerp(a.y1, b.y1, t),
});

/**
 * A full-bleed rectangle with a rectangular hole cut in it, written the way the
 * reference writes it: the outline is traced, then a zero-width slit at
 * `slitX` lets the path travel in to the hole and back out again.
 */
const cover = (h: Hole, slitX: number) =>
  `polygon(0% 0%, 0% 100%, ${h.x0}% 100%, ${h.x0}% ${h.y0}%, ${h.x1}% ${h.y0}%, ` +
  `${h.x1}% ${h.y1}%, ${h.x0}% ${h.y1}%, ${slitX}% 100%, 100% 100%, 100% 0%)`;

export function Architecture() {
  const sectionRef = useRef<HTMLElement>(null);
  /** Progress over the reference's own trigger window, not the sticky range. */
  const [intro, setIntro] = useState(0);
  /** Progress over the whole scroll area, for the render's parallax. */
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const top = documentTop(el);
      /* "top bottom" -> "200% top": starts a screen before the section and runs
         for three screens, which is how the reference's trigger resolves. */
      setIntro(clamp01((window.scrollY - (top - vh)) / (3 * vh)));
      /* The reference measures the render's parallax against the whole scroll
         area — "55% top" to "bottom top" — not against the sticky span. */
      setProgress(clamp01((window.scrollY - top) / el.offsetHeight));
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

  /* 0 -> .5 open, .5 -> .6 run out to the centre line. */
  const openA = phase(intro, 0, 0.5);
  const openB = phase(intro, 0.5, 0.6);
  const left = openB > 0 ? mixHole(LEFT.mid, LEFT.open, openB) : mixHole(LEFT.from, LEFT.mid, openA);
  const right =
    openB > 0 ? mixHole(RIGHT.mid, RIGHT.open, openB) : mixHole(RIGHT.from, RIGHT.mid, openA);

  /* .6 -> 1, on the reference's `InOut`. */
  const lift = ease.inOut(phase(intro, 0.6, 1));
  const shutterScale = lerp(1, 1.84, lift);
  /* the notes drift out with the cream, and are gone before the render lands */
  const noteDrift = lerp(0, 22, lift);
  const noteFade = Math.max(0, 1 - lift * 1.7);
  const stageScale = lerp(0.75, 1, lift);

  /* `.img` parallaxes yPercent 25 from "55% top" to "bottom top". */
  const imgShift = phase(progress, 0.55, 1) * 25;

  /*
   * The reference holds the title and its strapline hidden until the scroll
   * area is 30% past the top (`ScrollTrigger.create({trigger: l, start: "30%
   * top"})`), then reveals them — the copy a `durS` behind the title. Viewport
   * entry is the wrong signal inside a sticky section, because the type is on
   * screen from the moment the section arrives.
   */
  const typeIn = progress >= 0.3;

  const vars = {
    "--stage-scale": stageScale,
    "--shutter-scale": shutterScale,
    "--img-shift": `${imgShift}%`,
  } as React.CSSProperties;

  return (
    <section
      id="architecture"
      ref={sectionRef}
      data-theme="dark"
      data-canvas="cream"
      className={`section bleed clip ${styles.section}`}
      style={vars}
      aria-labelledby="architecture-title"
    >
      {/* ------------------------------------------------------ shutters */}
      <div className={styles.shutters} aria-hidden>
        <div className={styles.shutterL} style={{ clipPath: cover(left, 1.111) }} />
        <div className={styles.shutterR} style={{ clipPath: cover(right, right.x0) }} />
      </div>

      {/* --------------------------------------------------------- notes */}
      {/*
        A layer of its own, above the cream and outside the shutters' own
        aria-hidden: this is real copy, and it must not scale with the panels
        the way the bougainvillea did. It drifts outward and clears as the
        render takes the screen.
      */}
      <div className={styles.notes}>
        <div
          className={styles.noteLeft}
          style={{ transform: `translateX(${-noteDrift}%)`, opacity: noteFade }}
        >
          <span className={`l1 reg ${styles.noteKicker}`}>{architectureNotes.left.kicker}</span>
          <h3 className={styles.noteTitle}>
            {architectureNotes.left.title[0]}
            <br />
            {architectureNotes.left.title[1]}
          </h3>
          {architectureNotes.left.body.map((line) => (
            <p key={line} className={`p2 ${styles.noteLine}`}>
              {line}
            </p>
          ))}
        </div>

        <div
          className={styles.noteRight}
          style={{ transform: `translateX(${noteDrift}%)`, opacity: noteFade }}
        >
          <span className={`l1 reg ${styles.noteKicker}`}>{architectureNotes.right.kicker}</span>
          <h3 className={styles.noteTitle}>{architectureNotes.right.title.join(" ")}</h3>
          {architectureNotes.right.body.map((line) => (
            <p key={line} className={`p2 ${styles.noteLine}`}>
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------- render + type */}
      <div className={`${styles.stage} theme_on-color`}>
        <div className={styles.stageBg} aria-hidden>
          <Image src={architecture.image} alt="" fill sizes="100vw" className={styles.img} />
          <span className={styles.scrim} />
        </div>

        <div className={`container ${styles.inner}`}>
          <div className={styles.top}>
            <h2 id="architecture-title" className={`h1 a-center ${styles.title}`}>
              <SplitReveal mode="char" revealed={typeIn}>
                {architecture.title}
              </SplitReveal>
            </h2>
            <div className="u-32" />
            <p className={`l1 a-center ${styles.introCopy}`}>
              <SplitReveal mode="line" revealed={typeIn} delay={0.4}>
                {architecture.intro}
              </SplitReveal>
            </p>
          </div>

          <div className={styles.bottom}>
            <div className={styles.quote}>
              <span className="red-line" aria-hidden />
              <div className="u-16" />
              <p className="h5">{architecture.quote}</p>
              <div className="u-64" />
              <p className="l1">{architecture.creditRole}</p>
              <p className="l1 reg muted">{architecture.creditName}</p>
            </div>
            <div className="b-desk">
              <ButtonCircle label={architecture.cta.label} href={architecture.cta.href} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
