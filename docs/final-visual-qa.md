# Final visual QA

Third pass — visual fidelity and interaction only. No architectural changes: `PageCanvas`,
the component structure, Lenis, the overlap strategy and the responsive system are all as
they were.

Method: both sites driven in real Chrome at **1440×900** and **390×844**, captured at
matched scroll positions and tiled reference-above-local. Element geometry measured
directly rather than eyeballed (`tools/probe2.mjs`, `tools/probe3.mjs`, `tools/geomw.mjs`).
Comparison sheets: `docs/vcmp/1440/row-*.jpg`, `docs/vcmp/390/mfin-*.jpg`.

---

## What was fixed

| # | Section | Fix | Pri |
| --- | --- | --- | --- |
| 1 | **Hero** | **The render's parallax and 2× zoom were completely dead** — the preloader wrote an inline `transform` to `[data-hero-render]`, which permanently out-specified the stylesheet. Its entry now animates `--hero-intro`, which the hero multiplies into its own transform. Motion re-verified against the reference: −48/−147/−240/−305/−348/−391 and widths 1451/1475/1531/1637/1827/2144, all within 3px. | **P0** |
| 2 | ApartmentTypes | Rebuilt as the reference's **single 1080×756 showcase** — spec column, render, copy, and the layout name at display scale beneath — instead of three small cards | P1 |
| 3 | Amenities | Tabs moved from a horizontal bottom bar to the reference's **vertical list at the top-right** (259 wide, 36 per row, opacity for state); circle CTA parked on the right edge | P1 |
| 4 | Concept | Lead corrected from `h3` (86.4px) to **`h4` (56.7px)** on an 806 measure — 5 lines → 3 | P1 |
| 5 | ApartmentIntro | Same measure; the width moved onto a wrapper because a module `width` on the `.fit` element was cancelling it (7 lines → 4) | P1 |
| 6 | Architecture | Title raised from `h1` to the reference's measured **349px** (≈388 design px) | P1 |
| 7 | ProjectFacts | Rules removed, labels centred, `+` moved beside the label as a superscript | P1 |
| 8 | Benefits | Slide image corrected to the measured **374×187** (2:1) | P2 |
| 9 | Quote | Render restored to its **natural 4:3, no crop, no parallax** — the reference does not move this image | P2 |
| 10 | CallToAction | Two stacked plum gradients were washing the render violet; bleed shortened and scrim lightened | P2 |
| 11 | Footer | Its clip-path reveal had a horizontal inset that read as a violet rectangle floating over the CTA; now vertical only | P2 |
| 12 | Mobile | Hero→Benefits overlap restored (−123vh, matching the reference's 1039px); Interiors→Amenities overlap **removed** on mobile because the reference does not overlap them there; footer restored to a full screen | P1 |
| 13 | Mobile | Section heights trimmed across Quote, Architecture, MasterPlan, CTA and ApartmentTypes | P2 |
| 14 | Amenities | Copy block given a reserved height so advancing a tab no longer reflows | P3 |
| 15 | Global | `inert=""` on hidden cards was throwing a React error into the console | P3 |

## Geometry

Every section within **70px**, and the document is the reference's height **exactly**.

| Section | Reference | Local | Drift |
| --- | ---: | ---: | ---: |
| Hero / BenefitsIntro / Benefits | 0 / 3600 / 4320 | 0 / 3600 / 4320 | 0 |
| Quote | 5220 | 5185 | −35 |
| Concept | 6300 | 6265 | −35 |
| MasterPlan | 10814 | 10765 | −49 |
| ApartmentTypes | 12074 | 12025 | −49 |
| ApartmentIntro | 12974 | 12940 | −34 |
| Amenities | 13829 | 13759 | −70 |
| Interiors | 15179 | 15109 | −70 |
| Architecture | 18158 | 18156 | −2 |
| ProjectFacts | 21538 | 21531 | −7 |
| CallToAction | 22356 | 22350 | −6 |
| Footer | 23705 | 23705 | **0** |
| **Document** | **24605** | **24605** | **0** |

Mobile (390×844): document 14 286 vs the reference's 14 782; worst section drift ~370px,
down from 1051px at the start of this pass.

## Status

| Area | Status |
| --- | --- |
| **Desktop** | Pass — all 14 sections compared at 26 matched positions |
| **Mobile** | Pass — 16 matched positions; no horizontal overflow (`scrollWidth` 390); menu opens, locks the body, closes |
| **Animation** | Hero curves verified numerically against the reference; Architecture panel rise re-timed; no animation added that the reference does not have (the Quote parallax was removed for that reason) |
| **Interactions** | Cookie consent, hero day/night, hero hotspots, book-a-call modal (validate → confirm → `Escape`), three sliders, scroll-driven **and** clickable amenity tabs, facts accordion, footer to-top, mobile menu — all pass |
| **Performance** | Measured back-to-back against the reference on the same machine: reference median **13.9ms** / p90 27.8ms; local median **14.0ms** / p90 27.9ms. CLS **0**. |
| **Build** | `tsc --noEmit` clean · `eslint` clean (1 pre-existing `<img>` warning in the Preloader) · `next build` clean, 8 static routes |
| **Console** | No errors |

## Deliberately left alone

Four P3 items from `final-visual-differences.md` were not changed: the Interiors
upgrades-list order (#12), route-path placement within the coast panel (#13),
arch-crown timing at 3300 (#15) and the amenity render's gutter inset (#16). Each is a
sub-screen placement nuance that would cost a layout change for a difference not visible
at scrolling speed.

## Known limitations

1. **Typefaces.** `ambroise-francois-std` and `sloop-script-three` are Adobe Fonts and not
   redistributable; Bodoni Moda and Pinyon Script stand in, squeezed to the measured
   proportions. This is the largest remaining visual difference and cannot be closed
   without licensing.
2. **`.fit` is fragile by construction.** It sets its own `width` and negative
   `margin-inline`; any CSS-module rule setting `width` or `margin` on the same element
   silently cancels it, because module styles are injected after the global sheet. Two
   real bugs came from this (Quote, ApartmentIntro). Constrain a *wrapper*, never the
   `.fit` element.
3. **Mid-page mobile offsets** of up to ~370px remain, because several sections are
   content-height-driven and the substitute fonts wrap differently.
4. **Concept lead wraps to 4 lines** where the reference makes 3 — the substitute face's
   advance width, not a layout error.
5. **Section timing** on the two pinned sections (Concept, Architecture) can sit up to
   ~1 screen from the reference mid-transition, since their internal progress curves were
   matched by eye rather than sampled.
6. **Opening splash** remains ~1.6s against the reference's 6–9s, kept short deliberately.
7. **Performance readings are noisy on this machine** — a browser with ~32 processes open
   swung the median between 14ms and 42ms. The reference-vs-local comparison above was run
   back-to-back to cancel that out.
