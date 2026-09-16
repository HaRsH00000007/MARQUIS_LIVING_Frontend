# Visual QA

Method: real Chrome driven by `playwright-core` (`tools/local.mjs`, `tools/shots.mjs`),
capturing the reference and the local build at the same widths and scroll positions,
plus computed-style probes (`tools/cmp.mjs`, `tools/typo.mjs`) for typography and
layout metrics. Interaction coverage: `tools/interact.mjs`, `tools/mobile.mjs`.
Paired screenshots for eight key scroll positions plus mobile are kept in
`docs/comparison/` (`reference-NN.png` / `local-NN.png`); the full capture sets are
regenerable with `node tools/shots.mjs <w> <h> <tag>` and `node tools/local.mjs …`.

Severity: **S1** breaks the page · **S2** clearly wrong vs. reference · **S3** polish.

---

## Round 1 — first render

| # | Section | Issue | Expected | Sev | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Global type | Substitute display face measured ~2× the reference's width (`RESIDENCE` at 100px: 576px vs 298px) | Narrow poster-Didone proportions | S2 | `--display-squeeze: .53` + `--display-weight: 600` on all display classes | Fixed |
| 2 | Global type | Word/char reveal masks were `display: block`, breaking every heading onto its own line | Masks stay in the line flow | S1 | `.split-word-mask` → `inline-block` with descender padding | Fixed |
| 3 | Global layout | Spacer token `--u-272` used as a width (≈245px at 1440), collapsing every text column | Column-based measures | S1 | Added `--col-3 … --col-10` share-of-container tokens; replaced all width misuse | Fixed |
| 4 | Hero | `.screen` and `.bg` were sibling stickies, so the copy did not track the render | Both inside one sticky wrapper | S1 | Wrapped in `.sticky` | Fixed |
| 5 | Hero | Strapline ran the full container width | ~58% measure, matching reference `x 315→1123` | S3 | `width: var(--col-8)` | Fixed |
| 6 | Hero | `Estepona` swallowed the wordmark's second line | Sits just below with slight overlap | S2 | `margin-top: -0.34em` instead of `-u-96` | Fixed |
| 7 | Hero | Top padding `u-96` pushed the wordmark down vs. reference | Reference uses `u-48` | S3 | Matched | Fixed |
| 8 | Benefits | `nowrap` title widened the grid track, shifting every slide right | Title bleeds without affecting layout | S1 | `grid-template-columns: minmax(0,1fr)` + `100vw` title centred with `margin-left: calc(50% - 50vw)` | Fixed |
| 9 | Benefits intro | Curved `textPath` title rendered ~3× too large and overflowed | ~545px wide arc at 1440 | S2 | viewBox and arc re-cut; font-size 76 → 23 | Fixed |
| 10 | Benefits intro | Curved title sat *after* the strapline | Reference order: curved title → lockup → rule → strap | S2 | Section reordered | Fixed |
| 11 | Arch sections | `8vw` corner radius produced a barely-visible curve | Reference dome ≈ 26vw desktop / 45vw mobile | S2 | Radii and the matching negative margins updated | Fixed |
| 12 | Quote | Card sat above the render instead of over it | Card overlaps the image | S2 | Image absolutely positioned behind a centred card | Fixed |
| 13 | Concept | 12-column grid could not hold the staggered `NEW / GOLDEN / MILE` — words wrapped | Free stagger, image bleeding off the right | S2 | Panel rebuilt with absolute placement | Fixed |
| 14 | Architecture | Intro flower loops (`z-index: 3`) painted over the rising plum panel (`z-index: 2`) | Panel covers everything | S2 | Panel raised to `z-index: 4` | Fixed |
| 15 | Architecture / CTA / Amenities | Scrims too heavy — renders read as flat purple | Reference keeps midtones open | S3 | Three-stop gradients retuned | Fixed |
| 16 | Footer | "To top" arrow pointed down | Points up | S3 | `rotate(90deg)` | Fixed |
| 17 | Buttons | `1px solid var(--line)` was invisible over busy imagery | Legible ring | S3 | `border-color: currentColor` | Fixed |

## Round 2 — behaviour and responsive

