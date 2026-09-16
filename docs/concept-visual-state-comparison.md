# Concept / Location / route-path — visual state comparison

Reference: https://www.era-residence.com/ · Local: http://localhost:3000/ · Chrome 1440x900.

## Method

The earlier passes compared viewport screenshots. That could not separate *animation
progress* from *composition*, because the horizontal track's translate moves every element
at once — a panel that is merely 200px further along looks identical to a panel whose
contents are misplaced by 200px.

So this pass measured **panel-local geometry** instead (`tools/cpanel.mjs`,
`tools/ctree2.mjs`): find the track, then report every child's rect **relative to its own
panel**. Those numbers are immune to the translate, which means every difference below is
composition, not timing. Viewport checkpoints at 0/20/40/60/80/100 % (`tools/concept.mjs`,
strips in `docs/concept/`) were then used to confirm the fixes in motion.

## The structural finding

The reference's track is **not three viewport-width panels**:

```
section.clip                      1440 x 4514      overflow: clip
  .container.loc
    .loc-scroll-area              1397 x 4514      inset 43 on the LEFT only
      .loc-scroll-area_screen     1397 x  900      sticky
        .loc-scroll-area_track    4471 x  900      translateX
          .loc-info-w             1354 x  900      panel 1
          .loc-intro-w            1764 x  900      panel 2   <-- 22% wider
          .loc-path-w             1354 x  900      panel 3
```

Local had three identical 1440-wide panels in a 4320-wide track starting at x 0.
Panel 2 being 1764 rather than 1440 is the single root cause of most of the panel-2
mismatches: at 1764 there is room for the title on the left third, the terrace portrait in
the middle, the caption block at 70 %, **and** a circular CTA parked at 87 %. At 1440 there
is not, so the previous build stacked the caption and a pill button in the bottom-left
corner instead.

## Viewport checkpoint table

Percentages are of the Concept sequence (section top + n x 5.0 screens).

| Progress | Production | DEV (before) | Difference | Root cause | Fix |
| --- | --- | --- | --- | --- | --- |
| 0 % | Panel 1 centred: eyebrow, 3-line lead, a narrow 259 centred paragraph and the ERA monogram beneath it | Same panel, but eyebrow at the wrong scale, paragraph 336 wide and no monogram | Panel 1 foot reads as loose body text, not a signed-off block | `l2` used for the eyebrow instead of `l1`; body measure guessed; monogram never placed | `l1`, 19.13 % measure, `era-mark.svg` under the paragraph |
| 20 % | Panel 1 exiting left, panel 2 entering: "Spain" caption, then the 3-line NEW / GOLDEN / MILE title on the panel's left third | Panel 2 entering with the title hard against the panel's **right** edge | Title enters ~530 px too late and never settles into the left third | `.placeTitle` absolutely placed at `left: 44%` and shrink-wrapped, on a 1440 panel | Title in a 37.98 %-wide cell at `left: 15.53%` of a 1764 panel |
| 40 % | Terrace portrait **533 x 814** inset 43 top and bottom, floating in the panel's middle with cream visible on both sides | Terrace **374 x 900**, full height, hard against the panel's right edge | Image reads as a bleed strip rather than a framed plate | `.placeImg { inset: 0 0 0 auto; width: 26% }` | 30.21 % x 90.44 % at `left: 38.78%`, `top: 4.78%` |
| 40 % | Caption "Between Marbella and Estepona" at **h5 / 36 px**, bottom-right at x 1231, with a 396 paragraph under it and a **187 circle CTA** at x 1541 | Caption at **l1 / 10 px**, bottom-**left** at x 43, with a pill button | Wrong corner, wrong type scale, wrong control | Panel too narrow to hold the right-hand column; caption token wrong | `h5`, copy block at `left: 69.78%`, `ButtonCircle` at `left: 87.36%` |
| 60 % | Panel 3: headline **at the top** (y 236, h 218), route drawing **at the bottom** (y 647), ~193 of negative space between them | Route at the **top** (y -39 and y 162), headline **below** it (y 501) | **The panel is upside down**, and the route is 396 tall instead of 210 | (a) route SVGs stacked in flow; (b) `.panelCoast` renders `.path` before the headline | Superimpose the two SVGs; put the headline first |
| 60 % | Headline **h3 / 86 px** on an 806 measure, **2 lines**, with "yours" written across the gap between them at 108 px | Headline **h2 / 122 px** on a 717 measure, **4 lines**, "yours" on its own line at 173 px | Headline is 2x too tall and swallows the negative space | `h2` + `a1` tokens instead of `h3` + `a2`; accent given real line height | `h3` + `a2`, accent line box collapsed to 60 of 108 |
| 80 % | Panel 3 settled and centred; route 1080 wide, 43 above the panel foot | Route 1002 wide and already scrolled past the top of the viewport | Route never rests in the lower third | Panel ordering + height, as above | `justify-content: space-between` over spacer / headline / route |
| 100 % | Route leaves upward while the master-plan render is already 364 px into the viewport — the blue arrives *under* the still-visible route | Route leaves, then the blue plan arrives from the viewport edge | The blue/route overlap state never happens | MasterPlan does not overlap the Concept outro | see "State 2" below |

