# Round 4 — the three-source pass

**Date:** 2026-09-11 · **Reference:** https://www.era-residence.com/

Driven by [`comparison-analysis.md`](comparison-analysis.md) and
[`webflow-recovery.md`](webflow-recovery.md). Method unchanged from earlier
rounds: real Chrome via `playwright-core`, both sites pre-scrolled so pins
settle, measured at matched absolute scroll positions with
`getBoundingClientRect()` / `getComputedStyle()`. `tools/vstate.mjs` is the
reusable comparator added in this pass.

**Rule followed throughout:** find the cause, fix the cause. No compensating
pixel offsets were added anywhere. Where a number moved, it moved to a value the
reference itself declares — in several cases the corrected value fell out onto
an existing design token, which is the clearest sign it was the right one.

---

## Result

| Metric | Before | After | Reference |
| --- | ---: | ---: | ---: |
| Document height @1440 | 24 719 | **24 606** | 24 605 |
| Worst section-top drift | 148px | **77px** (≤6px over the back half) | — |
| Type tokens matching | 13/13 sizes, **0/13 families** | **13/13 sizes, 13/13 families** | — |
| CLS over a full-page scroll | 0 | **0** | — |
| Frame time median / p90 | 16.1 / 31.7ms | **13.9 / 27.9ms** | 7.2 / 27.7ms |
| Horizontal overflow (1440/1024/430/390/375) | none | **none** | none |
| Console errors | none | **none** | — |

---

## Fixes

Severity as in the analysis: **P0** major · **P1** clearly visible · **P2** moderate.

### P0

**1 · Display and accent typefaces were substitutes driven by a scale hack.**
*Root cause:* no licence for the Adobe kit when the earlier pass ran, so Bodoni
Moda and Pinyon Script stood in behind `transform: scaleX(0.53)` / `scaleX(0.82)`
and a `.fit` utility that widened each layout box by `1/squeeze` and pulled it
back with negative margins.
*Change:* client confirmed the kit is licensed. Linked `use.typekit.net/pig8glj.css`
from `app/layout.tsx` (with preconnects, render-blocking by design so nothing
reflows); `--font-display` / `--font-accent` / `--font-body` now name the
reference's own three families in its own fallback order; deleted
`--display-squeeze`, `--accent-squeeze`, the whole `.fit` utility and its 14 call
sites, the `.h5/.h6 { display: inline-block }` artifact and `.c1`'s
`text-indent` compensation; removed three `next/font` Google families.
*Reference:* `ambroise-francois-std` 400, `sloop-script-three` 400,
`Maison Neue Extended` 400/700.
*After:* all 13 tokens match production in size **and** family, `transform: none`
on both sides. Wrapping defects downstream of the substitution resolved with it —
the Concept lead now breaks to three lines as the reference does, not four.
*Animation touched:* no.

**2 · The Concept ground painted powder-sky for ~4 500px where the reference is cream.**
*Root cause:* `PageCanvas` measured each `[data-canvas]` section with
`getBoundingClientRect()`. The Concept section is pinned, and ScrollTrigger
*translates* a pinned element — so its measured "document top" travelled with the
scroll (6 265 at rest, 7 200 at scrollY 7 200). Its cream stop was recorded up to
4 600px late, stranding the sky→cream dissolve above the section.
*Change:* added `lib/layout.ts` with `documentTop()` — summed `offsetTop`, which
is layout rather than paint and is therefore immune to transforms. `PageCanvas`
uses it for every stop.
*After:* solid `rgb(243,243,236)` from 6 300 through 10 800; Hero, Benefits,
Quote and Master Plan verified unchanged.
*Animation touched:* no.

**3 · The Concept horizontal track ran a uniform 427px ahead of production.**
*Root cause:* three inputs, all wrong. A linear map where the reference eases;
no lead-in or lead-out; and 540px of *extra travel* where the reference holds
the track still.
*Change:* `useHorizontalPin` now applies the reference's `horScroll` ease
(`cubic-bezier(0.25,0,0.75,1)`), `scrub: 0.25`, and its 2.5% lead-in/lead-out as
timeline segments. Travel is measured from the panels' summed width rather than
`scrollWidth`, so a decorative element cannot set the pin's length.
*Reference:* `x → -(scrollWidth − areaWidth)`, ease `horScroll`,
`start "2.5% top"`, `end "97.5% bottom"`, `scrub .25`.
*After:* drift ≤48px across 3 075px of travel, and all six measured elements move
together — the mapping is one function again.
*Animation touched:* **yes** — see below.

