"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { amenities, amenitiesCta } from "@/lib/content";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useScrollTabs } from "@/hooks/useScrollTabs";
import { useScrollTo } from "@/components/SmoothScroll";
import { gsap } from "@/lib/gsap";
import { ButtonCircle } from "../ui/Buttons";
import styles from "./Amenities.module.css";

/** Seconds the rising wipe takes to uncover the next amenity. */
const WIPE = 1.1;

/**
 * Screen heights of pinned hold after the four options, while the Interiors
 * dome climbs over the last frame. Must match `--amenity-hold` in the stylesheet.
 */
const HOLD = 1.8;

/** Milliseconds each amenity holds on phones before the next one wipes in. */
const PHONE_ADVANCE = 5000;

/*
 * The wipe is a full-width band anchored on the bottom edge. It starts collapsed
 * onto that edge (inset 100% from the top) and grows until it reaches the top,
 * so its leading edge is a straight horizontal line rising from the foot of the
 * frame to the head.
 */
const WIPE_FROM = "inset(100% 0% 0% 0%)";
const WIPE_TO = "inset(0% 0% 0% 0%)";

/**
 * Amenities. Pinned scroll area: scrolling advances active tab.
 * After the last option the render holds on screen, scaling 1.0 -> 2.0 while
 * the Interiors dome climbs over it.
 *
 * Each amenity's background is a looping video. A change of amenity is
 * revealed by a horizontal wipe rising from the
 * bottom edge, run by GSAP on `clip-path`; only the videos on screen play,
 * and only while the section is near the viewport. Under reduced motion the
 * stylesheet's cross-fade stands and the videos rest on their posters.
 */