| # | Section | Issue | Expected | Sev | Fix | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 18 | Header | The mobile menu sheet kept `display: flex` under `[hidden]`, so an invisible full-screen overlay swallowed **every click on desktop** | Hidden means hidden | **S1** | Global `[hidden] { display: none !important }` | Fixed |
| 19 | Hero | CTA + description never appeared: they sit in a sticky area that never crosses the reveal observer's threshold | Staged entrance on load | S1 | `immediate` mode added to `useReveal` / `SplitReveal` / `FadeIn`; used across the hero | Fixed |
| 20 | Global type | `scaleX` is paint-only, so squeezed copy reserved 1.89× its painted width and wrapped far too early (mobile `RESIDENCE` broke to `RESIDE / NCE`) | Text breaks where it visually should | S1 | `.fit` widens the layout box by `1 / squeeze` and pulls it back with negative margins | Fixed |
| 21 | Concept / Architecture / modal | `place-items: center` centred items inside a track that was itself pinned to the start | Content centred in the panel | S2 | Added `place-content: center` | Fixed |
| 22 | Mobile | `nowrap` squeezed headings pushed the *layout viewport* to 1088px at a 390px screen — the fixed header stretched off-screen and the menu button was unreachable | Layout viewport equals the screen | **S1** | `overflow-x: clip` on `html`; explicit clipping on every `nowrap` display heading's wrapper | Fixed |
| 23 | Mobile | Menu button was a 60×15px tap target | ≥44px | S2 | `min-height: 44px` on the menu button, amenity tabs, hero tabs; `min-width/height: 44px` on pagination arrows; hero pins `max(--u-32, 44px)` | Fixed |
| 24 | Mobile hero | Strapline stacked into three centred rows | Reference keeps `A PLACE` / `TO RETURN TO` on one row with the tabs beneath | S2 | Named grid areas at ≤991px | Fixed |
| 25 | Concept | Intro lead ran the full panel width | Reference breaks over three lines at ≈46vw | S3 | `.introInner { width: min(100%, 46vw) }` | Fixed |
| 26 | Header | Nav ink stayed light over the pale arch because the theme probe sat at 8% of the viewport, above the arch crown | Ink flips as the new section takes the screen | S2 | Probe moved to 35% of viewport height | Fixed |
| 27 | Accent script | Pinyon Script ran wider than the reference's Sloop | Matching measure | S3 | `--accent-squeeze: 0.82` | Fixed |
| 28 | Badge | Ring text too small relative to the mark | Reference lockup | S3 | Ring font-size 6.4 → 7.6px, text re-phased | Fixed |


## Round 3 — hero scroll choreography (reported: "not properly replicated / too slow")

The hero was rebuilt against a direct measurement rather than an eyeball. `tools/heroprobe.mjs`
steps the reference through its pinned hero in 150px increments and records each layer's computed
transform; `docs/hero-ref.json` is that capture, and `lib/heroCurves.ts` is generated from it.
Paired frames at scrollY 0 / 1500 / 3400 are in `docs/comparison/hero-*.png`.

**What the reference actually does** (pin distance 4320px at 1440x900):

| Layer | Motion | Range |
| --- | --- | --- |
| Copy (`.hero-s`) | `translateY 0 → -720px` (= **-80vh**), never fades | completes at 59% of the pin |
| Render | `translateY 0 → -400px` (= -44vh), same ease, stays full-bleed | completes at 59% |
| Render | `scale 1 → 2`, steep cubic, focal point ~62% down the viewport | 52% → 100% of the pin |
| CTA block | rises from below the fold to ~72% of screen height | same ease as the copy |
| Arch section | plain scroll, **overlapping the hero's last 1.8 screens** | — |

| # | Issue | Sev | Fix | Status |
| --- | --- | --- | --- | --- |
| 29 | Copy drifted only **18vh** across the entire 4320px pin, and faded out — the reference slides it **80vh** and never fades. This was the main reason the hero felt static and slow. | **S1** | Baked the measured ease (`EASE_SLOW`) and amplitude; copy now clears the screen in the first 2550px | Fixed |
| 30 | Render scaled to just **1.06**; the reference zooms to **2.0** | **S1** | `EASE_ZOOM` table, resampled onto a uniform grid | Fixed |
| 31 | Render insetted toward the page gutters as the hero scrolled — the reference never does this | S2 | Removed; the layer stays full-bleed | Fixed |
| 32 | Render box was viewport-height, so parallaxing it up exposed bare plum below, and the "reveal the pool" effect was absent entirely | **S1** | Layer is now 144vh, anchored top, matching the reference's oversized render box | Fixed |
| 33 | Zoom scaled about the centre; the reference's focal point is ~62% down the viewport, on the pool | S2 | `transform-origin: 50% 106.8%`, solved from the measured top/height pairs | Fixed |
| 34 | Hero CTA was a left-aligned pill with the strapline pushed to the right; the reference uses a **centred circular** button with the strapline beneath | S2 | Rebuilt as `ButtonCircle` in a centred column | Fixed |
| 35 | The arch section began *after* the hero, so the zoom played out against nothing. On the reference the arch scrolls up over the hero's final 1.8 screens while the render swells behind it | S2 | `margin-top: -180vh` on the arch section; hero given `isolation: isolate` so its internal z-indexes stay local | Fixed |

