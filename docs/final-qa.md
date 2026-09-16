# Final QA

**Reference:** https://www.era-residence.com/
**Implementation:** Next.js 16 · React 19 · TypeScript · CSS Modules · GSAP ScrollTrigger · Lenis
**Verified:** real Chrome via `playwright-core`, at 1920 / 1440 / 1366 / 1024 / 768 / 390 / 375.

---

## Implemented

Every section of the reference homepage, in order:

| # | Section | Component |
| --- | --- | --- |
| — | Fixed header, rotating badge, mobile menu | `components/Header.tsx` |
| — | Scroll-progress rail with `00–99` counter | `components/ScrollRail.tsx` |
| — | Arch-wipe preloader | `components/Preloader.tsx` |
| 0 | Hero — day/night renders, hotspots, CTA | `sections/Hero.tsx` |
| 1 | Benefits intro — arch, curved `textPath` title, lockup | `sections/BenefitsIntro.tsx` |
| 2 | Benefits slider (3) | `sections/Benefits.tsx` |
| 3 | Quote over the pool render | `sections/Quote.tsx` |
| 4 | Concept / New Golden Mile — pinned horizontal track (3 panels) | `sections/Concept.tsx` |
| 5 | Master plan — cloud marquees, mobile drag-pan | `sections/MasterPlan.tsx` |
| 6 | Apartment types (3) | `sections/ApartmentTypes.tsx` |
| 7 | Apartment intro | `sections/ApartmentIntro.tsx` |
| 8 | Amenities — pinned scroll-driven tabs (5) | `sections/Amenities.tsx` |
| 9 | Interiors — arch, feature pair, 4-slide gallery | `sections/Interiors.tsx` |
| 10 | Architecture — pinned intro, rising plum panel | `sections/Architecture.tsx` |
| 11 | Project facts (4) | `sections/ProjectFacts.tsx` |
| 12 | Closing CTA | `sections/CallToAction.tsx` |
| 13 | Footer — centred ERA mark, display-scale phone number, address column, legal/credits row, gutter "To top" | `sections/Footer.tsx` |

Plus supporting routes so no link dead-ends: `/apartments`, `/contact`,
`/privacy-policy`, `/terms-of-use`, a themed 404, `robots.txt` and `sitemap.xml`.

## Animations recreated

| Effect | How |
| --- | --- |
| Smooth scrolling | Lenis 1.3 driven from the GSAP ticker, `ScrollTrigger.update` on every scroll |
| Preloader | Plum plate lifting away behind a rising arch (0.3s hold, 0.9s wipe), timed so the hero entrance begins as the plate clears rather than behind it |
| Word / character heading reveals | Own `SplitReveal` (words, chars or lines), `rise` motion (masked translate) or `fade` motion (unmasked, opacity only — what the hero wordmark uses), staggered with a capped delay |
| Script write-on | `AccentReveal` — tracking collapses `0.14em → 0` on `--ease-write` with a per-character opacity stagger, so the glyphs draw together. Used for `Estepona`, `Live in`, `yours`. Timed off a screen recording of the reference. |
| Line-masked body reveals | `SplitReveal mode="line"` |
| Rise-and-fade blocks | `FadeIn` |
| Hero scroll choreography | Pin progress → `--hero-copy` / `--hero-parallax` / `--hero-zoom`, all pre-eased in JS from curves **measured off the reference** (`lib/heroCurves.ts`, source data `docs/hero-ref.json`): copy slides 80vh up without fading, the 144vh render parallaxes 44vh then zooms to 2x about a focal point 62% down the viewport, and the arch section scrolls over the hero's last 1.8 screens |
| Pinned horizontal scroll | `useHorizontalPin` — ScrollTrigger pin, `x: 0 → −(track − vw)`, `scrub: 1` |
| Pinned scroll-driven tabs | `useScrollTabs` — pinned progress → discrete index, cross-fading renders and a sliding underline |
| Architecture reveal | Section progress → `--arch-p`; plum panel rises over the intro |
| Cloud marquees | Three infinite tracks at 90s / 130s / 170s |
| Bougainvillea loops | Seven alpha `.webm` clips, mounted only near the viewport, with AVIF posters |
| Hotspot pulses | Two offset expanding rings |
| Rotating badge | 42s linear `textPath` ring |
| Scroll rail | rAF-throttled scroll progress → thumb position + counter |
| Theme inversion | `useSectionTheme` probes `data-theme` at 35% viewport height |
| Hover: buttons | Background wipes `100% → 0%`, radius `100% → 0`, label inverts |
| Hover: nav items | Two stacked labels sliding `0 → −100%` / `100% → 0` |
| Hover: image cards | `scale(1 → 1.15)` over 1.2s |
| Hover: list groups | Non-hovered siblings drop to `opacity .2` |

All hover behaviour is gated behind `@media (min-width: 992px)`, and every animation
is disabled or short-circuited under `prefers-reduced-motion: reduce`.

## Interactions recreated

Hero day/night tabs · hero hotspots with floating tips · three sliders with shared
pagination · scroll-driven **and** clickable amenity tabs · book-a-call modal
(focus-trapped by `Escape`, validated, confirms locally) · contact form · cookie
consent (localStorage) · mobile menu with body scroll lock · footer "to top" ·
drag-pannable master plan on mobile · keyboard skip link.