## Bougainvillea (panel-local, all three are 720 x 720)

| | Production | DEV (before) | Fix |
| --- | --- | --- | --- |
| flower 01 (panel 1) | x -101, y -14 | x -58, y -72 | `left: -7.46%; top: -1.56%` |
| flower 02 (panel 2) | x -301, y 310 | x -58, y 558, **432 x 432** | `left: -17.06%; top: 34.44%; width: 50vw` |
| flower 03 (panel 3) | x 734, y -130 | x 1066, y -54, **461 x 461** | `left: 54.21%; top: -14.44%; width: 50vw` |

Panel 2 and 3's blooms were rendered at 60 % and 64 % of the reference size, which is why
the "bougainvillea enters from the upper-right" moment reads as a small decoration rather
than a bloom overhanging the composition.

## Checked and found already correct — not touched

- **Type tokens themselves.** `h1` 172.8, `h4` 56.7, `h5` 36, `c1` 22.5, `l1` 9.9, `a2` 108
  all match the reference to <1px. Only the *choice* of token in three places was wrong.
- **The horizontal line shift** on NEW / GOLDEN / MILE. The reference does shift its three
  title lines independently mid-scroll; the local implementation already reproduces it.
  Left alone.
- **Panel 1's lead measure** at 59.5 % of the panel (806 / 1354). Already correct.
- **Scroll indicator, ERA logo, top-right navigation.** Fixed-position chrome; measured
  identical at every checkpoint. Not touched.
- **Background.** Cream `rgb(243,243,236)` across the whole sequence on both sites. The
  `PageCanvas` token was already right; the "blue" state is the master-plan render
  arriving, not a background change.

## State 2 — the blue / route overlap

The brief describes a state with "light blue background, route line toward the upper
portion". Measured, that is not a background change: at 80 % the reference already has the
master-plan render at viewport y 536 (1656 x 1449, scaling down as it rises) while the
route is still on screen at y 647. Locally the plan render does not appear until y 900 —
exactly the viewport edge — so the two never share the screen and the blue arrives as a
hard cut after the route has gone.

The 364 px of overlap is section geometry and is fixed by pulling the master plan up into
the Concept outro. The reference *also* scales that render 1.15x down to 1.0 as it enters.
That is an animation the local build does not have, and the brief rules out adding
animations, so **it was not added** — only the overlap.

## The one animation-adjacent change, and why

Panel widths are geometry, but the pinned track's travel is derived from them:
`scrollWidth - viewport`. Two knock-on corrections were unavoidable.

1. `useHorizontalPin` measured travel against `window.innerWidth`. The panels no longer
   span the viewport — the track lives in a 1397-wide area inset 43 from the left — so it
   now measures against the track's own parent. Without this the last panel stops 43 px
   past the right edge. No easing, scrub, trigger or pin behaviour was changed.
2. `HOLD` went 0.8 to **0.6** screens. The reference's own end-hold is 540 px of a 900
   viewport, i.e. exactly 0.6. Left at 0.8, the wider track would have made the section
   4695 tall against the reference's 4514, pushing every later section down 181 px and
   breaking the document-height match. At 0.6 the section is **4514** — the reference's
   height to the pixel.

Both are one-line, reversible, and neither touches Lenis, GSAP's timeline, the easing, the
scrub, or the scroll-progress calculation.
