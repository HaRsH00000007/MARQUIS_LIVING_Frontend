"use client";

import { useEffect, useRef } from "react";
import { media } from "./media";
import { percentage, smooth } from "./scroll";

/**
 * The split hero.
 *
 * One photograph sits under an SVG clip path made of two rectangles. At rest
 * they are narrow columns pinned to the left and right edges of the 1600x900
 * viewBox, so only two slivers of the render show. As the section scrolls they
 * both widen to 800 and slide toward the middle — the left one holding its
 * edge, the right one travelling from x=1155 to x=800 — until the pair meets
 * and the image reads as a single uncut frame. Scrolled back, the halves part
 * again: one to the left, one to the right.
 *
 * Every keyframe number below is quoted from the WordPress build's `update()`
 * so the motion is the same one, not an approximation of it.
 */
export function SplitHero() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const q = <T extends Element>(sel: string) => hero.querySelector<T>(sel);
    const clipLeft = q<SVGRectElement>(".ml-clip-left");
    const clipRight = q<SVGRectElement>(".ml-clip-right");
    const splitMedia = q<HTMLElement>(".ml-split-media");
    const splitPhoto = q<SVGImageElement>(".ml-split-photo");
    const splitNumber = q<HTMLElement>(".ml-split-number");
    const splitScroll = q<HTMLElement>(".ml-split-scroll");
    const splitText = Array.from(hero.querySelectorAll<HTMLElement>(".ml-split-text"));
    const splitFinalCopy = Array.from(
      hero.querySelectorAll<HTMLElement>(".ml-split-final-copy"),
    );

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const alpha = (el: Element | null, n: number) => {
      if (el instanceof HTMLElement) el.style.opacity = Math.max(0, Math.min(1, n)).toFixed(4);
    };
    const trans = (el: Element | null, value: string) => {
      if (el instanceof HTMLElement || el instanceof SVGElement) el.style.transform = value;
    };

    /** Hand every driven property back to the stylesheet. */
    const reset = () => {
      hero.dataset.tone = "dark";
      [splitMedia, splitPhoto, splitNumber, splitScroll, ...splitText, ...splitFinalCopy].forEach(
        (el) => {
          if (!el) return;
          el.style.removeProperty("opacity");
          el.style.removeProperty("transform");
        },
      );
      splitMedia?.style.removeProperty("width");
      splitMedia?.style.removeProperty("height");
    };

    const draw = () => {
      frame = 0;
      if (reducedQuery.matches) return;

      const hp = percentage(hero);
      const merge = smooth(hp, 0.14, 0.38);
      const grow = smooth(hp, 0.46, 0.64);
      const full = smooth(hp, 0.67, 0.86);
      const copyOut = smooth(hp, 0.61, 0.78);
      const pan = smooth(hp, 0.82, 0.98);
      const finalIn = smooth(hp, 0.86, 0.95);

      hero.dataset.tone = full > 0.48 ? "dark" : "light";

      // the two halves closing on the centre
      if (clipLeft) {
        clipLeft.setAttribute("x", "0");
        clipLeft.setAttribute("y", (150 * (1 - merge)).toFixed(2));
        clipLeft.setAttribute("width", (445 + (800 - 445) * merge).toFixed(2));
        clipLeft.setAttribute("height", (700 + (900 - 700) * merge).toFixed(2));
      }
      if (clipRight) {
        clipRight.setAttribute("x", (1155 + (800 - 1155) * merge).toFixed(2));
        clipRight.setAttribute("y", "0");
        clipRight.setAttribute("width", (445 + (800 - 445) * merge).toFixed(2));
        clipRight.setAttribute("height", (760 + (900 - 760) * merge).toFixed(2));
      }

      // the frame itself opening out, then the photograph drifting inside it
      if (splitMedia) {
        splitMedia.style.width = `${48 + 12 * grow + 40 * full}vw`;
        splitMedia.style.height = `${74 + 8 * grow + 18 * full}vh`;
        trans(splitMedia, "translate3d(-50%,-50%,0)");
      }
      if (splitPhoto) {
        trans(splitPhoto, `translate3d(0,${-pan * 1.6}%,0) scale(${1 + pan * 0.045})`);
      }

      // the opening copy lifting away, the closing copy arriving under it
      splitText.forEach((el, i) => {
        alpha(el, 1 - copyOut);
        trans(el, `translate3d(0,${-copyOut * (18 + i * 4)}px,0)`);
      });
      splitFinalCopy.forEach((el, i) => {
        alpha(el, finalIn);
        trans(el, `translate3d(0,${(1 - finalIn) * (i ? 26 : 34)}px,0)`);
      });
      alpha(splitNumber, 1 - copyOut * 0.96);
      alpha(splitScroll, 1 - copyOut);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(draw);
    };
    const onMotionChange = () => {
      if (reducedQuery.matches) reset();
      else onScroll();
    };

    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reducedQuery.addEventListener("change", onMotionChange);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reducedQuery.removeEventListener("change", onMotionChange);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="ml-era-hero ml-split-hero"
      id="ml-content"
      data-tone="dark"
      aria-label="Marquis Living hero"
    >
      <div className="ml-era-hero-stage ml-split-stage">
        <div className="ml-split-heading ml-split-text">
          <span className="ml-label">Marquis Living / Dubai</span>
          <h1 className="ml-serif">
            A higher way <em>of living.</em>
          </h1>
        </div>

        <div className="ml-split-ghost-wordmark" aria-hidden="true">
          <span>MARQUIS</span>
          <span>LIVING</span>
        </div>

        <div className="ml-split-media" aria-hidden="true">
          <svg className="ml-split-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
            <defs>
              <clipPath id="mlHeroClip" clipPathUnits="userSpaceOnUse">
                <rect className="ml-clip-left" x="0" y="150" width="445" height="700" />
                <rect className="ml-clip-right" x="1155" y="0" width="445" height="760" />
              </clipPath>
            </defs>
            <image
              className="ml-split-photo"
              href={media.master}
              x="0"
              y="0"
              width="1600"
              height="900"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#mlHeroClip)"
            />
          </svg>
        </div>

        <aside className="ml-split-aside ml-split-aside-left ml-split-text">
          <span className="ml-label">Residence / 01</span>
          <h2 className="ml-serif">
            Living
            <br />
            with light.
          </h2>
          <p>
            One interior, first framed as an editorial composition, then revealed as one continuous
            place.
          </p>
        </aside>

        <aside className="ml-split-aside ml-split-aside-right ml-split-text">
          <span className="ml-label">Interiors / for a higher life</span>
          <h2 className="ml-serif">
            Quiet luxury.
            <br />
            Clear purpose.
          </h2>
          <p>
            Light, proportion and material are composed as part of one considered living experience.
          </p>
        </aside>

        <div className="ml-split-manifesto ml-split-text">
          <span className="ml-label">Marquis Living / Point of view</span>
          <h2 className="ml-serif">
            Spaces composed around light, proportion and the way life unfolds.
          </h2>
        </div>

        <div className="ml-split-final-copy ml-split-final-left">
          <span className="ml-label">MARQUIS LIVING / DUBAI</span>
          <h2 className="ml-serif">
            A home
            <br />
            shaped by light.
          </h2>
        </div>
        <div className="ml-split-final-copy ml-split-final-right">
          <span className="ml-label">INTERIORS / FOR A HIGHER LIFE</span>
          <p>
            Quietly elevated spaces where proportion, material and everyday life come together as
            one.
          </p>
        </div>

        <div className="ml-split-number">
          <span>01</span>
          <i />
          <span>03</span>
        </div>

        <div className="ml-split-scroll">
          <span className="ml-label">Scroll</span>
          <i />
        </div>
      </div>
    </section>
  );
}
