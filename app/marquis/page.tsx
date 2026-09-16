import type { Metadata } from "next";
import { Shell } from "@/components/marquis/Shell";
import { SplitHero } from "@/components/marquis/SplitHero";
import "./marquis.css";

export const metadata: Metadata = {
  title: "Marquis Living / Dubai",
  description:
    "A higher way of living. Spaces composed around light, proportion and the way life unfolds.",
};

/**
 * Marquis Living — the `data-view="home"` experience rebuilt as React.
 *
 * This route is self-contained: it owns its own stylesheet and components and
 * shares nothing with the ERA pages, so the existing site is unaffected by
 * anything here.
 */
export default function MarquisPage() {
  return (
    <Shell>
      <SplitHero />
    </Shell>
  );
}
