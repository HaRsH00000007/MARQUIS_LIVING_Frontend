"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { hero } from "@/lib/content";
import { SplitReveal, FadeIn } from "../ui/Reveal";
import { ButtonCircle } from "../ui/Buttons";
import { useReveal } from "@/hooks/useReveal";
import { gsap } from "@/lib/gsap";
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
 * The MARQUIS Living lockup, traced from the client's artwork into two
 * vectors — the capitals and the script — so each takes its own colour:
 * white capitals, the script in the champagne the old "living" line used.
 * Both are masks over a flat fill, so the artwork's hairlines stay sharp at
 * any size. The capitals rise in first; the script then writes on left to
 * right, as the per-letter reveal did.
 */
function HeroLockup() {
  const ref = useReveal<HTMLHeadingElement>(true);
  return (
    <h1 ref={ref} className={styles.lockup}>
      <span className="sr-only">
        {hero.wordmark[0]} {hero.accent}
      </span>
      <span className={styles.lockupWordmark} aria-hidden />
      <span className={styles.lockupScript} aria-hidden />
    </h1>
  );
}

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
  /*
   * The curves' resting values. Everything past this first frame is written
   * straight onto the element below: re-rendering the whole section on every
   * scrolled frame — which is what a state update here means — is what made
   * the opening scroll stutter once the hero was shortened and the values
   * began moving further per pixel.
   */
  const stage = {
    "--hero-p": 0,
    "--hero-copy": 0,
    "--hero-parallax": 0,
    "--hero-zoom": 0,
    "--copy-travel": `${COPY_TRAVEL_VH * 100}vh`,
    "--parallax-travel": `${PARALLAX_VH * 100}vh`,
    "--zoom-range": ZOOM_TO - 1,
    "--zoom-origin-y": ZOOM_ORIGIN_Y,
  } as React.CSSProperties;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    /*
     * A phone composites the render at `--zoom-range` times the screen every
     * frame; at the desktop's 2x that is a surface several times the screen on
     * a device with a fraction of the memory bandwidth, and the scroll drags.
     * A third of the zoom there keeps the move without the cost.
     */
    const phone = window.matchMedia("(max-width: 991px)");
    const setZoomRange = () =>
      el.style.setProperty("--zoom-range", phone.matches ? "0.35" : String(ZOOM_TO - 1));
    setZoomRange();
    phone.addEventListener("change", setZoomRange);

    let last = -1;

    const update = () => {
      const rect = el.getBoundingClientRect();
      /* off screen: nothing to place, and nothing to pay for */
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
      const distance = el.offsetHeight - window.innerHeight;
      const p = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;
      if (Math.abs(p - last) < 0.0001) return;
      last = p;
      el.style.setProperty("--hero-p", p.toFixed(4));
      el.style.setProperty("--hero-copy", copyEase(p).toFixed(4));
      el.style.setProperty("--hero-parallax", parallaxEase(p).toFixed(4));
      el.style.setProperty("--hero-zoom", zoomEase(p).toFixed(4));
    };

    /*
     * On the ticker, not on scroll events. Lenis moves the page from this same
     * frame loop, so reading the section's position here places the copy and
     * the render against the scroll position actually being painted. Driven by
     * scroll events the two ran a frame or two apart — on a phone, where those
     * events arrive in bursts, the copy visibly stepped rather than glided.
     */
    gsap.ticker.add(update);
    window.addEventListener("resize", update);
    return () => {
      phone.removeEventListener("change", setZoomRange);
      gsap.ticker.remove(update);
      window.removeEventListener("resize", update);
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
          <HeroLockup />
        </div>

        <p className={`h3 a-center ${styles.tagline}`}>
          <SplitReveal mode="word" delay={1.45} immediate>
            {hero.tagline}
          </SplitReveal>
        </p>

        {/* A statement in each bottom corner, as the reference composition
            does — but each corner carries its own, so the two read as separate
            claims. A corner with no `small` prints no label line at all. */}
        {/* The CTA sits in the middle of this row, level with the large
            strapline ("For the true connoisseurs of fine living"), so the two
            travel together as the copy layer rises. */}
        <div className={styles.straps}>
          <div className={styles.strapCta}>
            <FadeIn delay={1.65} immediate>
              <ButtonCircle label={hero.cta.label} href={hero.cta.href} />
            </FadeIn>
          </div>
          {(["left", "right"] as const).map((side) => {
            const strap = hero.strap[side];
            return (
              <div key={side} className={`${styles.strapCol} ${styles[side]}`}>
                {strap.small ? (
                  <p className={`l2 reg ${styles.strapSmall}`}>
                    <SplitReveal mode="line" delay={1.6} immediate>
                      {strap.small}
                    </SplitReveal>
                  </p>
                ) : null}
                <p className={`h5 ${styles.strapLarge}`}>
                  <SplitReveal mode="word" delay={1.7} immediate>
                    {strap.large}
                  </SplitReveal>
                </p>
              </div>
            );
          })}
        </div>
      </div>
      </div>

      </div>
    </section>
  );
}
