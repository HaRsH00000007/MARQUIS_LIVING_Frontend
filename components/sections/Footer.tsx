"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { footer } from "@/lib/content";
import { EraMark } from "../ui/EraMark";
import { useScrollTo } from "@/components/SmoothScroll";
import { SplitReveal } from "../ui/Reveal";
import { ArrowLong } from "../ui/Icons";
import styles from "./Footer.module.css";

/**
 * Footer.
 *
 * The reference reveals this with `.footer-s` scaling 0.75 -> 1 and fading in
 * (`trigger .footer-w, start "top 30%", end "bottom bottom", scrub .5`).
 *
 * The clip-path that goes with it belongs to the *CTA*, not here:
 * `[data-footer-clip]` is on the CTA's container, and the same timeline runs it
 * to `inset(8% 22% 8% 22%)`. So the render above contracts inward on all four
 * sides while the sky comes up behind it — which is why an earlier attempt to
 * inset this element horizontally read as a violet rectangle floating over the
 * CTA. See CallToAction.
 */
export function Footer() {
  const scrollTo = useScrollTo();
  const footerRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      /*
       * Progress must complete on *entry*, not on exit: the footer is the last
       * element on the page, so it never scrolls past the top and a
       * `height + viewport` denominator would cap it at 0.5 — leaving the
       * footer permanently at 87.5% scale and 80% opacity. Measuring against
       * the travel needed to bring it fully into view reaches 1 at the bottom.
       */
      const travel = Math.min(rect.height, viewH) || 1;
      const p = Math.min(1, Math.max(0, (viewH - rect.top) / travel));
      setProgress(p);
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

  const toTop = () => scrollTo(0);

  const scale = 0.75 + progress * 0.25;
  const opacity = Math.min(1, progress * 1.6);

  return (
    <footer
      ref={footerRef}
      data-theme="dark"
      data-canvas="sky"
      className={`section bleed theme_on-brand ${styles.section}`}
    >
      <div
        className={`container ${styles.inner}`}
        style={{
          transform: `scale(${scale})`,
          opacity: opacity,
          transformOrigin: "center center",
          willChange: "transform, opacity",
        }}
      >
        {/* ------------------------------------------------------- contact */}
        <div className={styles.contact}>
          <EraMark className={styles.mark} />
          <div className="u-32" />

          <p className={`l1 reg a-center ${styles.strap}`}>{footer.strap}</p>

          <div className="u-16" />

          <div className={styles.phoneWrap}>
            <a
              href={footer.phoneHref}
              className={`h2 a-center ${styles.phone}`}
              aria-label={`${footer.phone} ${footer.phoneRegion}`}
            >
              <SplitReveal mode="char" motion="fade" step={0.03}>
                {footer.phone}
              </SplitReveal>
            </a>
            <span className="l1 reg a-center">{footer.phoneRegion}</span>
          </div>

          <div className="u-48" />

          <address className={styles.offices}>
            {footer.offices.map((office) => (
              <div key={office.label} className={styles.office}>
                <span className="l1 reg a-center">{office.label}</span>
                {office.places.map((place) => (
                  <p key={place[1]} className={`l1 a-center ${styles.place}`}>
                    {place[0]}
                    <br />
                    {place[1]}
                  </p>
                ))}
              </div>
            ))}
          </address>

          <div className="u-32" />

          <ul className={styles.reach}>
            {footer.reach.map((r) => (
              <li key={r.href}>
                <a href={r.href} className={`l1 a-center ${styles.reachLink}`}>
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* -------------------------------------------------------- bottom */}
        <div className={styles.bottom}>
          <div className={styles.info}>
            <span className="l1">{footer.copyright}</span>
            <span className="l1 reg no-wrap">{footer.rights}</span>
            <div className="u-12" />
            <p className={`l1 reg ${styles.legal}`}>
              {footer.legal.map((l, i) => (
                <span key={l.href}>
                  <Link href={l.href}>
                    <u>{l.label}</u>
                  </Link>
                  {i < footer.legal.length - 1 && ", "}
                </span>
              ))}
            </p>
          </div>

          <div className={styles.credits}>
            <a
              href={footer.creditsHref}
              target="_blank"
              rel="noreferrer"
              className={styles.creditsLink}
            >
              <span className={styles.creditsMark} aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10.5" stroke="currentColor" />
                  <path d="M4 12h16" stroke="currentColor" />
                </svg>
              </span>
              <span className="l1 reg a-right">{footer.creditsLabel}</span>
              <span className={`l1 a-right ${styles.creditsName}`}>{footer.creditsName}</span>
            </a>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- to top */}
      <button type="button" className={styles.toTop} onClick={toTop}>
        <span className={styles.arrow} aria-hidden>
          <ArrowLong />
        </span>
        <span className="l2">{footer.toTop}</span>
      </button>
    </footer>
  );
}
