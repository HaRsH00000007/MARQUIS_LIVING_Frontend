"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { apartmentTypes } from "@/lib/content";
import { useSlider } from "@/hooks/useSlider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Pagination } from "../ui/Pagination";
import { ButtonPill } from "../ui/Buttons";
import { useLenis } from "@/components/SmoothScroll";
import styles from "./ApartmentTypes.module.css";

/**
 * Apartment types.
 *
 * The reference shows **one layout at a time**, composed across the full
 * gutter width: a 396x528 portrait render in the middle, the spec column to its
 * left, the copy and CTA to its right, and the layout's name beneath at `h2`.
 * The slider swaps the whole showcase. Every offset is measured — see the
 * module CSS.
 *
 * The render is a ~5s clip rather than a still, and the slide it belongs to
 * holds until that clip ends: the `ended` event is what advances the slider,
 * not a timer, so the two can never drift apart. Prev/Next still work and
 * simply cut the current clip short.
 *
 * Nothing loads until the section is near the viewport, and the clips pause
 * again when it leaves. Under reduced motion no video is mounted at all — the
 * poster frame stands in and the slider is driven by its controls alone.
 */
export function ApartmentTypes() {
  const { index, total, next, prev } = useSlider(apartmentTypes.length);
  const stageRef = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [near, setNear] = useState(false);
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");
  const lenisRef = useLenis();

  /*
   * Arriving at `/#apartments` (the gallery's Back link): settle on these
   * slides. The pinned sections above only reach their final height once
   * ScrollTrigger has refreshed, so the jump is made after layout has settled
   * and checked once more a little later.
   */
  useEffect(() => {
    if (window.location.hash !== "#apartments") return;
    const jump = () => {
      const el = document.getElementById("apartments");
      if (!el) return;
      const top = Math.round(el.getBoundingClientRect().top + window.scrollY);
      if (Math.abs(window.scrollY - top) < 40) return;
      const lenis = lenisRef?.current;
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
    };
    const timers = [450, 1200].map((ms) => window.setTimeout(jump, ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [lenisRef]);

  /* Mount the clips only once the section is worth the bytes, and stop them
     again when it is gone. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "40% 0px",
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* The slide that is on screen plays from its first frame; the rest hold. A
     clip that runs its length hands over via `onEnded` below. */
  useEffect(() => {
    if (still) return;
    const live = videos.current[index];

    videos.current.forEach((v, i) => {
      if (v && i !== index) v.pause();
    });
    if (!live) return;

    if (!near) {
      live.pause();
      return;
    }

    live.currentTime = 0;
    void live.play().catch(() => {
      /* a blocked autoplay leaves the poster showing; the controls still work */
    });

    /*
     * The arriving frame settles rather than snapping on. CSS already
     * cross-fades the whole card; this is the render's own move, and GSAP owns
     * it so a fast Prev/Next overwrites the previous tween instead of stacking.
     */
    const tween = gsap.fromTo(
      live,
      { scale: 1.07, opacity: 0.35 },
      { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out", overwrite: "auto" },
    );
    return () => {
      tween.kill();
    };
  }, [index, near, still]);

  return (
    <section
      id="apartments"
      data-theme="dark"
      data-canvas="sky"
      className={`section theme_on-brand ${styles.section}`}
      aria-labelledby="apartment-types-title"
    >
      <div className={styles.inner}>
        <h2 id="apartment-types-title" className="sr-only">
          Apartment types
        </h2>

        <div ref={stageRef} className={styles.stage}>
          {apartmentTypes.map((a, i) => (
            <article
              key={a.id}
              className={`${styles.card} ${i === index ? styles.on : ""}`}
              aria-hidden={i !== index}
              inert={i !== index}
            >
              <div className={styles.spec}>
                <div className={styles.specCol}>
                  <span className="l2 muted">Project type</span>
                  <span className="h5">{a.projectType}</span>
                </div>
                <div className={styles.specCol}>
                  <span className="l2 muted">Typical size</span>
                  <span className="h5">{a.area}</span>
                </div>
              </div>

              <div className={styles.media}>
                {near && !still ? (
                  <video
                    ref={(el) => {
                      videos.current[i] = el;
                    }}
                    className={styles.img}
                    poster={`/videos/${a.video}-poster.webp`}
                    onEnded={i === index ? next : undefined}
                    muted
                    playsInline
                    preload={i === index ? "auto" : "none"}
                    aria-label={a.name}
                  >
                    <source src={`/videos/${a.video}.webm`} type="video/webm" />
                    <source src={`/videos/${a.video}.mp4`} type="video/mp4" />
                  </video>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    className={styles.img}
                    src={`/videos/${a.video}-poster.webp`}
                    alt={a.name}
                  />
                )}
              </div>

              <div className={styles.aside}>
                <p className={`p1 ${styles.body}`}>{a.body}</p>
                <div className="u-24" />
                <ButtonPill label={a.cta} href={a.href} />
              </div>

              <p className={`h2 a-center ${styles.name}`}>{a.name}</p>
            </article>
          ))}
        </div>

        <div className={styles.pag}>
          <Pagination
            index={index}
            total={total}
            onPrev={prev}
            onNext={next}
            labels={{ prev: "Prev", next: "Next" }}
          />
        </div>
      </div>
    </section>
  );
}