export function Amenities() {
  const scrollTo = useScrollTo();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  const [index, setIndex] = useScrollTabs(sectionRef, amenities.length, isDesktop, HOLD);
  const [exit, setExit] = useState(0);

  /** The amenity fully on show, the slides currently visible, and whether the section is near the viewport. */
  const shownRef = useRef(0);
  const liveRef = useRef<Set<number>>(new Set([0]));
  const inViewRef = useRef(false);

  /* Plays the videos of the slides on screen and pauses every other one. */
  const syncVideos = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !("wipe" in stage.dataset)) return;
    [...stage.children].forEach((slide, i) => {
      const video = slide.querySelector("video");
      if (!video) return;
      if (inViewRef.current && liveRef.current.has(i)) {
        if (video.paused) video.play().catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !isDesktop) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      // the options' own span: the pinned hold at the end is not part of it
      const distance = el.offsetHeight - window.innerHeight * (1 + HOLD);
      // 0 -> 1 across the dome's climb, which is the first screen of the hold
      const t = (-rect.top - distance) / window.innerHeight;
      setExit(distance > 0 ? Math.min(1, Math.max(0, t)) : 0);
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
  }, [isDesktop]);

  /*
   * Phones: the section has no scroll span for the options, so scroll never
   * advances them — they step on a timer instead, through the same wipe, and
   * only while the section is on screen. Keyed on `index`, so a tapped tab
   * restarts the hold. Reduced motion leaves them where they are.
   */
  useEffect(() => {
    if (isDesktop) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const tick = () => {
      // off screen: hold this one and check again after another interval
      if (inViewRef.current) setIndex((index + 1) % amenities.length);
      else timer = window.setTimeout(tick, PHONE_ADVANCE);
    };
    timer = window.setTimeout(tick, PHONE_ADVANCE);
    return () => window.clearTimeout(timer);
  }, [isDesktop, index, setIndex]);

  /*
   * Switches the stage into wipe mode (motion allowed) and starts watching
   * whether the section is close enough to the viewport to play video.
   */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    stage.dataset.wipe = "";
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        syncVideos();
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(section);

    return () => {
      io.disconnect();
      const slides = [...stage.children];
      gsap.killTweensOf(slides);
      gsap.set(slides, { clearProps: "visibility,zIndex,clipPath" });
      stage.querySelectorAll("video").forEach((video) => video.pause());
      delete stage.dataset.wipe;
    };
  }, [syncVideos]);

  /*
   * The wipe. Runs before paint, so the arriving slide — which React has just
   * given the `on` class — never shows uncovered for a frame. The slide it
   * replaces stays fully visible underneath until the wipe has covered it; a
   * change that lands mid-wipe finishes the current one outright and starts
   * again from there.
   */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const from = shownRef.current;
    if (!stage || from === index) return;
    shownRef.current = index;
    if (!("wipe" in stage.dataset)) return;

    const slides = [...stage.children] as HTMLElement[];
    const incoming = slides[index];
    const outgoing = slides[from];
    if (!incoming || !outgoing) return;

    gsap.killTweensOf(slides);
    slides.forEach((slide, i) => {
      if (i !== index && i !== from)
        gsap.set(slide, { visibility: "hidden", zIndex: 0, clipPath: "none" });
    });
    gsap.set(outgoing, { visibility: "visible", zIndex: 1, clipPath: "none" });
    gsap.set(incoming, { visibility: "visible", zIndex: 2 });

    // start the arriving video on its first frame, which is also its poster
    const video = incoming.querySelector("video");
    if (video) video.currentTime = 0;
    liveRef.current = new Set([from, index]);
    syncVideos();

    gsap.fromTo(
      incoming,
      { clipPath: WIPE_FROM },
      {
        clipPath: WIPE_TO,
        duration: WIPE,
        ease: "InOut",
        onComplete: () => {
          gsap.set(outgoing, { visibility: "hidden", zIndex: 0 });
          gsap.set(incoming, { zIndex: 1, clipPath: "none" });
          liveRef.current = new Set([index]);
          syncVideos();
        },
      },
    );
  }, [index, syncVideos]);

  const select = (i: number) => {
    const el = sectionRef.current;
    if (!el || !isDesktop) {
      setIndex(i);
      return;
    }
    const distance = el.offsetHeight - window.innerHeight * (1 + HOLD);
    const target = el.offsetTop + (distance * (i + 0.5)) / amenities.length;
    scrollTo(target);
  };

  /*
   * Exit, during the hold: as the Interiors dome climbs from the foot of the
   * screen to the top, the render scales 1.0 -> 2.0 and the copy fades out over
   * the first half of the climb. The render itself does not fade — it stays on
   * screen until the dome has covered it, as the hero does under the benefits
   * dome, so no bare page colour shows behind the dome.
   */
  const stageScale = 1 + exit;
  const copyOpacity = 1 - Math.min(1, exit * 2);

  return (
    <section
      id="amenities"
      ref={sectionRef}
      data-theme="dark"
      data-canvas="sky"
      className={`section bleed bleed-top clip theme_on-color ${styles.section}`}
      aria-labelledby="amenities-title"
    >
      <div className={styles.sticky}>
        <h2 id="amenities-title" className="sr-only">
          Amenities
        </h2>

        <div
          ref={stageRef}
          className={styles.stage}
          style={{
            transform: `scale(${stageScale})`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {amenities.map((a, i) => (
            <div
              key={a.id}
              className={`${styles.slide} ${i === index ? styles.on : ""}`}
              aria-hidden={i !== index}
            >
              <video
                className={styles.media}
                src={a.video}
                poster={a.poster}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden
              />
              <span className={styles.scrim} aria-hidden />
            </div>
          ))}
        </div>

        <div
          className={`container ${styles.copy}`}
          style={{ opacity: copyOpacity, transition: "opacity 0.1s ease-out" }}
        >
          <div className={styles.copyInner}>
            <p className="l2">{amenities[index].name}</p>
            <div className="u-24" />
            <p className={`h5 ${styles.body}`}>{amenities[index].body}</p>
          </div>
        </div>

        <div
          className={`container ${styles.foot}`}
          style={{ opacity: copyOpacity, transition: "opacity 0.1s ease-out" }}
        >
          {/* the tab list and the CTA share one column, the button directly
              beneath the last tab */}
          <div className={styles.rail}>
            <div className={styles.tabs} role="tablist" aria-label="Amenities" data-hover-group="">
              {amenities.map((a, i) => (
                <button
                  key={a.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  data-hover-item=""
                  className={`l2 ${styles.tab} ${i === index ? `is-active ${styles.tabOn}` : ""}`}
                  onClick={() => select(i)}
                >
                  {a.name}
                </button>
              ))}
            </div>

            <div className={`b-desk ${styles.cta}`}>
              <ButtonCircle label={amenitiesCta.label} href={amenitiesCta.href} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
