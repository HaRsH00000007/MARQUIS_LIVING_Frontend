"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { callToAction } from "@/lib/content";
import { SplitReveal } from "../ui/Reveal";
import { ButtonCircle } from "../ui/Buttons";
import { documentTop } from "@/lib/layout";
import { clamp01, lerp } from "@/lib/motion";
import styles from "./CallToAction.module.css";

/**
 * Closing CTA over the rooftop render.
 *
 * The reference sizes this block by `aspect-ratio: 144/168` on its inner
 * column — 1354 x 1579 at a 1440 viewport — rather than by padding, and bleeds
 * the render out past the gutters behind it. The render itself is 140% of the
 * frame's height and travels `yPercent: -15 -> 15` across the section
 * (`[data-parallax="img"]`, scrub .5), which is why it measures 1440x2211 on
 * the reference and not 1440x1579: the extra height is the parallax's travel.
 */
export function CallToAction() {
  const ref = useRef<HTMLElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const top = documentTop(el);
      /* "top bottom" -> "bottom top": the section's whole pass up the screen. */
      const p = clamp01((window.scrollY + vh - top) / (el.offsetHeight + vh));
      setShift(lerp(-15, 15, p));
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
      ref={ref}
      data-theme="dark"
      data-canvas="cream"
      className={`section bleed bleed-top bleed-bottom theme_on-color ${styles.section}`}
      style={{ "--cta-shift": `${shift}%` } as React.CSSProperties}
    >
      {/* Everything the footer clip contracts — render and type together, as
          `[data-footer-clip]` wraps both on the reference. The clip-path itself
          is driven by the Footer's timeline, which owns the trigger. */}
      <div data-footer-clip="" className={styles.clip}>
        {/* `data-footer-clip-media`: the Footer scales this layer down with the
            clip, so the render shrinks with the box instead of being cropped */}
        <div data-footer-clip-media="" className={styles.bg} aria-hidden>
          <span className={styles.imgWrap}>
            <Image src={callToAction.image} alt="" fill sizes="100vw" className={styles.img} />
          </span>
          <span className={styles.scrim} />
        </div>

        {/* the gutter lives on the container; the aspect-ratio has to sit on
            the column inside it, or it would be measured against the full 1440 */}
        <div className="container">
          <div className={styles.inner}>
            <p className={`l1 a-center ${styles.lead}`}>
              <SplitReveal mode="line">{callToAction.lead}</SplitReveal>
            </p>

            <div className="u-272" />

            <h2 className={`h1 a-center ${styles.title}`}>
              <SplitReveal mode="char">{callToAction.title.join("\n")}</SplitReveal>
            </h2>

            <div className="u-32" />
            <p className="c1 a-center">{callToAction.caption}</p>
            <div className="u-160" />

            <div className={styles.cta}>
              <ButtonCircle label={callToAction.cta.label} href={callToAction.cta.href} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
