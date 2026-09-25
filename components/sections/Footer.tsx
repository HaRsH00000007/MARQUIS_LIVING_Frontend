"use client";

import { useEffect, useRef } from "react";
import { footer } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import { documentTop } from "@/lib/layout";
import { clamp01 } from "@/lib/motion";
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
 * The clip-path that goes with it is applied to the *CTA*, not here:
 * `[data-footer-clip]` is on the CTA's container, and this same timeline runs
 * it to `inset(8% 22% 8% 22%)`. So the render above contracts inward on all
 * four sides while the sky comes up behind it — which is why an earlier attempt
 * to inset this element horizontally read as a violet rectangle floating over
 * the CTA. See CallToAction.
 */
export function Footer() {
  const scrollTo = useScrollTo();
  const footerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  /*
   * The reference's footer timeline, verbatim: one ScrollTrigger on the footer
   * drives both the CTA's `[data-footer-clip]` contracting inward and this
   * block scaling up, so the two can never drift apart. `end "bottom bottom"`
   * is the very bottom of the page, so both finish exactly as scrolling does.
   * Pages without a CTA (contact, 404) just get the scale-in.
   *
   * The window is measured live every frame rather than handed to
   * ScrollTrigger: the sections above set their own heights after mount (the
   * book, the sticky panels), and a trigger measured before that fired while
   * the CTA was still on screen — clipping the render the moment it arrived.
   * `scrub: 0.5` is reproduced as a 0.5s ease toward the live target.
   */
  useEffect(() => {
    const el = footerRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    const clipEl = document.querySelector<HTMLElement>("[data-footer-clip]");
    /* the render inside the clip: scaled with it, or the box shrank while the
       image stayed full size and was only cropped */
    const mediaEl = clipEl?.querySelector<HTMLElement>("[data-footer-clip-media]") ?? null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 992px)");

    const state = { p: 0 };
    let target = -1;

    const apply = () => {
      const p = state.p;
      if (clipEl) {
        /* v, h: the clip's inset (%); m: the render's scale once fully in */
        const [v, h, m] = desktop.matches ? [8, 22, 0.84] : [4, 32, 0.86];
        clipEl.style.clipPath =
          p > 0 ? `inset(${p * v}% ${p * h}% ${p * v}% ${p * h}%)` : "";
        /*
         * Uniform, so the render is not squashed, and about the centre, which
         * is the clip's centre too since the inset is even. `m` is bounded by
         * the box's height, not its width: the render must still fill the box
         * top to bottom with the CTA's parallax where it is when the footer
         * has fully arrived. Measured there, the floor is ~0.78 on the
         * desktop and ~0.82 on a phone; these leave a margin above it.
         */
        if (mediaEl) {
          mediaEl.style.transform = p > 0 ? `scale(${1 - p * (1 - m)})` : "";
        }
      }
      inner.style.opacity = String(p);
      inner.style.transform = `scale(${0.75 + p * 0.25})`;
    };

    const tick = () => {
      if (reduced.matches) {
        if (target !== 1) {
          target = state.p = 1;
          apply();
          if (clipEl) clipEl.style.clipPath = "";
          if (mediaEl) mediaEl.style.transform = "";
        }
        return;
      }
      /* "top 30%" -> "bottom bottom", in layout space */
      const vh = window.innerHeight;
      const top = documentTop(el);
      const start = top - vh * 0.3;
      const end = top + el.offsetHeight - vh;
      const y = window.scrollY;
      const next = end > start ? clamp01((y - start) / (end - start)) : y >= start ? 1 : 0;
      if (next === target) return;
      const first = target < 0;
      target = next;
      if (first) {
        state.p = next;
        apply();
      } else {
        gsap.to(state, { p: next, duration: 0.5, ease: "power3.out", overwrite: true, onUpdate: apply });
      }
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      gsap.killTweensOf(state);
      if (clipEl) clipEl.style.clipPath = "";
      if (mediaEl) mediaEl.style.transform = "";
    };
  }, []);

  /*
   * Arriving from another page's "Contact" link (`/#contact`): once the page
   * has laid out, settle at the bottom where the contact details sit. The
   * footer is the last thing on the page, so the bottom is its resting place.
   */
  useEffect(() => {
    if (window.location.hash !== "#contact") return;
    const t = window.setTimeout(
      () => scrollTo(document.documentElement.scrollHeight - window.innerHeight),
      400,
    );
    return () => window.clearTimeout(t);
    // run once on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toTop = () => scrollTo(0);

  return (
    <footer
      id="contact"
      ref={footerRef}
      data-theme="dark"
      data-canvas="sky"
      className={`section bleed theme_on-brand ${styles.section}`}
    >
      <div ref={innerRef} className={`container ${styles.inner}`}>
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
            <span className="l1 reg">{footer.bottomLeft.label}</span>
            <div className="u-8" />
            {footer.bottomLeft.lines.map((line) => (
              <span key={line} className="l1">
                {line}
              </span>
            ))}
          </div>

          <div className={styles.credits}>
            <span className="l1 reg a-right">{footer.bottomRight.label}</span>
            <div className="u-8" />
            {footer.bottomRight.lines.map((line) => (
              <span key={line} className="l1 a-right">
                {line}
              </span>
            ))}
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
