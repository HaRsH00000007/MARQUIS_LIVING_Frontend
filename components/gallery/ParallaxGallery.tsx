"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { galleryCategories, galleryItems, type GalleryCategory } from "@/lib/content";
import styles from "./ParallaxGallery.module.css";

/*
 * Card rhythm, repeated along the strip: each card's height as a share of the
 * viewport, and how far its centre sits above (-) or below (+) the middle.
 * Mixed heights at staggered levels are what give the strip its depth.
 */
const HEIGHTS = [0.5, 0.62, 0.32, 0.56, 0.42, 0.6, 0.36, 0.52];
const LEVELS = [0.03, -0.02, 0.01, -0.03, 0.04, -0.01, 0.02, -0.04];
/* the strip's centre line, as a share of the height: raised to leave the
   bottom band clear for the heading */
const CENTER = 0.44;
/* the same clear gap between every pair of cards, as a share of the viewport
   width, never less than GAP_MIN px */
const GAP = 0.028;
const GAP_MIN = 20;
/* how far the photograph drifts inside its card, as a share of the card's width */
const PARALLAX = 0.1;
/* share of the remaining distance covered per 60fps frame: the glide */
const EASE = 0.075;
/* scroll / drag gain */
const WHEEL_GAIN = 1.1;
const DRAG_GAIN = 1.6;
/* how long the pointer rests on a card before its photograph opens full screen */
const DWELL_MS = 420;
/* the open/close glide; matches .zoomBox's transition in the module CSS */
const ZOOM_MS = 750;

type Rect = { left: number; top: number; width: number; height: number };
type Zoom = { i: number; from: Rect; box: Rect; phase: "from" | "open" | "closing" };

/* the photograph's full-screen box: as large as fits, at its own proportions,
   so it shows uncropped */
const fitBox = (aspect: number): Rect => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const m = Math.max(16, Math.min(vw, vh) * 0.03);
  let width = vw - m * 2;
  let height = width / aspect;
  if (height > vh - m * 2) {
    height = vh - m * 2;
    width = height * aspect;
  }
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
};

/* the transform that lays the full-screen box exactly over `from` */
const fromTransform = (from: Rect, box: Rect) =>
  `translate3d(${from.left - box.left}px, ${from.top - box.top}px, 0) scale(${from.width / box.width}, ${from.height / box.height})`;

const rectOf = (el: Element | null | undefined): Rect | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

/**
 * An endless horizontal strip of interiors, after parallaxgalleryfx.framer.website.
 * The wheel (either axis), a drag or the arrow keys move the strip; it glides
 * toward that target, the photographs drift inside their cards against the
 * motion, and the strip loops seamlessly. Each card's title and caption rise in
 * beneath it on hover.
 *
 * Positions are written straight onto the elements from one rAF loop, so moving
 * the strip never re-renders React.
 */
