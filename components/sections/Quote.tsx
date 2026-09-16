"use client";

import Image from "next/image";
import { quote } from "@/lib/content";
import { SplitReveal } from "../ui/Reveal";
import styles from "./Quote.module.css";

/**
 * The pull-quote, set as white type directly on the pool render — right-aligned
 * under an oversized opening mark, with the render at its natural 4:3 and no
 * parallax, exactly as the reference renders it.
 */
export function Quote() {
  return (
    <section data-theme="dark" data-canvas="sky" className={`section z-2 theme_on-brand ${styles.section}`}>
      <div className={`container ${styles.inner}`}>
        <figure className={`${styles.quote} theme_on-image`}>
          <span className={styles.glyph} aria-hidden>
            &ldquo;
          </span>
          <blockquote className={`h5 ${styles.text}`}>
            <SplitReveal mode="line">{quote.text}</SplitReveal>
          </blockquote>
          <div className="u-48" />
          <figcaption className={styles.author}>
            <span className="l1">{quote.authorRole}</span>
            <span className="l1 reg">{quote.authorName}</span>
          </figcaption>
        </figure>
      </div>

      <div className={styles.bg} aria-hidden>
        <span className={styles.shade} />
        <Image
          src={quote.image}
          alt="Modern building with flowering vines beside a rectangular swimming pool and palm trees."
          width={1920}
          height={1440}
          sizes="100vw"
          className={styles.img}
          priority
        />
      </div>

    </section>
  );
}
