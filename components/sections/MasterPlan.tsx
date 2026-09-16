"use client";

import Image from "next/image";
import { useRef } from "react";
import { masterPlan } from "@/lib/content";
import { SplitReveal } from "../ui/Reveal";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useDragPan } from "@/hooks/useDragPan";
import styles from "./MasterPlan.module.css";

/**
 * Master plan.
 *
 * On the reference this is not a picture sitting on a coloured panel — the
 * aerial *is* the ground for a screen and a half, its top edge dissolved into
 * the cream above it, and the place copy set small and white over the image. Painting a
 * plum field behind it is what produced a hard band between the concept panels
 * and the photo, so the section declares the cream it rises out of and lets the
 * render cover everything.
 *
 * Below 992px the plan reverts to normal flow and becomes drag-pannable, rather
 * than being squeezed to an unreadable width — the fallback the reference uses.
 */
export function MasterPlan() {
  const panRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  useDragPan(panRef, !isDesktop);

  return (
    <section
      data-theme="dark"
      data-canvas="cream"
      className={`section bleed clip theme_on-color ${styles.section}`}
    >
      <div className={styles.plate}>
        <div className={styles.planViewport} ref={panRef}>
          <Image
            src={masterPlan.image}
            alt="ERA Residence master plan"
            width={2400}
            height={1350}
            sizes="(max-width: 991px) 180vw, 100vw"
            className={styles.plan}
          />
        </div>
      </div>

      <span className={styles.veilTop} aria-hidden />
      <span className={styles.veilEnd} aria-hidden />

      <div className={`container ${styles.head}`}>
        <p className={`l1 b-mob ${styles.hint}`}>{masterPlan.dragHint}</p>
        <div className={styles.headText}>
          <span className="line-v" aria-hidden />
          <div className="u-24" />
          <h2 className="l1">
            <SplitReveal mode="line">{masterPlan.title}</SplitReveal>
          </h2>
          <div className="u-16" />
          <p className="p1 muted">{masterPlan.region}</p>
          <p className="p1 muted">{masterPlan.country}</p>
        </div>
      </div>
    </section>
  );
}
