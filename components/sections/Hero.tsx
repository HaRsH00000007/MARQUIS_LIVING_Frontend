"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { hero } from "@/lib/content";
import { SplitReveal, FadeIn, AccentReveal } from "../ui/Reveal";
import { ButtonCircle } from "../ui/Buttons";
import {
  COPY_TRAVEL_VH,
  PARALLAX_VH,
  ZOOM_TO,
  ZOOM_ORIGIN_Y,
  copyEase,
  parallaxEase,
  zoomEase,
} from "@/lib/heroCurves";
import styles from "./Hero.module.css";

/**
 * Hero. The reference pins this section for ~5.8 viewport heights and drives
 * three layers off that progress (curves measured in `lib/heroCurves`):
 *
 *   1. the copy slides 80vh upward on a slow-scroll ease, finishing at 59% of
 *      the pin — it never fades, it simply leaves the screen;
 *   2. the render parallaxes ~44vh over the same ease, staying full-bleed;
 *   3. from 52% onward the render zooms to 2x on a steep cubic, so it swells
 *      toward the viewer as the arch section rises over it.
 *
 * `hero.background` is the photographic layer; the MARQUIS LIVING type is set
 * in HTML inside `.screen`, the same copy layer the reference slides upward, so
 * every line rides the existing curve. The three curves above are untouched.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const stage = {
    "--hero-p": progress,
    "--hero-copy": copyEase(progress),
    "--hero-parallax": parallaxEase(progress),
    "--hero-zoom": zoomEase(progress),
    "--copy-travel": `${COPY_TRAVEL_VH * 100}vh`,
    "--parallax-travel": `${PARALLAX_VH * 100}vh`,
    "--zoom-range": ZOOM_TO - 1,
    "--zoom-origin-y": ZOOM_ORIGIN_Y,
  } as React.CSSProperties;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const distance = el.offsetHeight - window.innerHeight;
      setProgress(distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0);
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

  return (
    <section
      id="hero"
      ref={sectionRef}
      data-theme="dark"
      data-canvas="plum"
      className={`section clip theme_on-color ${styles.section}`}
      style={stage}
    >
      <div className={styles.sticky}>
      {/* ---------------------------------------------------------- render */}
      <div className={styles.bg}>
        <div className={styles.bgInner} data-hero-render>
          <Image
            src={hero.background}
            alt="Marquis Living — marble and brass living room interior"
            fill
            priority
            sizes="100vw"
            className={`${styles.render} ${styles.renderOn}`}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------ copy */}
      {/* The mask layer stays put while the copy slides through it, so the
          corner statements dissolve before they reach the fixed header. */}
      <div className={styles.copyMask}>
      <div className={styles.screen}>
        <div className={styles.title}>
          <h1 className={`h1 a-center ${styles.titleLine}`}>
            <SplitReveal mode="char" delay={0.9} immediate>
              {hero.wordmark[0]}
            </SplitReveal>
          </h1>
          <AccentReveal className={`a2 ${styles.script}`} delay={1.2} step={0.09} immediate>
            {hero.accent}
          </AccentReveal>
        </div>

        <p className={`h3 a-center ${styles.tagline}`}>
          <SplitReveal mode="word" delay={1.45} immediate>
            {hero.tagline}
          </SplitReveal>
        </p>

        {/* The statement is set twice, once in each bottom corner, as the
            reference composition does. */}
        <div className={styles.straps}>
          {(["left", "right"] as const).map((side) => (
            <div key={side} className={`${styles.strapCol} ${styles[side]}`}>
              <p className={`l2 reg ${styles.strapSmall}`}>
                <SplitReveal mode="line" delay={1.6} immediate>
                  {hero.strap.small}
                </SplitReveal>
              </p>
              <p className={`h5 ${styles.strapLarge}`}>
                <SplitReveal mode="word" delay={1.7} immediate>
                  {hero.strap.large}
                </SplitReveal>
              </p>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* The CTA row lives outside the fading copy layer, as it does on the
          reference, so it stays legible over the render while the hero scrolls. */}
      <div className={styles.foot}>
        <FadeIn delay={1.65} immediate>
          <ButtonCircle label={hero.cta.label} href={hero.cta.href} />
        </FadeIn>
      </div>
      </div>
    </section>
  );
}
