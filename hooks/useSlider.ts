"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  /** Milliseconds a slide holds before advancing on its own. 0 = no autoplay. */
  autoplayMs?: number;
  /** Freezes the autoplay clock — used while the slider is off-screen or hovered. */
  paused?: boolean;
}

/** Index state shared by the benefits, apartment-type and gallery sliders. */
export function useSlider(
  total: number,
  initial = 0,
  { autoplayMs = 0, paused = false }: Options = {},
) {
  const [index, setIndex] = useState(initial);
  /** 0–1 fraction of the current slide's hold that has elapsed. */
  const [autoProgress, setAutoProgress] = useState(0);
  const elapsed = useRef(0);

  const goto = useCallback(
    (next: number) => {
      // A click restarts the hold, so the rule always reads from the slide
      // that is actually on screen.
      elapsed.current = 0;
      setAutoProgress(0);
      setIndex(((next % total) + total) % total);
    },
    [total],
  );
  const next = useCallback(() => goto(index + 1), [goto, index]);
  const prev = useCallback(() => goto(index - 1), [goto, index]);

  const lastIndex = useRef(index);
  const running = autoplayMs > 0 && total > 1 && !paused;

  useEffect(() => {
    // An autoplayed advance restarts the hold; a pause/resume does not.
    if (lastIndex.current !== index) {
      lastIndex.current = index;
      elapsed.current = 0;
    }
    if (!running) return;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // Clamped, so a backgrounded tab (where rAF stops) doesn't come back and
      // skip several slides at once.
      elapsed.current += Math.min(now - last, 100);
      last = now;
      if (elapsed.current >= autoplayMs) {
        setAutoProgress(1);
        setIndex((i) => (i + 1) % total);
        return;
      }
      setAutoProgress(elapsed.current / autoplayMs);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, autoplayMs, total, index]);

  return {
    index,
    total,
    goto,
    next,
    prev,
    autoProgress,
    /** 0–1 fraction used to drive the pagination progress rule. */
    progress: total > 1 ? index / (total - 1) : 1,
  };
}
