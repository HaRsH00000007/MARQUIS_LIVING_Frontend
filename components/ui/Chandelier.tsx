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
 */
export function Chandelier({ side }: { side: "left" | "right" }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

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
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${styles.chandelier} ${side === "left" ? styles.left : styles.right}`}
      aria-hidden
    >
      <span className={styles.spill} />
      <span className={styles.glow} />
      <Image
        src="/images/chandelier-dim.png"
        alt=""
        width={226}
        height={1061}
        className={`${styles.plate} ${styles.dim}`}
        sizes="12vw"
      />
      <Image
        src="/images/chandelier-lit.png"
        alt=""
        width={226}
        height={1061}
        className={`${styles.plate} ${styles.lit}`}
        sizes="12vw"
      />
    </div>
  );
}