Verified end-to-end in `tools/interact.mjs` and `tools/mobile.mjs` — all pass.

## Responsive

| Width | Result |
| --- | --- |
| 1920×1080 | Pass — 1600px design canvas, everything scales with `1vw` |
| 1440×900 | Pass — primary calibration target |
| 1366×768 | Pass |
| 1024×1366 | Pass — still the desktop canvas, pins active |
| 768×1024 | Pass — 416px canvas; type and controls scale up exactly as the reference does |
| 430 / 390 / 375 | Pass — pins collapse to stacks, hovers off, `100svh`, no horizontal overflow |

## Assets

47 files, ~32 MB, all fetched from publicly accessible URLs and renamed meaningfully
under `/public` (`images/`, `videos/`, `icons/`, `fonts/`, `lottie/`). Full inventory
with origins in `assets.md`. The raw `curl` snapshot stays in `/reference-download`
and is excluded from the build.


## Second pass — continuity

The first pass got every section right in isolation; the page still read as a stack
of them. The second pass measured both sites' scroll geometry and rebuilt the
transitions. Full scorecard, before/after geometry and the bugs it surfaced are in
[`transition-qa.md`](transition-qa.md). Headlines:

- **Sections overlap where the reference overlaps them.** Interiors' arch now climbs
  over the still-pinned Amenities render for 1.8 screens, as Hero→Benefits already did.
- **Renders carry their own transitions.** MasterPlan's aerial is the section's ground
  with its top edge dissolved into cream behind the clouds; the Quote is type on the
  pool render rather than a plum card; Amenities and the CTA no longer declare a canvas
  colour that only painted a band across the section above them.
- **Geometry re-aligned** to within 73px of the reference across a 24 678px page.
- **CLS 1.94 → 0**, by pinning with `transform` instead of `position: fixed`.

## Known differences

1. **Typefaces.** `ambroise-francois-std` and `sloop-script-three` are Adobe Fonts
   families and cannot be redistributed. Bodoni Moda and Pinyon Script stand in,
   horizontally squeezed to the measured proportions of the originals
   (`--display-squeeze: .53`, `--accent-squeeze: .82`). Sizes, line-heights, tracking
   and measures match; letterform detail does not.
2. **Maison Neue Extended** is used locally because the reference self-hosts it, but it
   is commercially licensed — a real deployment must license it or fall back to the
   bundled Archivo stack.
3. **Header ink during the hero→arch transition** flips on a probe line rather than the
   reference's explicit per-section scroll triggers, so one transitional frame differs.
4. **Barba page transitions** are replaced by ordinary Next.js navigation plus the
   preloader; the reference's cross-page wipe is not reproduced.
5. **Opening splash.** The reference holds a fully composed branded splash for 6–9 seconds
   before opening onto the hero through an arch mask. Ours is a ~1.6s arch wipe — a
   deliberate choice, since the length was reported as too slow.
6. **Secondary pages** (`/apartments`, `/contact`, legal) are on-brand shells, not
   recreations — only the homepage was in scope.
7. **Forms** validate and confirm client-side; the reference's Webflow endpoints are
   not publicly usable.
8. **Analytics** (GTM, GA4, Meta Pixel) deliberately omitted.
9. **Pin positions** on the hero render are approximations; the reference stores them
   in a CMS collection with per-item inline styles.

## Technical notes

- **The whole responsive system is `html { font-size: 1vw }`.** Every size token is
  `calc(<px-at-design-width>rem / <scale-ratio>)`, with the ratio switching from 16
  (1600px canvas) to 4.16 (416px canvas) at 991px. This is the reference's own
  mechanism, verified against computed styles at six widths.
- **Themes remap semantics, not components.** `theme_on-color / -brand / -dark /
  -light / -image` rewrite `--ink`, `--line`, `--bg`; components only ever read the
  semantic names, so any of them drops into any section.
- **Hover state travels as custom properties** on attribute selectors
  (`[hover-btn]`, `[hover-nav-item]`, `[hover-img-card]`) — the reference's technique,
  which lets hover cascade to arbitrarily nested children with no extra selectors.
- **`scaleX` needs layout compensation.** Squeezing the substitute display face is a
  paint-time transform, so `.fit` widens the layout box by `1 / squeeze` and pulls it
  back with negative margins; without it, headings wrapped ~2× too early and, on
  mobile, pushed the layout viewport wider than the screen.
- **The hero's motion is measured, not guessed.** `tools/heroprobe.mjs` walks the reference
  through its pin recording computed transforms; those samples are baked into
  `lib/heroCurves.ts` as interpolated tables rather than approximated with an easing
  function, because the reference uses a GSAP `CustomEase` that no standard curve fits.
  Local output tracks the reference within a few pixels at every sampled scroll position.
- **One IntersectionObserver** serves every reveal on the page, with an `immediate`
  escape hatch for content inside pinned areas that never crosses the threshold.
- **Lenis lives in a ref**, not state — it is an external system, and creating it
  should not re-render the tree.
- **No jQuery, no Webflow runtime, no copied source.** Behaviour was observed and
  reimplemented; the reference's own scripts were read only to identify *what*
  animates.
- **Reconnaissance tooling** is kept in `/tools` (excluded from the build and from
  linting) so any of the measurements in these documents can be re-run.
