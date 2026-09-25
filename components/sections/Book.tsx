"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { book } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import { isScrollJump, useLenis } from "@/components/SmoothScroll";
import styles from "./Book.module.css";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
/** Smoothstep of `n` between `a` and `b`. */
const smooth = (n: number, a: number, b: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/*
 * One cycle per spread, as shares of that cycle's scroll: the photograph opens
 * out to full screen, closes back onto its page, then the right page turns.
 * The designer's own timings.
 */
const ZOOM_IN: [number, number] = [0.12, 0.42];
const ZOOM_OUT: [number, number] = [0.58, 0.8];
const TURN: [number, number] = [0.86, 0.98];
/**
 * Only the first spread zooms. The later spreads have no photograph to lift, so
 * their page turn takes a broader share of the cycle instead of waiting out the
 * stretch the zoom used to fill.
 */
const ZOOM_SPREAD = 0;
const TURN_PLAIN: [number, number] = [0.35, 0.85];
/*
 * How much of the pinned scroll each spread takes, relative to the others. The
 * first carries the zoom out to full screen and back, so it keeps the long
 * stretch; the later spreads only turn a page, and at an equal share that cost
 * three screens of scrolling each. At a third of the first, a page turns over
 * about half a screen of scrolling — quick, but not a snap.
 */
const CYCLE_WEIGHT = [1, 1 / 3, 1 / 3];
const WEIGHT_TOTAL = CYCLE_WEIGHT.reduce((a, b) => a + b, 0);
/** Where each spread's stretch begins, as a share of the whole pin. */
const CYCLE_START = CYCLE_WEIGHT.reduce<number[]>(
  (acc, w, i) => [...acc, acc[i] + w / WEIGHT_TOTAL],
  [0],
);

/** The spread `p` (0..1 of the pin) falls in, and how far through it is. */
const cycleAt = (p: number, last: number) => {
  let cycle = last;
  for (let i = 0; i <= last; i++) {
    if (p < CYCLE_START[i + 1]) {
      cycle = i;
      break;
    }
  }
  const span = CYCLE_START[cycle + 1] - CYCLE_START[cycle];
  return { cycle, local: clamp((p - CYCLE_START[cycle]) / (span || 1)) };
};
/**
 * Touch only: how much of the gap to the finger's position the book closes per
 * 60fps frame. Touch scrolling is native (Lenis smooths the wheel alone), so
 * the page turns followed the raw scroll steps and stuttered; easing the
 * book's progress toward the scroll smooths them without delaying the pin.
 */
const TOUCH_EASE = 0.2;
/** A gap larger than this (a jump, or re-entering the section) is snapped. */
const TOUCH_SNAP = 0.15;
/** How far the right page swings over the spine. */
const TURN_DEG = 164;
/** Seconds per page when the book closes back to its first spread. */
const REWIND_PER_PAGE = 0.45;
/**
 * Where in the first cycle the closed book comes to rest: past the top veil
 * clearing and before the first zoom begins.
 */
const REWIND_REST = 0.1;

/** The counter's line of instruction for each stage of a cycle. */
const stageLabel = (zoomIn: number, zoomOut: number, zooms: boolean) =>
  !zooms
    ? "Scroll / Turn the page"
    : zoomOut > 0.08
    ? "Returning to page"
    : zoomIn > 0.98
      ? "Full screen"
      : zoomIn > 0.08
        ? "Zoom into image"
        : "Scroll / Zoom into image";

/**
 * The editorial book, rebuilt from the designer's WordPress piece. The section
 * pins for nine screens while an open book rests in the room. On the first
 * spread, scrolling lifts the right-page photograph off the page to fill the
 * screen, settles it back, and turns the page; the later spreads simply turn.
 *
 * Everything is written straight onto the elements from a rAF-throttled scroll
 * handler, so scrolling never re-renders React. Under reduced motion nothing
 * runs and the first spread simply rests in the room.
 */
export function Book() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const lenisRef = useLenis();

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const q = <T extends HTMLElement>(sel: string) => [...sticky.querySelectorAll<T>(sel)];
    const spreads = q<HTMLElement>("[data-spread]");
    const frames = q<HTMLElement>("[data-frame]");
    const copies = q<HTMLElement>("[data-frame-copy]");
    const scrims = q<HTMLElement>("[data-frame-scrim]");
    const heading = sticky.querySelector<HTMLElement>("[data-heading]");
    const progress = sticky.querySelector<HTMLElement>("[data-progress]");
    const count = sticky.querySelector<HTMLElement>("[data-count]");
    const stage = sticky.querySelector<HTMLElement>("[data-stage]");
    const veilTop = sticky.querySelector<HTMLElement>("[data-veil-top]");
    const veilBottom = sticky.querySelector<HTMLElement>("[data-veil-bottom]");
    const backdrop = sticky.querySelector<HTMLElement>("[data-portal-backdrop]");
    const last = spreads.length - 1;
    /* looked up once: the scroll handler reads these on every frame */
    const parts = spreads.map((spread) => ({
      imagePage: spread.querySelector<HTMLElement>("[data-image-page]"),
      copyPage: spread.querySelector<HTMLElement>("[data-copy-page]"),
      cta: spread.querySelector<HTMLElement>("[data-page-cta]"),
      printed: spread.querySelector<HTMLElement>("[data-photo]"),
    }));
    const touch = window.matchMedia("(pointer: coarse)");
    /* the progress drawn, eased toward the scroll's on touch; -1 = snap next */
    let shownP = -1;
    let lastTime = 0;

    let frame = 0;
    let shownFrame = -1;
    let lastY = window.scrollY;

    /*
     * The close. Scrolling back up from the last spread does not scrub back
     * through every zoom and turn: the pages turn back to the first spread in
     * one go. `s` runs from the last spread to 0 and stands in for the scroll
     * while it plays. The scroll itself is moved to the first spread's resting
     * point up front — the book is pinned at both ends, so nothing on screen
     * moves — and held still until the pages have settled, so the next scroll
     * up leaves the section rather than replaying it.
     */
    let rewind: { s: number; veil: number } | null = null;
    let rewindTween: gsap.core.Tween | null = null;
    /** The Lenis instance held still for the close, so cleanup restarts that one. */
    let heldLenis: { start: () => void } | null = null;

    const startRewind = (rect: DOMRect, vh: number, veil: number) => {
      const lenis = lenisRef?.current;
      heldLenis = lenis ?? null;
      const sectionTop = rect.top + window.scrollY;
      const span = section.offsetHeight - vh;
      const rest = sectionTop + span * (CYCLE_WEIGHT[0] / WEIGHT_TOTAL) * REWIND_REST;
      const pinEnd = sectionTop + span;
      rewind = { s: last, veil };

      // park the scroll at the first spread's resting point and hold it there
      const park = () => {
        if (!rewind) return;
        if (lenis) {
          lenis.scrollTo(rest, { immediate: true, force: true });
          lenis.stop();
        } else {
          window.scrollTo({ top: rest, behavior: "instant" as ScrollBehavior });
        }
      };

      if (lenis && window.scrollY > pinEnd + 1) {
        /*
         * Past the pin the book has begun to scroll away with the page, so a
         * jump from here would show. Glide it back to the end of the pin first
         * (input locked) and park from there, where the jump is invisible; the
         * pages start turning back straight away regardless.
         */
        lenis.scrollTo(pinEnd, { duration: 0.35, force: true, lock: true, onComplete: park });
      } else {
        park();
      }
      rewindTween = gsap.to(rewind, {
        s: 0,
        duration: REWIND_PER_PAGE * last + 0.35,
        ease: "InOut",
        onUpdate: () => {
          if (!frame) frame = requestAnimationFrame(update);
        },
        onComplete: () => {
          rewind = null;
          rewindTween = null;
          // the scroll was parked at the rest point: start from there, rather
          // than easing across the pages that were just turned back
          shownP = -1;
          lenis?.start();
          lastY = window.scrollY;
          update();
        },
      });
    };

    /*
     * Where each lifted copy block comes to rest. `offsetLeft` and friends read
     * the untransformed box, so they stay true while the block is mid-flight,
     * and they only change with the viewport.
     */
    let resting: { x: number; y: number; w: number }[] | null = null;
    const measureCopies = () => {
      resting = copies.map((c) => ({ x: c.offsetLeft, y: c.offsetTop, w: c.offsetWidth }));
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const rect = section.getBoundingClientRect();
      // off screen entirely: nothing to draw
      if (rect.bottom < -vh || rect.top > vh * 2) {
        shownP = -1;
        return;
      }

      const target = clamp(-rect.top / Math.max(1, section.offsetHeight - vh));
      const now = performance.now();
      if (
        !touch.matches ||
        shownP < 0 ||
        rewind ||
        isScrollJump() ||
        Math.abs(target - shownP) > TOUCH_SNAP
      ) {
        shownP = target;
      } else {
        // frame-rate independent: TOUCH_EASE per 60fps frame
        const dt = Math.min(100, now - lastTime || 16.7);
        shownP += (target - shownP) * (1 - Math.pow(1 - TOUCH_EASE, dt / 16.7));
        if (Math.abs(target - shownP) < 0.0002) shownP = target;
      }
      lastTime = now;
      // still catching up with the finger: draw again next frame
      if (shownP !== target) frame = requestAnimationFrame(update);
      const p = shownP;
      const at = cycleAt(p, last);
      let cycle = at.cycle;
      const local = at.local;
      const zooms = cycle === ZOOM_SPREAD;
      let zoomIn = zooms ? smooth(local, ...ZOOM_IN) : 0;
      let zoomOut = zooms ? smooth(local, ...ZOOM_OUT) : 0;
      let zoom = zoomIn * (1 - zoomOut);
      let turn = cycle < last ? smooth(local, ...(zooms ? TURN : TURN_PLAIN)) : 0;

      const y = window.scrollY;
      const goingUp = y < lastY - 1;
      lastY = y;

      /*
       * On the last spread with the book at rest and scrolling up: close it.
       * That includes the stretch just after the pin, where the last spread is
       * still on screen as the section scrolls away — the usual place to be
       * "on the last page".
       */
      const onScreen = rect.top <= 0 && rect.bottom > 0;
      /* not while the page is gliding somewhere on purpose: "To top" and the
         badge both pass up through this section, and parking the scroll here
         would strand them in the book */
      if (!rewind && goingUp && onScreen && last > 0 && cycle === last && zoom <= 0.001 && !isScrollJump()) {
        startRewind(rect, vh, smooth(p, 0.96, 1));
      }

      if (rewind) {
        const s = rewind.s;
        cycle = Math.min(last, Math.floor(s));
        turn = cycle < last ? s - cycle : 0;
        zoomIn = zoomOut = zoom = 0;
      }

      // the active spread on top, the next one fading in under the turning page
      spreads.forEach((spread, i) => {
        spread.style.zIndex = i === cycle ? "3" : i === cycle + 1 ? "2" : "1";
        spread.style.opacity = i === cycle ? "1" : i === cycle + 1 ? turn.toFixed(4) : "0";
        const { imagePage, copyPage, cta } = parts[i];
        const t = i === cycle ? turn : 0;
        if (imagePage) {
          imagePage.style.transform = t
            ? `perspective(1700px) rotateY(${(-TURN_DEG * t).toFixed(2)}deg) translateZ(${(t * 2).toFixed(2)}px)`
            : "";
        }
        if (copyPage) copyPage.style.opacity = (1 - t * 0.32).toFixed(4);
        // spreads ignore the pointer; only the spread on top, at rest on its
        // page (not zoomed, not turning), lets its "See our work" link be clicked
        if (cta) {
          const live = i === cycle && zoom < 0.02 && turn < 0.02;
          cta.style.pointerEvents = live ? "auto" : "none";
          cta.tabIndex = live ? 0 : -1;
        }
      });

      // the photograph: laid over its printed position, grown to the screen
      if (shownFrame !== -1 && (zoom <= 0.001 || shownFrame !== cycle)) {
        frames[shownFrame].style.opacity = "0";
        copies[shownFrame].style.opacity = "0";
        shownFrame = -1;
      }
      if (zoom > 0.001) {
        const printed = parts[cycle].printed;
        const live = frames[cycle];
        if (printed && live) {
          const r = printed.getBoundingClientRect();
          const s = sticky.getBoundingClientRect();
          const x = r.left - s.left;
          const y = r.top - s.top;

          /*
           * The photograph opens as large as it can be with nothing trimmed:
           * its own proportions, filling the screen on whichever axis binds
           * first. These are portrait pictures on a landscape screen, so that
           * is the full height, centred — grown to the screen's own shape they
           * lost their top and bottom to `cover`.
           */
          const img = live.querySelector("img");
          const ratio =
            img && img.naturalWidth && img.naturalHeight
              ? img.naturalWidth / img.naturalHeight
              : r.width / r.height;
          let tw = s.width;
          let th = tw / ratio;
          if (th > s.height) {
            th = s.height;
            tw = th * ratio;
          }
          const tx = (s.width - tw) / 2;
          const ty = (s.height - th) / 2;

          live.style.left = `${x + (tx - x) * zoom}px`;
          live.style.top = `${y + (ty - y) * zoom}px`;
          live.style.width = `${r.width + (tw - r.width) * zoom}px`;
          live.style.height = `${r.height + (th - r.height) * zoom}px`;
          live.style.opacity = "1";
          shownFrame = cycle;

          /*
           * The left page's words travel with it: the block starts the width of
           * that page, sitting over it, and grows into its own place on the
           * photograph. It only reads once the picture is broad enough to carry
           * it, so it fades in behind the last of the zoom.
           */
          const read = smooth(zoom, 0.34, 0.82);
          const copy = copies[cycle];
          const page = spreads[cycle].querySelector<HTMLElement>("[data-copy-page]");
          if (!resting) measureCopies();
          const rest = resting?.[cycle];
          if (copy && page && rest && rest.w) {
            const c = page.getBoundingClientRect();
            const from = c.width / rest.w;
            const grow = from + (1 - from) * zoom;
            const tx = (c.left - s.left - rest.x) * (1 - zoom);
            const ty = (c.top - s.top - rest.y) * (1 - zoom);
            copy.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${grow.toFixed(4)})`;
            copy.style.opacity = read.toFixed(4);
          }
          // the scrim rides inside the frame, so it darkens the photograph for
          // the words and leaves the room and the book alone
          if (scrims[cycle]) scrims[cycle].style.opacity = (read * 0.92).toFixed(4);
        }
      }

      /*
       * The room is left alone. It used to fade out across the zoom, but the
       * photograph covers the screen by the end of that anyway, so all the fade
       * did was wash the room to flat cream behind a book that was still in
       * full view.
       */
      // the rest of the screen dims away as the photograph opens, so at full
      // screen only the picture and its words are left; it returns on the close
      if (backdrop) backdrop.style.opacity = smooth(zoom, 0.45, 0.95).toFixed(4);
      if (heading) heading.style.opacity = (1 - smooth(zoom, 0.12, 0.62)).toFixed(4);
      if (progress) progress.style.opacity = (1 - smooth(zoom, 0.6, 0.95)).toFixed(4);

      const countText = `${String(cycle + 1).padStart(2, "0")} / ${String(spreads.length).padStart(2, "0")}`;
      if (count && count.textContent !== countText) count.textContent = countText;
      const stageText = stageLabel(zoomIn, zoomOut, cycle === ZOOM_SPREAD);
      if (stage && stage.textContent !== stageText) stage.textContent = stageText;

      // cream edges: the top one stays solid while the room scrolls in (a
      // partly faded veil still shows a line against the cream above) and
      // clears over the first moments of the pin; the bottom one arrives over
      // the last of it
      if (veilTop) veilTop.style.opacity = rect.top > 0 ? "1" : (1 - smooth(p, 0, 0.025)).toFixed(4);
      if (veilBottom) {
        // while closing, the bottom edge fades out with the pages rather than
        // dropping away with the scroll jump
        const veil = rewind ? rewind.veil * (rewind.s / last) : smooth(p, 0.96, 1);
        veilBottom.style.opacity = veil.toFixed(4);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const onResize = () => {
      resting = null;
      update();
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
      if (rewindTween) {
        rewindTween.kill();
        heldLenis?.start();
      }
    };
  }, [lenisRef]);

  const total = String(book.spreads.length).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      data-canvas="cream"
      className={`section ${styles.section}`}
      aria-labelledby="book-title"
    >
      <div ref={stickyRef} className={styles.sticky}>
        <div className={styles.bg} data-bg aria-hidden>
          <Image src={book.background} alt="" fill sizes="100vw" className={styles.bgImg} />
          <span className={styles.shade} />
        </div>

        <div className={styles.heading} data-heading>
          <p className={styles.label}>{book.label}</p>
          <h2 id="book-title" className={styles.title}>
            {book.title[0]}
            <br />
            {book.title[1]}
          </h2>
        </div>

        <div className={styles.book}>
          <span className={styles.spine} aria-hidden />
          {book.spreads.map((spread, i) => (
            <article
              key={spread.kicker}
              className={styles.spread}
              data-spread={i}
              aria-hidden={i > 0 || undefined}
            >
              <div className={`${styles.page} ${styles.copyPage}`} data-copy-page>
                <div>
                  <span className={styles.pageLabel}>{spread.kicker}</span>
                  <h3 className={styles.pageTitle}>
                    {spread.title[0]}
                    <br />
                    {spread.title[1]}
                  </h3>
                </div>
                {/* body and CTA share one slot, so the page keeps its three-part
                    spacing (heading / body / foot line) */}
                <div className={styles.pageMid}>
                  <p className={styles.pageBody}>{spread.body}</p>
                  <Link
                    href={book.cta.href}
                    className={styles.pageCta}
                    data-page-cta
                    // the scroll script hands focus and clicks to the spread on top
                    tabIndex={i > 0 ? -1 : undefined}
                  >
                    {book.cta.label}
                  </Link>
                </div>
                <span className={styles.pageLabel}>{spread.foot}</span>
              </div>
              <figure className={`${styles.page} ${styles.imagePage}`} data-image-page>
                <div className={styles.photo} data-photo>
                  <Image
                    src={spread.image}
                    alt={spread.alt}
                    fill
                    sizes="(max-width: 991px) 45vw, 30vw"
                    /* eager: the later spreads sit hidden until their turn,
                       and a photo still loading or decoding as its page came
                       into view stalled the turn */
                    loading="eager"
                    className={styles.photoImg}
                  />
                </div>
                <figcaption className={styles.caption}>{spread.caption}</figcaption>
              </figure>
            </article>
          ))}
        </div>

        <div className={styles.portal} aria-hidden>
          <span className={styles.portalBackdrop} data-portal-backdrop />
          {book.spreads.map((spread, i) => (
            <div key={spread.image + i} className={styles.frame} data-frame={i}>
              {/* the frame fills the screen, so it takes the photograph at full
                  quality rather than the default 75 */}
              <Image
                src={spread.image}
                alt=""
                fill
                sizes="100vw"
                quality={90}
                /* eager: the frame is 0x0 until the zoom starts, so a lazy
                   image has no intrinsic size to open to at that moment */
                priority
                className={styles.frameImg}
              />
              <span className={styles.frameScrim} data-frame-scrim />
            </div>
          ))}

          {book.spreads.map((spread, i) => (
            <div key={spread.kicker + i} className={styles.portalCopy} data-frame-copy={i}>
              <span className={styles.portalKicker}>{spread.kicker}</span>
              <h3 className={styles.portalTitle}>
                {spread.title[0]}
                <br />
                {spread.title[1]}
              </h3>
              <p className={styles.portalBody}>{spread.body}</p>
              <span className={styles.portalKicker}>{spread.foot}</span>
            </div>
          ))}
        </div>

        <div className={styles.progress} data-progress>
          <output className={styles.count} data-count aria-live="polite">
            01 / {total}
          </output>
          <span className={styles.label} data-stage>
            Scroll / Zoom into image
          </span>
        </div>

        <span className={styles.veilTop} data-veil-top aria-hidden />
        <span className={styles.veilBottom} data-veil-bottom aria-hidden />
      </div>
    </section>
  );
}
