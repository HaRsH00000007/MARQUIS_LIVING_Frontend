"use client";

import { useEffect, useState } from "react";

/**
 * Reports whether the section currently under a fixed overlay (header, scroll
 * rail) is dark, so the overlay can invert its ink. Sections opt in with
 * `data-theme="light" | "dark"`, and the last one crossing the probe line wins.
 *
 * The probe sits at 35% of the viewport rather than at the header itself: the
 * arch sections rise from below and only their crown reaches the top of the
 * screen, so a probe at the very top would keep the previous section's ink long
 * after the new one has visually taken over — which is what the reference does.
 */
export function useSectionTheme(probeRatio = 0.35) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const probe = () => {
      const sections = document.querySelectorAll<HTMLElement>("[data-theme]");
      const y = window.innerHeight * probeRatio;
      let theme: string | undefined;
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) theme = s.dataset.theme;
      });
      setDark(theme !== "light");
    };

    probe();
    window.addEventListener("scroll", probe, { passive: true });
    window.addEventListener("resize", probe);
    return () => {
      window.removeEventListener("scroll", probe);
      window.removeEventListener("resize", probe);
    };
  }, [probeRatio]);

  return dark;
}