**4 · Architecture showed two unrelated photographs, side by side, unmasked.**
*Root cause:* the composition had been inferred from the rendered result rather
than the mechanism. The reference shows **one** render behind **two** cream
shutters whose `clip-path` holes open outward.
*Change:* rebuilt. A sticky 1354×1579 panel (`aspect-ratio: 144/168`) carries the
single render and all the type; above it, two solid cream half-screen panels
carry the reference's verbatim polygons, opening 0→.5, running out to the centre
line .5→.6, then scaling to 1.84 on `InOut` while the panel scales .75→1 and the
flowers spread ∓50%. The panel is sticky inside the scroll area, so it releases
on its own when the area runs out — which is what keeps the credits below the
fold until the render is fully open.
*After:* the panel tracks production within 83px; the credits block sits within
10px of its 1 155 offset; the wordmark grows 1 015 → 1 354 painted, as production.
*Animation touched:* **yes** — see below.

### P1

**5 · CTA render: wrong crop, section 224px short.**
Sized by padding rather than by the reference's `aspect-ratio: 144/168`, and the
render was `object-fit: cover` at frame height. The aspect-ratio had to go on the
column *inside* the gutter — put on the padded container it measures against the
full 1440 and yields 1 680. The render is now 140% tall with the reference's
`[data-parallax="img"]` ±15% travel. Section height: **1579, exact**.

**6 · Amenities copy block 706px wide at the gutter (reference: 399, inset 270).**
The measure sat on the element carrying `container`, so the percentage resolved
against 1440 and landed 17px off. Moved to a `.copyInner` wrapper. Now **x 313,
w 399** — exact.

**7 · Amenities tab column flush to the gutter and 14px high.**
Width was `u-272` (245) and the top pad `u-96 + u-48` (129.6) where the reference
uses one `u-160` (144). Now `width: 19.13%; margin-right: 10.12%` and
`padding-top: var(--u-160)` — **x 1001, y 144**, exact.

**8 · Apartment card built as a 3-column grid inside a 75% stage, title at `h3`.**
The reference composes across the full gutter width and sets the layout name at
**`h2`** (122.4px), not `h3`. Rebuilt as an absolute composition against the
section's own 1354×900 screen, with the gutter as `margin-inline` so absolutely
positioned children resolve against the content box rather than the padding box.
Every measured value now matches to the pixel:

| | Reference | Now |
| --- | --- | --- |
| spec labels | 317 / 349 | 317 / 349 |
| render | 522 / 157, 396×528 | 522 / 157, 396×528 |
| body + CTA | 1001 / 349, w 255 | 1001 / 349, w 255 |
| name | 180 / 692, w 1080 @122.4px | 180 / 692, w 1080 @122.4px |
| pagination | 180 / 814, w 1080 | 180 / 814, w 1080 |

### P2

**9 · The footer carried a clip that belongs to the CTA.**
`[data-footer-clip]` is on the **CTA's** container on the reference, not the
footer — which is why an earlier attempt to inset the footer horizontally read as
a violet rectangle floating over the render. Moved to a wrapper around the CTA's
render *and* type, driven by the footer's own trigger window, running to
`inset(8% 22% 8% 22%)` desktop / `inset(4% 32% 4% 32%)` mobile.

**10 · The page ran 232px long and the CTA met the footer on a hard edge.**
The reference pulls `.footer-w` up by `margin-top: -230.4px` — exactly
`u-96 + u-160` — so the plum rises behind the contracting render. Added.
Document height went from 24 837 to **24 606** against the reference's 24 605.

**11 · `.divider` was one grid cell tall where the reference uses two plus a gap.**
The reference declares `calc(1-cell-v * 2 + grid-gap)` = 187.2px; ours was 86.4.
Corrected globally. The two sections whose bottom padding had been absorbing the
101px shortfall were rebalanced — and both landed exactly on existing tokens
(`u-32` for BenefitsIntro, `u-96` for ProjectFacts), which is the strongest
available evidence the divider was the real fault. ApartmentIntro went from −86
to +14; BenefitsIntro is **720, exact**; ProjectFacts sits within 1px on both top
and height.

**12 · Two of the three Concept bougainvillea were mispositioned.**
Panel 3's was already exact; panels 1 and 2 were off by 55px and 99px. Corrected
to the measured panel-local offsets. **All three now match exactly.**

**13 · Concept title lines barely drifted; the intro scale was frozen.**
Same transformed-rect trap as #2 — `progress` read `rect.top` on a pinned
section, so it sat at a constant 0.5. Now uses `scrollProgress()` from
`lib/layout.ts`, and the drift values are the reference's own
`xPercent: wrap([-5,25,-15]) → wrap([5,-25,25])`.

**14 · The Architecture title revealed on viewport entry, far too early.**
`IntersectionObserver` is the wrong signal inside a sticky section: the type is
on screen from the moment the section arrives. Added an optional `revealed` gate
to `SplitReveal` / `useReveal` that bypasses the shared observer, and wired it to
the reference's `start: "30% top"`.

