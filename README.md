# ERA Residence — frontend recreation

An independent rebuild of the publicly observable frontend experience of
[era-residence.com](https://www.era-residence.com/): layout, typography, colour,
imagery, scroll choreography, animation, interaction and responsive behaviour,
reverse-engineered from the live site and rewritten from scratch as a modern
React application.

No source was copied from the reference. Behaviour was observed in a real browser
and reimplemented; the original's own scripts were read only to identify *what*
animates, never to reuse *how*.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · GSAP ScrollTrigger · Lenis

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Layout

```
app/          routes, metadata, robots, sitemap
components/   Header, ScrollRail, Preloader, modals, consent
  sections/   one component per reference section
  ui/         Reveal, Buttons, Pagination, EraMark, FlowerVideo, Icons
hooks/        reveal, media query, slider, horizontal pin, scroll tabs, drag pan, theme probe
lib/          content (typed, mirrors the reference's CMS), motion tokens, gsap setup
styles/       tokens · typography · components
public/       images, videos, icons, fonts, lottie
docs/         analysis, asset inventory, component map, QA
tools/        reconnaissance and QA scripts (not part of the build)
reference-download/   raw curl snapshot, kept separate from the app
```

## Design system

The entire responsive strategy is `html { font-size: 1vw }`, so `1rem` is always 1% of
the viewport width. Every size token is written as the pixel value it should have on a
nominal design canvas, divided by that canvas's ratio to 100:

```css
--scale-ratio: 16;    /* desktop canvas 1600px */
--scale-ratio: 4.16;  /* ≤991px canvas 416px  */
--h1-size: calc(192 * var(--u));   /* = 12vw on desktop */
```

Colour and ink come from a semantic layer (`--ink`, `--line`, `--bg`) that the
`theme_on-*` classes remap, so any component works inside any section.

This mirrors the reference's own system, verified against its computed styles at six
viewport widths.

## Documentation

| File | Contents |
| --- | --- |
| [`docs/reference-analysis.md`](docs/reference-analysis.md) | Stack, design tokens, section inventory, animation and interaction catalogue |
| [`docs/network-assets.md`](docs/network-assets.md) | Network capture, loading strategy, critical assets |
| [`docs/browser-vs-download.md`](docs/browser-vs-download.md) | Browser observation vs. HTTP snapshot, and where they disagreed |
| [`docs/assets.md`](docs/assets.md) | Full asset inventory, origins, optimisation, **font licensing** |
| [`docs/component-map.md`](docs/component-map.md) | Reference section → component → responsibility |
| [`docs/visual-qa.md`](docs/visual-qa.md) | Every defect found and fixed, with severity and status |
| [`docs/final-qa.md`](docs/final-qa.md) | What was implemented, known differences, technical notes |

## Before deploying

The display and script typefaces are free substitutes for two Adobe Fonts families
that cannot be redistributed, and Maison Neue Extended is commercially licensed.
Read [`docs/assets.md`](docs/assets.md) first. Imagery belongs to ERA Residence and is
used here only for this reconstruction.
