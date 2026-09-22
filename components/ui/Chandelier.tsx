"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import styles from "./Chandelier.module.css";

/**
 * A pendant chandelier that hangs under the crown of an arched section.
 *
 * Two stacked plates — the unlit fixture and the lit one — plus a warm glow
 * behind the glass. Pointing at the fixture runs a GSAP timeline that cross
 * fades to the lit plate and blooms the glow; leaving reverses the same
 * timeline, so a quick in-and-out never leaves the lamp half lit.
 *
 * Purely decorative: the fixture is hidden from the accessibility tree and the
 * timeline is skipped entirely under `prefers-reduced-motion`.
 *
 * With `hover={false}` the fixture ignores the pointer and its light is driven
 * from outside instead: `flipLight` marks it for `useFlipPin`, which lights it
 * as its page flips in and dims it as the page flips out (see `lightTimeline`).
 */
/*
 * The fixtures. `pendant` is the arched sections' lamp, whose plates carry
 * extra cord above the fixture; `spiral` is the brass leaf spiral from the
 * client's lit render, trimmed below its ceiling canopy so the wires run
 * straight off the top of the plate. The lit plate is that render as supplied;
 * the unlit one is the same pixels with the lamps' glow graded down, so the two
 * share one silhouette and only the light crosses the fade.
 */
const PLATES = {
  pendant: { dim: "/images/chandelier-dim.png", lit: "/images/chandelier-lit.png", w: 226, h: 1061 },
  spiral: { dim: "/images/chandelier-leaf-dim.webp", lit: "/images/chandelier-leaf-lit.webp", w: 560, h: 1001 },
} as const;

export function Chandelier({
  side,
  variant = "pendant",
  hover = true,
  flipLight = false,
  className = "",
}: {
  side: "left" | "right";
  variant?: keyof typeof PLATES;
  hover?: boolean;
  flipLight?: boolean;
  className?: string;
}) {
  const plate = PLATES[variant];
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !hover) return;

    const dim = root.querySelector(`.${styles.dim}`);
    const lit = root.querySelector(`.${styles.lit}`);
    const glow = root.querySelector(`.${styles.glow}`);
    const spill = root.querySelector(`.${styles.spill}`);
    if (!dim || !lit || !glow || !spill) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "Out" } });

      /* the filament catches before it settles: a fast surge, then a small
         fall back to the steady burn. The unlit plate leaves ahead of the lit
         one arriving, so its dark rims never read through the lit glass. */
      tl.fromTo(lit, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 0)
        .fromTo(dim, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "In" }, 0)
        .fromTo(
          glow,
          { opacity: 0, scale: 0.72 },
          { opacity: 1, scale: 1.12, duration: 0.4 },
          0,
        )
        .to(glow, { scale: 1, duration: 0.5, ease: "InOut" }, 0.4)
        .fromTo(spill, { opacity: 0 }, { opacity: 1, duration: 0.7 }, 0.05);

      if (reduced) {
        tl.progress(1).pause();
        return;
      }

      const enter = () => tl.timeScale(1).play();
      const leave = () => tl.timeScale(1.6).reverse();

      root.addEventListener("pointerenter", enter);
      root.addEventListener("pointerleave", leave);
      /* a tap on touch lights it as well */
      root.addEventListener("focusin", enter);
      root.addEventListener("focusout", leave);

      return () => {
        root.removeEventListener("pointerenter", enter);
        root.removeEventListener("pointerleave", leave);
        root.removeEventListener("focusin", enter);
        root.removeEventListener("focusout", leave);
      };
    }, root);

    return () => ctx.revert();
  }, [hover]);

  return (
    <div
      ref={rootRef}
      className={`${styles.chandelier} ${side === "left" ? styles.left : styles.right} ${styles[variant]} ${className}`}
      data-flip-light={flipLight ? "" : undefined}
      aria-hidden
    >
      <span className={styles.spill} data-light="spill" />
      <span className={styles.glow} data-light="glow" />
      <Image
        src={plate.dim}
        alt=""
        width={plate.w}
        height={plate.h}
        className={`${styles.plate} ${styles.dim}`}
        sizes="12vw"
        data-light="dim"
      />
      <Image
        src={plate.lit}
        alt=""
        width={plate.w}
        height={plate.h}
        className={`${styles.plate} ${styles.lit}`}
        sizes="12vw"
        data-light="lit"
      />
    </div>
  );
}

/**
 * The lamp catching (or going out) as a standalone, un-paused timeline, for a
 * host to nest in its own scrubbed timeline. The same surge-and-settle as the
 * hover version, with every tween left un-rendered until the playhead reaches
 * it, so building the "off" pass never flashes the lamp on at load: the
 * stylesheet's own resting state (unlit) stands until scrolling moves it.
 */
export function lightTimeline(root: Element, on: boolean): gsap.core.Timeline {
  const part = (key: string) => root.querySelector(`[data-light="${key}"]`);
  const [lit, dim, glow, spill] = ["lit", "dim", "glow", "spill"].map(part);
  const tl = gsap.timeline({ defaults: { immediateRender: false } });
  if (!lit || !dim || !glow || !spill) return tl;

  if (on) {
    tl.fromTo(dim, { opacity: 1 }, { opacity: 0, duration: 0.3, ease: "In" }, 0)
      .fromTo(lit, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "Out" }, 0)
      .fromTo(glow, { opacity: 0, scale: 0.72 }, { opacity: 1, scale: 1.12, duration: 0.45, ease: "Out" }, 0.1)
      .to(glow, { scale: 1, duration: 0.45, ease: "InOut" }, 0.55)
      .fromTo(spill, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "Out" }, 0.2);
  } else {
    tl.fromTo(spill, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "In" }, 0)
      .fromTo(glow, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.72, duration: 0.55, ease: "In" }, 0)
      .fromTo(lit, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "In" }, 0.25)
      .fromTo(dim, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "Out" }, 0.3);
  }
  return tl;
}
