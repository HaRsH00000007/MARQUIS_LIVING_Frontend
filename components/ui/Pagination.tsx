"use client";

import styles from "./Pagination.module.css";
import { ArrowLeft, ArrowRight } from "./Icons";

interface Props {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
  /** Optional labels shown next to the arrows, as on the apartment slider. */
  labels?: { prev: string; next: string };
  /**
   * 0–1 override for the rule. Autoplaying sliders drive this per frame, so the
   * rule reads as a countdown to the next slide rather than a position marker.
   */
  progress?: number;
  /** Number shown on the right. Defaults to the slide count. */
  rightValue?: number;
}

/** The shared `.pag` control: `‹ 1 ——— 3 ›` with an animated progress rule. */
export function Pagination({
  index,
  total,
  onPrev,
  onNext,
  className,
  labels,
  progress,
  rightValue,
}: Props) {
  const pad = (n: number) => String(n).padStart(labels ? 1 : 1, "0");
  const live = progress !== undefined;
  const fill = live ? progress : total > 1 ? (index + 1) / total : 1;

  return (
    <div className={[styles.pag, className].filter(Boolean).join(" ")} data-slider="pag">
      <button type="button" className={styles.prev} onClick={onPrev} aria-label="Previous slide">
        <span className={styles.ico} aria-hidden>
          <ArrowLeft />
        </span>
        {labels && <span className="l2">{labels.prev}</span>}
      </button>

      <span className={`l1 ${styles.index}`} aria-live="polite">
        {pad(index + 1)}
      </span>

      <span className={styles.track} aria-hidden>
        <span
          className={styles.fill}
          // A per-frame value must not be eased on top of its own animation.
          style={{ transform: `scaleX(${fill})`, transition: live ? "none" : undefined }}
        />
      </span>

      <span className={`l1 ${styles.index} ${styles.total}`}>{pad(rightValue ?? total)}</span>

      <button type="button" className={styles.next} onClick={onNext} aria-label="Next slide">
        {labels && <span className="l2">{labels.next}</span>}
        <span className={styles.ico} aria-hidden>
          <ArrowRight />
        </span>
      </button>
    </div>
  );
}