export function ParallaxGallery({ category }: { category: GalleryCategory }) {
  const rootRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const picRefs = useRef<(HTMLElement | null)[]>([]);
  const meta = galleryCategories[category];
  const router = useRouter();

  /* back to the Explore slides on the home page. Not `history.back()`: the
     home page's pinned sections settle after load, so a restored scroll
     position lands well past the slides — ApartmentTypes picks up the hash
     and settles on itself instead. */
  const goBack = () => router.push("/#apartments");

  /*
   * Full-screen view. Resting the pointer on a card (or tapping it) opens its
   * photograph: a box at the photo's own proportions grows from the card to
   * fill the screen, the full-quality file fading in over the card's copy.
   * Moving off the photo, clicking, Esc or scrolling sends it back.
   */
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const zoomRef = useRef<Zoom | null>(null);
  const [hiLoaded, setHiLoaded] = useState(false);
  const dwell = useRef<number | undefined>(undefined);
  /* a card that has just been closed stays quiet until the pointer leaves it */
  const quiet = useRef<number | null>(null);
  /* written by the strip's loop: how far it still has to glide, and whether
     the current press has become a drag */
  const glide = useRef(0);
  const dragged = useRef(false);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const frameOf = (i: number) => cardRefs.current[i]?.firstElementChild;

  const openZoom = useCallback((i: number) => {
    if (zoomRef.current) return;
    const from = rectOf(frameOf(i));
    if (!from) return;
    const item = galleryItems[i];
    const next: Zoom = { i, from, box: fitBox(item.w / item.h), phase: "from" };
    zoomRef.current = next;
    setHiLoaded(false);
    setZoom(next);
    // let the box paint over the card first, then let it grow
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setZoom((z) => (z && z.phase === "from" ? { ...z, phase: "open" } : z)),
      ),
    );
  }, []);

  /* `stillOver`: closed by click, Esc or scroll, where the pointer may still
     rest on the card; that card then waits for the pointer to leave before it
     can open again. Closed by moving off the photo, the pointer is already
     elsewhere, so the card stays ready. */
  const closeZoom = useCallback((stillOver = true) => {
    const z = zoomRef.current;
    if (!z || z.phase === "closing") return;
    quiet.current = stillOver ? z.i : null;
    // shrink back to wherever the card is now
    const next: Zoom = { ...z, from: rectOf(frameOf(z.i)) ?? z.from, phase: "closing" };
    zoomRef.current = next;
    setZoom(next);
    window.setTimeout(() => {
      zoomRef.current = null;
      setZoom((cur) => (cur && cur.phase === "closing" ? null : cur));
    }, ZOOM_MS);
  }, []);

  const onCardEnter = (i: number) => {
    if (quiet.current === i || zoomRef.current) return;
    window.clearTimeout(dwell.current);
    dwell.current = window.setTimeout(() => {
      // only once the strip has come (nearly) to rest and no drag is under way
      if (glide.current < 8 && !dragged.current) openZoom(i);
    }, DWELL_MS);
  };
  const onCardLeave = (i: number) => {
    window.clearTimeout(dwell.current);
    if (quiet.current === i) quiet.current = null;
  };

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeZoom();
    // the pointer leaving the window
    const onOut = (e: MouseEvent) => !e.relatedTarget && closeZoom(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mouseout", onOut);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mouseout", onOut);
    };
  }, [zoom, closeZoom]);

  useEffect(() => () => window.clearTimeout(dwell.current), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    const pics = picRefs.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vw = 0;
    let vh = 0;
    let loop = 1; // the strip's full length
    let lead = 0; // where the first card rests on screen
    let base: number[] = []; // each card's resting x along the strip
    let widths: number[] = [];
    let tops: number[] = [];

    /* lay the strip out for this viewport */
    const measure = () => {
      vw = root.clientWidth;
      vh = root.clientHeight;
      const gap = Math.max(GAP_MIN, vw * GAP);
      // laid out from zero, so the gap at the loop's seam equals the others;
      // the first card's inset from the left edge is applied when drawing
      lead = vw * 0.06;
      let x = 0;
      base = [];
      widths = [];
      tops = [];
      galleryItems.forEach((item, i) => {
        let h = vh * HEIGHTS[i % HEIGHTS.length];
        let w = h * (item.w / item.h);
        // keep very wide photos, and phones, from running off the screen
        const maxW = vw * (vw < 992 ? 0.78 : 0.42);
        if (w > maxW) {
          h *= maxW / w;
          w = maxW;
        }
        const top = vh * CENTER - h / 2 + vh * LEVELS[i % LEVELS.length];
        base.push(x);
        widths.push(w);
        tops.push(top);
        const card = cards[i];
        if (card) {
          card.style.width = `${w}px`;
          card.style.height = `${h}px`;
          // taller cards sit in front (only matters while one is hovered)
          card.style.zIndex = String(Math.round(h));
        }
        x += w + gap;
      });
      // the strip ends one gap after its last card, so the seam where it
      // loops back to the first card is spaced like every other pair
      loop = x;
    };

    /* motion: `target` is where input has asked to be, `current` glides to it.
       Starting a screen back makes the strip sweep in from the right. */
    let target = 0;
    let current = reduce ? 0 : -1;
    let started = false;
    let raf = 0;
    let last = performance.now();

    const draw = () => {
      for (let i = 0; i < cards.length; i++) {
        const w = widths[i];
        let sx = (((base[i] + lead - current) % loop) + loop) % loop;
        if (sx > vw + w * 0.25) sx -= loop;
        cards[i].style.transform = `translate3d(${sx.toFixed(2)}px, ${tops[i].toFixed(2)}px, 0)`;
        // the photograph lags the card: centred when the card is mid-screen
        const pic = pics[i];
        if (pic) {
          const rel = Math.max(-1, Math.min(1, (sx + w / 2 - vw / 2) / vw));
          pic.style.transform = `translate3d(${(-rel * w * PARALLAX).toFixed(2)}px, 0, 0)`;
        }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / (1000 / 60);
      last = now;
      if (!started) {
        // first frame: place the strip a screen to the right of its rest
        current = reduce ? 0 : -vw;
        started = true;
      }
      const k = reduce ? 1 : 1 - Math.pow(1 - EASE, dt);
      current += (target - current) * k;
      glide.current = Math.abs(target - current);
      draw();
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // the strip holds still under an open photograph; scrolling closes it
      if (zoomRef.current) {
        closeZoom();
        return;
      }
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      // line-mode wheels (Firefox) report lines, not pixels
      target += d * (e.deltaMode === 1 ? 32 : 1) * WHEEL_GAIN;
    };

    /*
     * Pointer capture retargets the click that ends a press, so it is only
     * taken once the press has turned into a drag — and never for presses on
     * links or buttons (the Back link, the header), whose clicks must land.
     */
    let dragX: number | null = null;
    let dragging = false;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as Element).closest("a, button")) return;
      if (zoomRef.current) return;
      dragX = e.clientX;
      dragging = false;
      dragged.current = false;
    };
    const onMove = (e: PointerEvent) => {
      if (dragX === null) return;
      if (!dragging) {
        if (Math.abs(e.clientX - dragX) < 4) return;
        dragging = true;
        dragged.current = true;
        window.clearTimeout(dwell.current);
        root.setPointerCapture(e.pointerId);
        root.dataset.dragging = "";
      }
      target -= (e.clientX - dragX) * DRAG_GAIN;
      dragX = e.clientX;
    };
    const onUp = (e: PointerEvent) => {
      dragX = null;
      dragging = false;
      if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
      delete root.dataset.dragging;
    };
    const onKey = (e: KeyboardEvent) => {
      if (zoomRef.current) return;
      if (e.key === "ArrowRight") target += vw * 0.35;
      if (e.key === "ArrowLeft") target -= vw * 0.35;
    };

    measure();
    root.dataset.ready = "";
    raf = requestAnimationFrame(tick);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
    };
  }, [closeZoom]);

  const zoomItem = zoom ? galleryItems[zoom.i] : null;

  return (
    <section
      ref={rootRef}
      data-theme="dark"
      data-canvas="sky"
      data-lenis-prevent
      className={`theme_on-brand ${styles.gallery}`}
      aria-labelledby="gallery-title"
    >
      <div className={styles.strip}>
        {galleryItems.map((item, i) => (
          <figure
            key={item.src}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={styles.card}
            data-zoomed={zoom?.i === i || undefined}
            onPointerEnter={(e) => e.pointerType === "mouse" && onCardEnter(i)}
            onPointerLeave={() => onCardLeave(i)}
            onClick={() => {
              // a tap, or a click that did not end a drag, opens it too
              if (!dragged.current) openZoom(i);
            }}
          >
            <div className={styles.frame}>
              <div
                ref={(el) => {
                  picRefs.current[i] = el;
                }}
                className={styles.pic}
              >
                <Image
                  src={item.src}
                  alt={`${item.title}: ${item.caption}`}
                  fill
                  sizes="(max-width: 991px) 80vw, 45vw"
                  className={styles.img}
                  draggable={false}
                  priority={i < 4}
                />
              </div>
            </div>
            <figcaption className={styles.caption}>
              <span className={styles.captionTitle}>{item.title}</span>
              <span className={styles.captionBody}>{item.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {/* the strip dissolves into the room at both edges */}
      <span className={`${styles.edge} ${styles.edgeLeft}`} aria-hidden />
      <span className={`${styles.edge} ${styles.edgeRight}`} aria-hidden />

      <div className={styles.head}>
        <p className={`l2 muted ${styles.eyebrow}`}>Marquis Living / Gallery</p>
        <h1 id="gallery-title" className={styles.title}>
          {meta.title}
        </h1>
        <p className={styles.lead}>{meta.lead}</p>
      </div>

      {/* rendered into <body>, above the header, the gallery's own overlays and
          every card, however they are stacked */}
      {zoom &&
        zoomItem &&
        createPortal(
          <div
            className={`theme_on-brand ${styles.zoom}`}
            data-phase={zoom.phase}
            onClick={() => closeZoom()}
            // scrolling over the open photograph closes it, as over the strip
            onWheel={() => closeZoom()}
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label={zoomItem.title}
          >
            <span className={styles.zoomBackdrop} aria-hidden />
            <div
              className={styles.zoomBox}
              style={{
                left: zoom.box.left,
                top: zoom.box.top,
                width: zoom.box.width,
                height: zoom.box.height,
                transform: zoom.phase === "open" ? "none" : fromTransform(zoom.from, zoom.box),
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse" && zoomRef.current?.phase === "open")
                  closeZoom(false);
              }}
            >
              {/* the card's own copy is already loaded, so something shows at once */}
              <Image
                src={zoomItem.src}
                alt=""
                fill
                sizes="(max-width: 991px) 80vw, 45vw"
                className={styles.img}
              />
              <Image
                src={zoomItem.src}
                alt={`${zoomItem.title}: ${zoomItem.caption}`}
                fill
                sizes="100vw"
                quality={92}
                priority
                className={`${styles.img} ${styles.zoomHi}`}
                data-loaded={hiLoaded || undefined}
                onLoad={() => setHiLoaded(true)}
              />
              <div className={styles.zoomCaption}>
                <span className={styles.captionTitle}>{zoomItem.title}</span>
                <span className={styles.captionBody}>{zoomItem.caption}</span>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <div className={styles.foot}>
        <button type="button" className={`l2 ${styles.back}`} onClick={goBack}>
          &larr; Back
        </button>
        <span className="l2 muted">Scroll or drag to explore</span>
      </div>
    </section>
  );
}