**Verification** — local vs reference, same scroll positions, 1440x900:

| scrollY | copy `translateY` (ref / local) | render top (ref / local) | render width (ref / local) |
| --- | --- | --- | --- |
| 300 | −87 / −87 | −48 / −48 | 1440 / 1440 |
| 900 | −432 / −432 | −238 / −240 | 1440 / 1440 |
| 1500 | −626 / −627 | −345 / −348 | 1440 / 1440 |
| 2100 | −704 / −704 | −389 / −391 | 1440 / 1440 |
| 2700 | −720 / −720 | −419 / −416 | 1474 / 1475 |
| 3300 | −720 / −720 | −528 / −531 | 1635 / 1637 |
| 3600 | −720 / −720 | −656 / −658 | 1826 / 1827 |
| 3900 | −720 / −720 | −870 / −870 | 2143 / 2144 |

Within a few pixels throughout.


## Round 4 — entrance animation (from the user's screen recording)

Source: `Screen Recording 2026-09-09 212935.mp4` (1918x976, 30fps, 15s), decoded with
ffmpeg and inspected frame by frame. Evidence kept in `docs/comparison/entry-*.jpg`.

**What the recording shows in its first 0.7 seconds**

| Element | Behaviour |
| --- | --- |
| `ERA / RESIDENCE` | Characters **fade in place**, left to right. No mask, no vertical travel — every glyph is full height from the first frame, only its opacity climbs. |
| `Estepona` | Starts at a **wide letter-spacing** and collapses to zero over ~0.7s while the characters fade in, so the glyphs draw together — the further into the word a letter sits, the further it travels. Measured start width ≈ 1.43x the settled width, i.e. ~0.14em of tracking. |
| `A PLACE` / `TO RETURN TO` | Already settled by the first frame. |
| Render, rail, badge | Static at `00`; the parallax only begins once the user scrolls (rail reads `01` by t≈1.5s). |

| # | Issue | Sev | Fix | Status |
| --- | --- | --- | --- | --- |
| 36 | The hero wordmark rose out of an overflow-hidden mask. The reference has no clipping edge on it — the letters simply resolve in place. | S2 | Added a `fade` motion to `SplitReveal` (`[data-reveal="fade"]`, unmasked, opacity-only) and used it for the wordmark | Fixed |
| 37 | The script accent just cross-faded — the reference's signature "write-on" was missing entirely | S2 | New `AccentReveal`: tracking collapses `0.14em → 0` on `--ease-write` with a per-character opacity stagger. Applied to `Estepona`, `Live in` and `yours`. | Fixed |
| 38 | Collapsing `letter-spacing` also pads after the final glyph, drifting centred text sideways during the transition | S3 | `margin-right` transitions against it, cancelling the shift | Fixed |
| 39 | The preloader held 0.9s and wiped over 1.2s, so the hero entrance played *behind* the plate and was over before it lifted — the visitor never saw it | S2 | Plate holds 0.3s and wipes in 0.9s; hero entrance re-timed to start at 0.85s, as the plate clears, and finish by ~2.2s | Fixed |


## Round 5 — footer (reported from a screenshot of the reference)

Geometry measured with `tools/footer3.mjs` / `tools/footmeasure.mjs` at 1440x900.
Paired captures in `docs/comparison/footer-*.png`.

**What the reference footer actually is**

| Element | Spec |
| --- | --- |
| Phone number | **`h2` display type** — 122.4px at 1440, line-height 88%, tracking −0.024em, char-split, centred. Painted width 560px. |
| ERA mark | 58px (`u-64`), centred above the phone |
| Address | `Sales office` in `l1 reg`, street in `l1` bold, inside a 192-design-px centred column so it wraps to two lines |
| Contact block | Vertically centred on the **whole** 900px panel (308–592), independent of the legal row |
| Legal / credits row | A centred block spanning ~59.5% of the container (x 317→1123), not the full gutter width |
| "To top" | Left gutter, in the same 136-design-px column as the fixed scroll rail: up-arrow above a **vertically set** label (x43 y746 122x111) |

