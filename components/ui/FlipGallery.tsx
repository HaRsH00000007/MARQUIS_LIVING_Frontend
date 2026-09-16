"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import styles from "./FlipGallery.module.css";

type Photo = { readonly src: string; readonly width: number; readonly height: number };

/**
 * One card's place on a face. `photo` indexes the `photos` prop; `x` / `y` are
 * percentages of the panel and `w` a width in viewport units. The `m*` trio is
 * the same card inside the phone layout's own box, all in percent of it.
 */
type Slot = { photo: number; x: number; y: number; w: number; mx: number; my: number; mw: number };

/*
 * Two arrangements of the same five photos. Every card sits in the panel's
 * empty margins — clear of the eyebrow, lead, body and mark in the middle, the
 * logo and nav in the top corners, and the scroll rail down the left — so the
 * type never has a photo under it. Each photo changes corner and size across
 * the flip, and the two near-identical living-room renders (0 and 1) are never
 * neighbours on either face.
 */
const FACES: Slot[][] = [
  [
    { photo: 0, x: 15, y: 4, w: 8.5, mx: 4, my: 4, mw: 30 },
    { photo: 2, x: 60, y: 6, w: 13, mx: 40, my: 0, mw: 44 },
    { photo: 3, x: 80, y: 26, w: 9, mx: 66, my: 40, mw: 28 },
    { photo: 4, x: 13.5, y: 64, w: 9, mx: 10, my: 52, mw: 32 },
    { photo: 1, x: 66, y: 68, w: 7.5, mx: 44, my: 64, mw: 22 },
  ],
  [
    { photo: 0, x: 78, y: 60, w: 8, mx: 64, my: 50, mw: 28 },
    { photo: 2, x: 22, y: 70, w: 12, mx: 6, my: 60, mw: 46 },
    { photo: 3, x: 26, y: 5, w: 7.5, mx: 10, my: 2, mw: 27 },
    { photo: 4, x: 70, y: 8, w: 10, mx: 58, my: 4, mw: 32 },
    { photo: 1, x: 13.5, y: 30, w: 7, mx: 38, my: 28, mw: 20 },
  ],
];

/** Seconds a face rests before it turns away. */
const HOLD = 2.6;
/** Seconds for each half of the flip: out to edge-on, then in from edge-on. */
const TURN = 0.7;

/**
 * A continuously looping 3D flip of the concept photos, after the Framer
 * "3D flipping hero": two faces of cards, each turned as one plane about the
 * panel's vertical centre line. The showing face swings edge-on and vanishes,
 * the hidden one swings in from the opposite edge, holds, and they trade back.
 *
 * Only the photos move. The gallery paints before the panel's copy, so the
 * heading stays flat, still and on top the whole time. The loop only runs
 * while the gallery is on screen, and not at all under reduced motion, where
 * the first face simply stays put.
 */
export function FlipGallery({ photos }: { photos: readonly Photo[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const [front, back] = [...root.children] as HTMLElement[];
    if (!front || !back) return;

    /*
     * Both halves turn the same way, so the pair reads as one continuous spin
     * rather than a door swinging back. A face only ever travels between +90
     * and -90, where it is edge-on and invisible: when the loop restarts, the
     * back face jumps from -90 to +90 without a frame of it showing.
     *
     * Every turn states its own start angle and none renders on creation. A
     * plain `.to` records its start value lazily, the first time it plays, and
     * a later `fromTo` on the same face would already have pushed that face to
     * +90 by then — which left the front face resting edge-on, and the panel
     * empty, for the whole of its first hold.
     */
    gsap.set(front, { rotationY: 0 });
    gsap.set(back, { rotationY: 90 });

    const turn = { duration: TURN, immediateRender: false };
    const tl = gsap
      .timeline({ repeat: -1, paused: true })
      .to({}, { duration: HOLD })
      .fromTo(front, { rotationY: 0 }, { ...turn, rotationY: -90, ease: "In" })
      .fromTo(back, { rotationY: 90 }, { ...turn, rotationY: 0, ease: "Out" })
      .to({}, { duration: HOLD })
      .fromTo(back, { rotationY: 0 }, { ...turn, rotationY: -90, ease: "In" })
      .fromTo(front, { rotationY: 90 }, { ...turn, rotationY: 0, ease: "Out" });

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) tl.play();
      else tl.pause();
    });
    io.observe(root);

    return () => {
      io.disconnect();
      tl.kill();
      gsap.set([front, back], { clearProps: "transform" });
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.gallery} aria-hidden>
      {FACES.map((face, f) => (
        <div key={f} className={f ? `${styles.face} ${styles.faceBack}` : styles.face}>
          {face.map((slot) => {
            const photo = photos[slot.photo];
            if (!photo) return null;
            const place = {
              "--x": slot.x,
              "--y": slot.y,
              "--w": slot.w,
              "--mx": slot.mx,
              "--my": slot.my,
              "--mw": slot.mw,
            } as CSSProperties;
            return (
              <div key={slot.photo} className={styles.card} style={place}>
                <Image
                  src={photo.src}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  sizes="(max-width: 991px) 46vw, 13vw"
                  className={styles.img}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
