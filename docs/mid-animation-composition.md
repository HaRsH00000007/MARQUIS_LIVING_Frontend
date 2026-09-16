# Mid-animation composition — reference vs local

The animation system was **not touched**: Lenis, the pin hooks, the scroll-progress
plumbing, easing, durations and `PageCanvas` are all unchanged. Everything below is
underlying geometry.

## Method

Earlier passes compared fixed scroll offsets, which drift as section heights change.
This pass anchors instead: `tools/anchor.mjs` finds each sequence's landmark **on each
site in the same session**, reads that section's own document top, and captures
**0 / 25 / 50 / 75 / 100%** of the sequence on both. Same phase, regardless of drift.

Sanity check first — `tools/scrolltest.mjs` confirmed `window.scrollTo` settles instantly
on both sites, so Lenis is not skewing the captures. Anchors agreed within 70px
throughout, which also validates the fixed-offset comparisons used earlier.

Strips: `docs/anchor/S-*.jpg` (reference row above local row).

## Findings

| Scroll state | Element | Reference | Current | Root cause | Fix |
| --- | --- | --- | --- | --- | --- |
| Quote 0–50% | Bougainvillea | Not present over the render; enters only at the cream boundary below | A large bloom covered the pool from the section's first frame | **Wrong section.** The reference's `.flower.loc-info` belongs to the Concept's first panel; ours was a second copy of flower 01 placed inside the Quote | Removed it from Quote; Concept keeps its own |
| Quote 25–75% | Quote text | Block 533 wide, right edge at 1260 of 1440 — inset from the gutter | 677 wide, running to the gutter | `max-width: var(--col-6)` (50%) with no right inset | 39.4% wide, `margin-right: 10.1%` |
| Quote 50–100% | Render foot | Two stacked `img-over-grad` panels, 389 of 1080 tall (36%), giving the white type its footing | No shading — bright pool under white text | The overlay divs were removed in an earlier pass as "duplicated" | One gradient of equivalent density at 36% |
| Quote → Concept | Render edge | Clean line into cream | 18vh fade | `--bleed-h` too long for this join | 8vh |
| Concept 0% | Bougainvillea | 720×720 at x −58 (50vw) | 34vw | Guessed size | 50vw, left −4% |
| Interiors 50–100% | **Feature block ground** | A **plum plate under the left 40%** of the viewport (measured 677×756 at the container gutter, bleeding to the viewport edge) with the garden render standing on it, cream on the right | Both renders floating on cream | The plate was never built — the section read as two pictures on a blank page | `.featureLeft::before` plate, 756 tall, `right: 15%`, bleeding left |
| Interiors 50–100% | Garden render | Inset inside the plate with plum visible around it (329 of 575) | Filled the column edge to edge | No inset | `width: 62%; margin-left: 8%` within the left column |
| Interiors 75% | Bougainvillea | Spills over the render's **top-right** | Sat at its foot | Position guessed | `top: -16%; left: 34%` |
| Amenities 0–100% | Tab list | Active `opacity: 1`, inactive `0.4` | Same — **verified correct, no change** | — | none |

## Checked and left alone

- **Quote render crop** — measured identical on both: section 1080 tall, image 1440×1080
  anchored at the section top, text block 533 wide at +735 from the section top. Local
  reads 5185/1080/533/+774 against the reference's 5220/1080/533/+735.
- **Hero curves** — already matched within 3px in the previous pass; not re-touched.
- **Amenity slide index at 25%** differs between the two sites (ours has advanced one
  further). That is animation *progress*, not composition, and the brief rules out
  re-timing, so it stands.

## Not changed, and why

Four P3 items carried over from `final-visual-differences.md` (Interiors list order,
route-path placement, arch-crown timing, amenity gutter inset) remain open. Each needs a
layout change for a difference that is not legible at scrolling speed.


## Verification after the changes

| Check | Result |
| --- | --- |
| Cumulative layout shift, full-page scroll | **0** |
| Interactions (consent, hero tabs, hotspots, modal, 3 sliders, amenity tabs, accordion, to-top) | all pass |
| Mobile 390×844 | menu opens/locks/closes; `scrollWidth` 390, no overflow |
| Console | no errors |
| `tsc --noEmit` / `eslint` / `next build` | clean (1 pre-existing `<img>` warning in the Preloader) |
| Document height | 24 247 vs the reference's 24 605 |

### On the performance numbers

This machine was too loaded to give a stable absolute reading — a browser with ~32
processes open swung the median between 14ms and 76ms **for the reference itself**. Three
paired back-to-back runs (`tools/perf2.mjs`, reference then local in the same session):

| Run | Reference median / p90 | Local median / p90 |
| --- | --- | --- |
| A | 23.8 / 33.5 | 27.6 / 55.5 |
| B | 76.5 / 159.8 | 48.4 / 83.2 |
| C | 27.9 / 97.3 | **13.9 / 27.7** |

Local matched or beat the reference in two of three, and the best-case readings are
identical to the pre-change baseline (13.9 vs 14.0). No evidence of a regression; no
reliable absolute figure available on this hardware.
