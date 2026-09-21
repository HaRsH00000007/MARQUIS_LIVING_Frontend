"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { interiors } from "@/lib/content";
import { SplitReveal, FadeIn, AccentReveal } from "../ui/Reveal";
import { ButtonCircle } from "../ui/Buttons";
import styles from "./Interiors.module.css";

type FounderInfo = (typeof interiors.founders)[number];

/** Name, role and a short bio set under a founder's portrait. */
function Founder({ founder, className = "" }: { founder: FounderInfo; className?: string }) {
  return (
    <div className={`${styles.founder} ${className}`}>
      <p className={styles.founderName}>{founder.name}</p>
      <p className={styles.founderRole}>{founder.role}</p>
      <p className={`p1 muted ${styles.founderBio}`}>{founder.bio}</p>
    </div>
  );
}

/**
 * Interiors. Arch top edge, a char-split display title closed by the script
 * accent, then a two-column feature.
 */
export function Interiors() {
  const sectionRef = useRef<HTMLElement>(null);

  /*
   * The dome opens out to the full width as it climbs: `--dome-open` runs from
   * 0, as the crown enters at the bottom of the screen, to 1 as it reaches the
   * top, eased at both ends. Written straight onto the element from a
   * rAF-throttled scroll handler, so scrolling never re-renders the section.
   */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const t = Math.min(1, Math.max(0, (vh - el.getBoundingClientRect().top) / vh));
      el.style.setProperty("--dome-open", (t * t * (3 - 2 * t)).toFixed(4));
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
      ref={sectionRef}
      id="interiors"
      data-theme="light"
      data-canvas="cream"
      className={`section arch clip ${styles.section}`}
      aria-labelledby="interiors-title"
    >

      <div className="container">
        <h2 id="interiors-title" className={`h1 a-center ${styles.title}`}>
          <SplitReveal mode="char">{interiors.title.join("\n")}</SplitReveal>
          <AccentReveal className={`a1 ${styles.accent}`} delay={0.35}>
            {interiors.accent}
          </AccentReveal>
        </h2>

        <div className="u-96" />

        <div className={styles.feature}>
          <div className={styles.featureLeft}>
            <FadeIn className={styles.featureMedia} hover-img-card="">
              <Image
                src={interiors.featureImage}
                alt={interiors.founders[0].name}
                width={693}
                height={677}
                sizes="(max-width: 991px) 90vw, 45vw"
                className={styles.img}
                data-hover="img"
              />
            </FadeIn>
            <Founder founder={interiors.founders[0]} className={styles.founderLeft} />
            <div className={styles.leadLeft}>
              <div className="u-48" />
              <span className="red-line" aria-hidden />
              <div className="u-16" />
              <p className="h5">
                <SplitReveal mode="line">{interiors.lead}</SplitReveal>
              </p>
            </div>
          </div>

          <div className={styles.featureRight}>
            <FadeIn className={styles.featureMedia} hover-img-card="" delay={0.1}>
              <Image
                src={interiors.sideImage}
                alt={interiors.founders[1].name}
                width={630}
                height={680}
                sizes="(max-width: 991px) 90vw, 45vw"
                className={styles.img}
                data-hover="img"
              />
            </FadeIn>
            <Founder founder={interiors.founders[1]} />
            <div className="u-64" />
            <div className={styles.leadRight}>
              <span className="red-line" aria-hidden />
              <div className="u-16" />
              <p className="h5">
                <SplitReveal mode="line">{interiors.leadRight}</SplitReveal>
              </p>
            </div>
            <div className="u-48" />
            <ButtonCircle label={interiors.cta.label} href={interiors.cta.href} />
          </div>
        </div>

        <div className="u-96" />
      </div>
    </section>
  );
}
