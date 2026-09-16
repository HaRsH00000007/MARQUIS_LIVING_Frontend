"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FlowerVideo.module.css";

interface Props {
  /** 1–7, matching public/videos/flower-0N.webm */
  index: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * One of the seven alpha-channel bougainvillea loops. The clips are ~3 MB each,
 * so the <video> element is only mounted once its wrapper nears the viewport;
 * an AVIF poster frame of the same clip holds the space until then.
 */
export function FlowerVideo({ index, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const id = String(index).padStart(2, "0");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { rootMargin: "50% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={[styles.flower, className].filter(Boolean).join(" ")} style={style} aria-hidden>
      {active ? (
        <video
          className={styles.media}
          src={`/videos/flower-${id}.webm`}
          poster={`/images/flower-${id}.avif`}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className={styles.media} src={`/images/flower-${id}.avif`} alt="" />
      )}
    </div>
  );
}
