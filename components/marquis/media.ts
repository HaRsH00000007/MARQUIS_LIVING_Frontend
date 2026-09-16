/**
 * The six renders the Marquis Living view draws on, copied out of the
 * WordPress media library into `public/marquis/` and keyed exactly as the
 * original `media` map keyed them, so the section markup reads the same.
 */
export const media = {
  master: "/marquis/master.jpg",
  living: "/marquis/living.jpg",
  city: "/marquis/city.jpg",
  dining: "/marquis/dining.jpg",
  bedroom: "/marquis/bedroom.jpg",
  tablebg: "/marquis/tablebg.jpg",
} as const;

export type MediaKey = keyof typeof media;

/** Natural size of each render, so images can reserve their space. */
export const mediaSize: Record<MediaKey, { width: number; height: number }> = {
  master: { width: 1600, height: 900 },
  living: { width: 1600, height: 1067 },
  city: { width: 1600, height: 1067 },
  dining: { width: 1600, height: 900 },
  bedroom: { width: 1600, height: 1067 },
  tablebg: { width: 1600, height: 1067 },
};