| # | Issue | Sev | Fix | Status |
| --- | --- | --- | --- | --- |
| 40 | Phone was `h5` body-scale type; the reference sets it as a 122px display `h2` — the single most visible error | **S1** | Rebuilt as `h2` with a char-split fade | Fixed |
| 41 | Footer was a generic stacked block — no centred contact column, no ERA mark, address in the wrong place | S2 | Rebuilt to the measured structure | Fixed |
| 42 | The scroll-driven reveal wrapping the footer could never reach `progress: 1` — its denominator was `height + viewport`, but the footer is the last element on the page and never scrolls past the top. It sat permanently at **0.875 scale / 0.8 opacity** | **S1** | Progress now completes on *entry*, measured against `min(height, viewport)` | Fixed |
| 43 | The "To top" arrow was rotated on its wrapper, so the column reserved the arrow's unrotated (wide, short) footprint and collapsed to 78px instead of 111px | S2 | Square wrapper, rotation moved to the glyph. Same fix applied to the scroll rail. | Fixed |
| 44 | "To top" sat at the gutter edge, out of line with the scroll rail | S3 | Both share a `u-136` column, centring at x104 as the reference does | Fixed |
| 45 | The rail's "Scroll" hint stacked with the footer's "To top" at the bottom of the page | S3 | Hint fades out past 98.5% scroll | Fixed |
| 46 | Bodoni Moda's `5` carries a flat slab that the 600 display weight turned into a block at 122px | S3 | Numerals drop to weight 400 with a wider squeeze (0.588) to hold the reference's 560px width | Fixed |
| 47 | On mobile the nowrap phone overflowed its box and the squeeze centred on the wrong axis, clipping the last digits | S2 | Applied `.fit`, which reads the locally overridden squeeze | Fixed |
| 48 | Mobile stacked the legal/credits row and showed "To top"; the reference keeps the row side by side and drops "To top" | S3 | Matched | Fixed |

**Verification** — local vs reference at 1440x900:

| Element | Reference | Local |
| --- | --- | --- |
| ERA mark | x691 y308 58x58 | x691 y308 58x58 |
| Phone line box | y394 h108 | y395 h108 |
| Address column | x634 y545 173x47 | x634 y546 173x47 |
| Legal row left edge | x317 | x317 |
| Credits right edge | x1123 | x1123 |
| "To top" | x43 y746 122x111 | x43 y746 122x111 |

## Verified working

| Check | Result |
| --- | --- |
| Cookie consent shows, accepts, persists | Pass |
| Hero day / night cross-fade | Pass |
| Hero hotspot opens and closes its tip | Pass |
| Book-a-call modal: opens, validates, confirms, closes on `Escape` | Pass |
| Benefits slider prev / next + progress rule | Pass (1 → 2 of 3) |
| Amenity tabs: scroll-driven **and** clickable (click scrolls to that slice) | Pass (Gated community → Spa & gym) |
| Footer "to top" | Pass (scrollY → 0) |
| Mobile menu opens, locks the body, closes | Pass |
| Horizontal overflow at 390px | None (`scrollWidth` 390) |
| Browser console errors | None |
| Failed network requests (4xx/5xx) | None |
| `tsc --noEmit` | Clean |
| `eslint .` | Clean |
| `next build` | Clean, 8 static routes |

## Open — accepted differences

| Item | Note |
| --- | --- |
| Display and script typefaces | Substitutes; see `assets.md`. Calibrated by measurement, but letterform detail differs. |
| Header ink over the hero→arch transition | Flips a fraction earlier/later than the reference in one transitional frame; the reference drives this from explicit per-section scroll triggers rather than a probe line. |
| Tablet at 768px | Type and controls are large because the reference switches to a 416px design canvas below 992px — reproduced faithfully, and it looks equally oversized on the original. |
| Opening splash | The reference runs a branded plum splash (mark, `ERA RESIDENCE / Estepona`, `COSTA · DEL SOL`, watermark script) for **6–9 seconds** before opening onto the hero through an arch mask. Ours is a ~1.6s arch wipe. Matching its length would work against the "too slow" feedback, so the shorter version is deliberate; its composition is the difference that remains. |

---

# Round 4 — the three-source pass (2026-09-11)

The font substitution recorded above as an accepted difference is **resolved**:
the client confirmed the Adobe kit is licensed, so the reference's own
`ambroise-francois-std` and `sloop-script-three` are now loaded and the
`scaleX` squeeze and the `.fit` utility are gone.

Full record of that round — sixteen fixes, the three that touched animation and
why, what was deliberately left, and the verification numbers — is in
[`round-4-three-source-pass.md`](round-4-three-source-pass.md).

Headline: document height 24 606 against the reference's 24 605; every one of
the 13 type tokens matching in size *and* family; CLS 0; no overflow at any of
the five tested widths.
