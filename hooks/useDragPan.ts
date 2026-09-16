"use client";

import { useEffect, type RefObject } from "react";

/**
 * Pointer-drag horizontal panning for an overflow-x container — used by the
 * mobile master plan, where the reference replaces scrolling with "drag to see
 * more".
 */
export function useDragPan(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let down = false;
    let startX = 0;
    let startScroll = 0;

    const onDown = (e: PointerEvent) => {
      down = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      el.scrollLeft = startScroll - (e.clientX - startX);
    };
    const onUp = (e: PointerEvent) => {
      down = false;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [ref, enabled]);
}
