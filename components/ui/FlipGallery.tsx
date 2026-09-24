"use client";

import Image from "next/image";
import styles from "./FlipGallery.module.css";

type Photo = { readonly src: string; readonly width: number; readonly height: number };

/*
 * The six photos dealt into a strip down the left margin and a strip down the
 * right. The strips sit in the panel's empty gutters — clear of the eyebrow,
 * lead, body and mark in the middle, the logo and nav in the top corners, and
 * the scroll rail down the far left — so the type never has a photo under it.
 *
 * The two near-identical living-room renders (0 and 1) are kept on opposite
 * sides so they never sit in the same strip.
 */
const STRIPS = {
  left: [0, 3, 4],
  right: [2, 5, 1],
} as const;

/**
 * The concept photos, run as two continuous vertical reels either side of the
 * panel's copy — a camera roll winding past the type.
 *
 * Each reel holds its three photos twice over. The loop travels exactly one
 * set and restarts, so the second set is sitting where the first began at the
 * moment it repeats and the roll never shows a seam. The two sides run
 * opposite ways, so the panel does not read as one sheet sliding.
 *
 * The reels are masked by the panel itself rather than by a shorter window, so
 * a photo enters and leaves at the screen's own top and bottom edges and never
 * appears to vanish in mid-air. The animation is CSS, so it costs no scroll
 * work, and it stops outright under reduced motion.
 */
export function FlipGallery({ photos }: { photos: readonly Photo[] }) {
  return (
    <div className={styles.gallery} aria-hidden>
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={`${styles.strip} ${side === "left" ? styles.stripLeft : styles.stripRight}`}
        >
          <div className={styles.reel}>
            {/* the set, then the same set again — what makes the loop seamless */}
            {[0, 1].map((pass) =>
              STRIPS[side].map((index) => {
                const photo = photos[index];
                if (!photo) return null;
                return (
                  <div key={`${pass}-${index}`} className={styles.card}>
                    <Image
                      src={photo.src}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      sizes="(max-width: 991px) 28vw, 10vw"
                      className={styles.img}
                    />
                  </div>
                );
              }),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