**15 · Motion constants were approximations.**
`EASE.inOut` corrected from `0.76,0,0.24,1` to the reference's `0.75,0,0.25,1`.
Registered all seven of the reference's `CustomEase` curves by name in
`lib/gsap.ts`, and added `bezier()`, `ease`, `phase`, `lerp` and `clamp01` to
`lib/motion.ts`, so a tween can quote the reference verbatim instead of
paraphrasing it.

**16 · A regression found and fixed inside this pass.**
Narrowing the Amenities copy to its correct 399 made it exceed the reserved
`min-height`, so each tab swap moved the block's top edge — CLS went 0 → 0.0222,
attributed with a `layout-shift` PerformanceObserver. Fixed at source by
anchoring the block at the reference's own `top: 74.67%` instead of
`margin-top: auto`. **CLS back to 0.**

---

## Animation changes, and why they were necessary

Three of the sixteen fixes touched animation code. Recorded here because the
brief requires it.

**#3 — Concept horizontal mapping.**
*What was wrong:* every element on the track sat a uniform 427px left of the
reference at matched scroll, and the track over-travelled its own overflow by
540px.
*Why CSS or layout could not solve it:* the offset is produced by the mapping
from scroll position to `x`. That mapping lives in the tween's `ease` and its
trigger offsets; no layout value changes how a scrubbed tween interpolates, and
the uniformity of the offset across all six elements proved it was one function,
not fourteen placements.
*What changed:* three inputs to the existing tween — `ease: "none"` →
`"horScroll"`, `scrub: 1` → `0.25`, and the 2.5% lead-in/lead-out expressed as
timeline segments rather than spent as extra travel. The ScrollTrigger, the pin,
`pinType: "transform"`, `anticipatePin` and `invalidateOnRefresh` are untouched.

**#4 — Architecture shutters.**
*What was wrong:* the section rendered two different photographs beside each
other with no `clip-path` at any scroll position, where the reference shows one
render behind two opening cream shutters.
*Why CSS could not solve it:* there is no CSS path from "two images side by side"
to "one image behind two masks" — the second image has to stop existing and a
masking layer has to start existing. This was the one genuinely structural
mismatch the analysis identified, and it was flagged as such in advance.
*What changed:* the component's markup, plus a progress mapping over the
reference's own trigger window (`start "top bottom"`, `end "200% top"`). It runs
on the same rAF scroll handler the component already used — no Lenis change, no
ScrollTrigger, no new dependency.

**#5 — CTA parallax.**
The reference parallaxes this render ±15% across the section; ours held it still.
Matching the crop without the motion would have matched at exactly one scroll
position and no other, and matching scroll states is the point. Same rAF pattern
as its siblings.

Everything else on the page is untouched: the hero curves, the preloader, the
Lenis instance and its lerp, the amenities pin, the benefits slider, the master
plan, and every reveal outside Architecture.

---

## Deliberately not changed

| Item | Measurement | Why |
| --- | --- | --- |
| Concept scroll area 4 472 vs 4 514 | −42px (0.9%) | The reference's own figure counts 42px of bougainvillea bleeding past the last panel; ours bleeds 99px, and the two browsers report `scrollWidth` differently for identical panel geometry. Measuring the panels keeps the mapping identical on both sides. Costs a ≤48px drift and a ~75px offset confined to the last 77px of the section. |
| Benefits section 865 vs 900 | −35px | No single wrong value identified; below the threshold visible at scrolling speed. |
| Interiors 3 048 vs 2 979 | +69px | As above. |
| Benefits-intro copy placement (~y 4 000) | — | The strapline sits top-left where the reference puts it top-right. Identified in this pass, not traced to a cause. **The strongest candidate for the next round.** |
| Opening splash | — | Still the deliberate ~1.6s arch wipe rather than the reference's 6–9s branded splash. Unchanged from Round 3, for the reason given there. |

---

## Verification

| Check | Result |
| --- | --- |
| `next build` | Clean, 8 static routes |
| `tsc --noEmit` | Clean |
| `eslint .` | 0 errors, 1 pre-existing warning (`Preloader.tsx` `<img>`) |
| Console errors, full-page scroll at 1440 | None |
| Horizontal overflow at 1440 / 1024×1366 / 430×932 / 390×844 / 375×812 | None at any width |
| Broken images at all five widths | None |
| CLS over a full-page scroll | **0** |
| Frame time | median 13.9ms, p90 27.9ms (baseline 16.1 / 31.7) |
| Document height vs reference | 24 606 vs 24 605 |
| Section tops vs reference | ≤77px mid-page, ≤6px from Architecture to the footer |
