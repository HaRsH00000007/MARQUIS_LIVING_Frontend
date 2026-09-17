"use client";

import { useEffect, useRef, useState } from "react";
import { EraMark } from "./ui/EraMark";
import styles from "./Preloader.module.css";

/**
 * Marquis Living Opening Animation & Preloader.
 * Replicates the authentic intro splash sequence from the reference:
 *  - 1st visit: 4s full intro splash with the quatrefoil mark, Interior /
 *    Marquis Living / Dubai typography, animated progress fill track,
 *    architectural decor frame lines, watermark background,
 *    and expanding arch mask reveal.
 *  - Repeat visits: sleek short arch reveal without blocking repeat visitors.
 *  - Hero sync: smoothly zooms the hero render scale (0.75 -> 1.0) during the arch lift.
 */
export function Preloader() {
  const [removed, setRemoved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let hasVisited = false;
    try {
      hasVisited = sessionStorage.getItem("hasVisited") === "true";
    } catch {}

    const el = containerRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Next frame rather than synchronously: setState in an effect body
      // triggers a cascading render (react-hooks/set-state-in-effect).
      const id = requestAnimationFrame(() => setRemoved(true));
      return () => cancelAnimationFrame(id);
    }

    const breakPoint = 992;
    const isDesktop = window.innerWidth >= breakPoint;

    const startArchW = isDesktop ? "24vw" : "40vw";
    const midArchW = isDesktop ? "36vw" : "50vw";
    const heroScaleStart = isDesktop ? 0.75 : 1.15;

    // Apply scale initial state to Hero render image
    /*
     * Drive the hero render's entry through `--hero-intro`, not `transform`.
     * The hero composes that variable into its own transform alongside the
     * scroll-driven parallax and zoom; writing `transform` here directly would
     * out-specify the stylesheet and freeze the render for the whole section.
     */
    const masterHeroImg = document.querySelector<HTMLElement>("[data-hero-render]");
    if (masterHeroImg) {
      masterHeroImg.style.setProperty("--hero-intro", String(heroScaleStart));
    }

    el.style.setProperty("--arch-w", startArchW);
    el.style.setProperty("--arch-y", "104vh");

    let isCancelled = false;

    import("gsap").then(({ default: gsap }) => {
      if (isCancelled) return;

      const durL = 1.2;

      const tl = gsap.timeline();

      if (!hasVisited) {
        // FULL INTRO (First Visit)
        const partsA = el.querySelectorAll('[data-part="a"]');
        const partsH = el.querySelectorAll('[data-part="h"]');
        const partsP = el.querySelectorAll('[data-part="p"]');
        const partsCtn = el.querySelectorAll('[data-part="ctn"]');
        const partsLine = el.querySelectorAll('[data-part="line"]');

        tl.to(partsCtn, { opacity: 1, y: 0, duration: durL, ease: "power2.out", stagger: 0.1 }, 0.1)
          .to(partsH, { opacity: 1, y: 0, duration: durL, ease: "power2.out", stagger: 0.1 }, 0.2)
          .to(partsA, { opacity: 1, duration: durL, ease: "power2.out" }, 0.3)
          .to(partsP, { opacity: 1, y: 0, duration: durL, ease: "power2.out" }, 0.4)
          .to(partsLine, { clipPath: "inset(0% 0% 0% 0%)", duration: durL, ease: "power2.out" }, 0.4);

        if (bgImgRef.current) {
          tl.fromTo(bgImgRef.current, { opacity: 0 }, { opacity: 0.06, duration: durL, ease: "power2.out" }, 0.2);
        }
        if (decorRef.current) {
          tl.fromTo(decorRef.current, { opacity: 0 }, { opacity: 1, duration: durL, ease: "power2.out" }, 0.2);
        }

        if (progressTrackRef.current) {
          tl.fromTo(progressTrackRef.current, { yPercent: -100 }, { yPercent: 0, duration: 2.4, ease: "power1.inOut" }, 0.4);
        }

        // Arch expand & lift
        tl.to(el, {
          "--arch-w": midArchW,
          "--arch-y": "15vh",
          duration: 1.25 * durL,
          ease: "power2.inOut",
        }, "+=0.2")
        .to(el, {
          "--arch-w": "125vw",
          "--arch-y": "-100vh",
          duration: 1.5 * durL,
          ease: "power3.in",
        }, "-=0.2");

        if (masterHeroImg) {
          tl.to(masterHeroImg, {
            "--hero-intro": 1,
            duration: 1.25 * durL,
            ease: "power2.inOut",
          }, "-=2.2");
        }
      } else {
        // SHORT INTRO (Repeat Visit)
        const ctn = el.querySelector("." + styles.ctn);
        if (ctn) (ctn as HTMLElement).style.display = "none";

        if (bgImgRef.current) {
          tl.fromTo(bgImgRef.current, { opacity: 0 }, { opacity: 0.06, duration: durL, ease: "power2.out" }, 0);
        }
        if (decorRef.current) {
          tl.fromTo(decorRef.current, { opacity: 0 }, { opacity: 1, duration: durL, ease: "power2.out" }, 0);
        }

        tl.to(el, {
          "--arch-w": midArchW,
          "--arch-y": "15vh",
          duration: 0.9 * durL,
          ease: "power2.inOut",
        }, 0.1)
        .to(el, {
          "--arch-w": "125vw",
          "--arch-y": "-100vh",
          duration: 1.2 * durL,
          ease: "power3.in",
        }, "-=0.15");

        if (masterHeroImg) {
          tl.to(masterHeroImg, {
            "--hero-intro": 1,
            duration: 1.0 * durL,
            ease: "power2.inOut",
          }, "-=1.5");
        }
      }

      tl.add(() => {
        setRemoved(true);
        try {
          sessionStorage.setItem("hasVisited", "true");
        } catch {}
      });
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  if (removed) return null;

  return (
    <div ref={containerRef} className={`${styles.preloader} theme_on-dark`} data-preloader aria-hidden>
      <div className={styles.ctn}>
        {/* Top ERA Logo symbol */}
        <div className={styles.t}>
          <div className="u-48" />
          <div className={styles.sLogo}>
            <div data-part="ctn" className={`${styles.logoSymbol} ${styles.partInitial}`}>
              <EraMark className={styles.markSvg} />
            </div>
          </div>
        </div>

        {/* Center Grid Title */}
        <div className={styles.c}>
          <div className="container">
            <div className="grid">
              <div className={styles.titleL}>
                <div data-part="h" className={`c1 a-center ${styles.partInitial}`}>Interior</div>
              </div>
              <div className={styles.logo}>
                <div data-part="h" className={`h3 a-center ${styles.partInitial}`}>
                  Marquis<br />Living
                </div>
                <div className={styles.logoA}>
                  <div data-part="a" className={`a2 ${styles.preloaderA} a-center ${styles.partInitial}`}>
                    Dubai
                  </div>
                </div>
              </div>
              <div className={styles.titleR}>
                <div data-part="h" className={`c1 a-center ${styles.partInitial}`}>Design</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Progress */}
        <div className={styles.b}>
          <div className="container">
            <div className="grid">
              <div className={styles.sTitle}>
                <div data-part="line" className={`${styles.progress} ${styles.partLineInitial}`}>
                  <div className={styles.progressFill}>
                    <div ref={progressTrackRef} className={styles.progressTrack} />
                  </div>
                </div>
                <div className="u-32" />
                <p data-part="p" className={`l1 a-center ${styles.partInitial}`}>
                  Marquis Living<br />A place to return to.
                </p>
              </div>
            </div>
          </div>
          <div className="u-48" />
        </div>
      </div>

      {/* Watermark & Frame Lines */}
      <div className={styles.bg}>
        <div ref={bgImgRef} className={styles.bgA}>
          <img src="/icons/preloader-bg.svg" loading="eager" alt="" className={styles.bgImg} />
        </div>
        <div ref={decorRef} className={styles.bgDecor}>
          <div className={styles.decor}>
            <div className={styles.frameLtb}>
              <svg width="100%" height="100%"><line x1="50%" y1="0%" x2="50%" y2="100%" strokeWidth="1" stroke="currentColor" vectorEffect="non-scaling-stroke" /></svg>
            </div>
            <div className={styles.frameLt}>
              <svg width="100%" height="100%"><line x1="0%" y1="100%" x2="100%" y2="0%" strokeWidth="1" stroke="currentColor" vectorEffect="non-scaling-stroke" /></svg>
            </div>
            <div className={styles.frameTlr}>
              <svg width="100%" height="100%"><line x1="0%" y1="50%" x2="100%" y2="50%" strokeWidth="1" stroke="currentColor" vectorEffect="non-scaling-stroke" /></svg>
            </div>
            <div className={styles.frameRt}>
              <svg width="100%" height="100%"><line x1="0%" y1="0%" x2="100%" y2="100%" strokeWidth="1" stroke="currentColor" vectorEffect="non-scaling-stroke" /></svg>
            </div>
            <div className={styles.frameRtb}>
              <svg width="100%" height="100%"><line x1="50%" y1="0%" x2="50%" y2="100%" strokeWidth="1" stroke="currentColor" vectorEffect="non-scaling-stroke" /></svg>
            </div>
            <div className={styles.frameRb}>
              <svg width="100%" height="100%"><line x1="0%" y1="100%" x2="100%" y2="0%" strokeWidth="1" stroke="currentColor" vectorEffect="non-scaling-stroke" /></svg>
            </div>
            <div className={styles.frameBlr}>
              <svg width="100%" height="100%"><line x1="0%" y1="50%" x2="100%" y2="50%" strokeWidth="1" stroke="currentColor" vectorEffect="non-scaling-stroke" /></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
