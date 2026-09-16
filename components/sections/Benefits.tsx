"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { benefits } from "@/lib/content";
import { useSlider } from "@/hooks/useSlider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Pagination } from "../ui/Pagination";
import styles from "./Benefits.module.css";

/**
 * The Benefits / Concept Slider.
 * Auto-advances automatically:
 *   - The pagination loading bar fills smoothly from 0% to 100% over 4s;
 *   - When loaded (100%), the slide automatically transitions with a ~1s clip-path
 *     polygon wipe, inner image zoom (1.5 -> 1.0), title slide, and copy reveal;
 *   - Then the loading bar resets to 0% and starts auto-advancing to the next slide.
 */

const OUT_CHAR = 260;
const OUT_SPREAD = 260;
const IN_CHAR = 420;
const IN_SPREAD = 520;
const SWAP_AT = OUT_CHAR + OUT_SPREAD;
const WIPE_DELAY = 120;
const WIPE_DUR = 680;
/** Autoplay hold time before slide transition triggers */
const AUTOPLAY = 4000;

const WIPE_SHOWN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const WIPE_HIDDEN_RIGHT = "polygon(100% 0%, 100% 0%, 101% 100%, 125% 100%)";
const WIPE_HIDDEN_LEFT = "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";

type Phase = "idle" | "out" | "in";

function Title({ text, phase, direction }: { text: string; phase: Phase; direction: "next" | "prev" }) {
  const words = text.split(" ");
  const last = Math.max(1, Array.from(text).length - 1);
  const spread = phase === "out" ? OUT_SPREAD : IN_SPREAD;
  let i = 0;

  const slideX = phase === "out" ? (direction === "next" ? "-30px" : "30px") : "0px";

  return (
    <span
      className={styles.chars}
      aria-label={text}
      style={{
        transform: `translateX(${phase === "idle" ? "0px" : slideX})`,
        opacity: phase === "out" ? 0 : 1,
        transition: `transform ${IN_CHAR}ms var(--ease-out), opacity ${IN_CHAR}ms var(--ease-out)`,
      }}
    >
      {words.map((word, w) => {
        if (w > 0) i++;
        return (
          <span key={w} aria-hidden>
            {w > 0 && " "}
            <span className={styles.word}>
              {Array.from(word).map((char) => {
                const delay = (i++ / last) * spread;
                return (
                  <span
                    key={i}
                    className={styles.char}
                    data-phase={phase}
                    style={{ "--char-delay": `${delay}ms` } as React.CSSProperties}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [inView, setInView] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const { index, total, next, prev, autoProgress } = useSlider(benefits.length, 0, {
    autoplayMs: reduced ? 0 : AUTOPLAY,
    paused: !inView,
  });

  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [under, setUnder] = useState(-1);
  const [tracked, setTracked] = useState(index);

  if (tracked !== index) {
    setDirection(index > tracked || (tracked === benefits.length - 1 && index === 0) ? "next" : "prev");
    setTracked(index);
    setUnder(tracked);
    setPhase("out");
  }

  if (phase === "idle" && inView) setPhase("in");

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "0px 0px -15% 0px",
      threshold: 0,
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (under < 0) return;
    const t = setTimeout(() => setUnder(-1), WIPE_DELAY + WIPE_DUR + 60);
    return () => clearTimeout(t);
  }, [under]);

  useEffect(() => {
    if (phase !== "out") return;
    const t = setTimeout(
      () => {
        setShown(index);
        setPhase("in");
      },
      reduced ? 0 : SWAP_AT,
    );
    return () => clearTimeout(t);
  }, [phase, index, reduced]);

  const slide = benefits[shown];
  const wiping = under >= 0;

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      data-canvas="sky"
      className={`section z-2 theme_on-brand ${styles.section}`}
      style={
        {
          "--out-char": `${OUT_CHAR}ms`,
          "--in-char": `${IN_CHAR}ms`,
        } as React.CSSProperties
      }
    >
      <div className="container">
        <div className={styles.stage}>
          <h3 className={`h1 a-center ${styles.title}`}>
            <Title key={`${shown}-${phase}`} text={slide.title} phase={phase} direction={direction} />
          </h3>

          <div className={styles.figure}>
            <span className={styles.frame} hover-img-card="">
              {benefits.map((b, i) => {
                const isActive = i === index;
                const isUnder = i === under;
                const clip = isActive
                  ? WIPE_SHOWN
                  : isUnder
                  ? WIPE_HIDDEN_LEFT
                  : WIPE_HIDDEN_RIGHT;

                return (
                  <span
                    key={b.id}
                    className={`${styles.layer} ${isActive ? styles.layerActive : ""}`}
                    aria-hidden={!isActive}
                    style={{
                      clipPath: clip,
                      transition:
                        isActive && wiping
                          ? `clip-path ${WIPE_DUR}ms cubic-bezier(0.76, 0, 0.24, 1) ${WIPE_DELAY}ms`
                          : isUnder
                          ? `clip-path ${WIPE_DUR}ms cubic-bezier(0.76, 0, 0.24, 1) ${WIPE_DELAY}ms`
                          : "none",
                      zIndex: isActive ? 2 : isUnder ? 1 : 0,
                    }}
                  >
                    <Image
                      src={b.image}
                      alt={b.title}
                      width={1600}
                      height={900}
                      sizes="(max-width: 991px) 90vw, 40vw"
                      className={styles.img}
                      style={{
                        transform: isActive ? "scale(1) translateX(0%)" : "scale(1.5) translateX(25%)",
                        transition: `transform ${WIPE_DUR}ms cubic-bezier(0.76, 0, 0.24, 1) ${WIPE_DELAY}ms`,
                      }}
                      data-hover="img"
                    />
                  </span>
                );
              })}
            </span>
          </div>

          <div className={styles.copy} data-phase={phase}>
            <p className={`p1 a-center ${styles.body}`}>{slide.body}</p>
            <p className={`l1 a-center ${styles.kicker}`}>
              {slide.kicker.split("\n").map((line, i) => (
                <span key={i} className={styles.kickerLine}>
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div className="u-32" />
        <Pagination
          index={index}
          total={total}
          onPrev={prev}
          onNext={next}
          progress={reduced ? undefined : autoProgress}
          rightValue={((index + 1) % total) + 1}
        />
      </div>
    </section>
  );
}
