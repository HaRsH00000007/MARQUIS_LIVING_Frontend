"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

/* registerPlugin is idempotent, so a single call at module scope is enough. */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);

  /*
   * A phone's address bar shows and hides as the page scrolls, and each time
   * it does the viewport height changes. By default that fires a full
   * ScrollTrigger refresh — every pin re-measured mid-swipe — which reads as a
   * jolt. Width changes (rotation) still refresh.
   */
  ScrollTrigger.config({ ignoreMobileResize: true });

  /*
   * The reference's own named eases, transcribed from its animation bundle
   * (see docs/webflow-recovery.md §3). Registering them under the same names
   * means a tween here can quote the reference's configuration verbatim
   * instead of paraphrasing it into a cubic-bezier approximation.
   */
  CustomEase.create("InOut", "0.75,0,0.25,1");
  CustomEase.create("Out", "0.25,1,0.5,1");
  CustomEase.create("In", "0.5,0,0.75,0");
  CustomEase.create("Ease", "0.25,0.1,0.25,1");
  CustomEase.create("Write", "0.333,0,0.667,1");
  CustomEase.create("diveIn", "0.6,0,0,1");
  CustomEase.create("horScroll", "0.25,0,0.75,1");
}

export { gsap, ScrollTrigger, CustomEase };
