# Comparison Analysis — Production vs Webflow Extraction vs React

**Date:** 2026-09-11 · **Status:** analysis only, no implementation changes made.
**Reference:** https://www.era-residence.com/ · **Local:** `http://localhost:3001/`
**Method:** both sites driven in the installed Chrome binary via `playwright-core` at
1440×900, fully pre-scrolled so pins and lazy content settle, then measured at matched
absolute scroll positions. Element geometry read from `getBoundingClientRect()` +
`getComputedStyle()`; backgrounds read by walking up from `elementFromPoint()`.
Asset identity established by MD5, not by filename.

The Claude-in-Chrome extension was not connected in this environment, so browser
observation used the same real-Chrome path this repo already established in
`browser-vs-download.md`.

Companion document: [`webflow-recovery.md`](webflow-recovery.md) — what the two
extractions actually contain, and the verbatim motion constants recovered from the
production animation bundle.

---

## A. The three sources, and what each is good for

| Source | What it is | Verdict |
| --- | --- | --- |
| **Production** | The live Webflow site | Sole authority on visual and behavioural truth |
| **`/webflow`** | One HTML file, 222 807 B | **Redundant.** Byte-for-byte the same document as `reference-download/html/index.html` already in the repo (similarity 1.00000 after URL normalisation). Contributes nothing. |
| **`/rs`** | HTTrack mirror, 407 files / 83 MB | **Valuable for assets, not HTML.** Its `index.html` is the same DOM with rewritten URLs. Its worth is the complete asset set, plus the `/contact` and 22 `/apartments/*` pages the repo has only as stubs. |
| **`/Front_end_website`** | Next.js 16 + React 19 + GSAP 3.15 + Lenis | Substantially and, in most places, *accurately* implemented. Do not rebuild. |

The most valuable single file in the workspace is in neither extraction: it is
`reference-download/js/custom-main.js`, the production Slater animation bundle, already
in the repo. HTTrack could not fetch it because it is `import()`-ed at runtime.

---

## B. Architecture of the current React implementation

```
app/layout.tsx
 └─ SmoothScroll (Lenis lerp .085, driven from gsap.ticker, ScrollTrigger.update)
     ├─ PageCanvas        one fixed gradient ground, dissolving between [data-canvas] tokens
     ├─ Preloader · Header · ScrollRail · CookieConsent · ModalProvider
     └─ app/page.tsx → 14 section components
```

- **Scaling:** `html { font-size: 1vw }`, every token `calc(<design-px> × var(--u))`,
  design canvas 1600 desktop / 416 below 992. **Verified identical to production.**
- **Motion:** GSAP + ScrollTrigger, plus several bespoke rAF scroll handlers
  (`Hero`, `PageCanvas`) that write CSS custom properties rather than re-rendering React.
- **Text reveal:** own `SplitReveal` / `Reveal` — production uses GSAP `SplitText` (paid).
  Functionally equivalent.
- **Substitutions:** Barba → Next routing; Webflow runtime + jQuery → dropped entirely.

### One notable divergence in approach

`PageCanvas` invents a mechanism production does not have: a fixed gradient layer that
dissolves between section colours over a 20 vh band. Production instead swaps discrete
`theme_on-*` classes per section (`initThemeChange`, `[data-theme]`). The invention is
defensible in principle — but see **D2**, where it is currently painting the wrong colour
across ~18 % of the page.

---

## C. Section-by-section comparison

Measured at 1440×900. Production document height **24 605 px**; local **24 719 px**
(+0.46 %). Section alignment is genuinely close — maximum drift 114 px over 24 600 px.

| Section | Production (top / h) | Webflow extraction (class) | React (top / h) | Main difference |
| --- | --- | --- | --- | --- |
| Hero | 0 / 5220 (pin area) | `.hero-w` + `.hero-scroll-area` | 0 / 5220 | **Match.** Copy travel −80 vh, render parallax −44 vh, zoom → 2×, all confirmed correct. Zoom origin differs in expression only. |
| Benefits intro | 3600 / 720 | `.benefits-intro-w` | 3600 / 720 | **Match** in box. `wordSpacing 0 → 10rem` on the curved text is the production mechanism — verify ours matches. Arch crown reads slightly wider locally. |
| Benefits | 4320 / 900 | `.benefits-w` | 4320 / 865 | −35 px height. Close. |
| Quote | 5220 / 1080 | `.quote-w` | 5185 / 1080 | **Match.** |
| **Concept** | **6300 / 4514** | `.loc-scroll-area` wrapping `.loc-info-w` + `.loc-intro-w` + `.loc-path-w` | 6265 / 4614 | **Two P0s here.** Ground is cream `#f3f3ec` in production, plum/powder locally. Horizontal track sits a uniform **427 px** too far left at matched scroll. |
| Master plan | 10814 / 1260 | `.loc-w` | 10879 / 1260 | **Match.** Aerial and clouds read correctly. |
| Apartment types | 12074 / 900 | `.apart-type-w` | 12139 / 915 | Right-hand spec column (bedrooms / area / Explore) missing; title wraps to two lines. |
| Apartment intro | 12974 / 855 | `.apart-info-w` | 13054 / 819 | Close. |
| Amenities | 13829 / 2970 | `.amen-scroll-area` | 13873 / 2970 | **Height matches exactly.** Tab column 151 px too far right; body copy block 706 px wide vs 399. |
| Interiors | 15179 / 2979 | `.interior-w` | 15223 / 3048 | +69 px. Overlaps the amenities pin area by 1620 px in both — the overlap is reproduced. |
| **Architecture** | **18158 / 3379** | `.arch-scroll-area` | 18270 / 3375 | **P0.** Production shows *one* render through *two* opening clip-path shutters. Local shows *two different photos* side by side, no clip-path. |
| Project facts | 21538 / 818 | `.other-w` | 21645 / 819 | **Match** in box; type reads smaller locally. |
| **CTA** | **22356 / 1579** | `.cta-w` | 22464 / 1355 | **−224 px.** Render is 1440×2211 in production, 1440×1355 locally — a different crop, not just a different size. |
| Footer | 23705 / 900 | `.footer-w` | 23819 / 900 | Clip is `inset(4.55% 0 0)` locally vs `inset(8% 22% 8% 22%)` in production — the side squeeze is missing. |

---

## D. The 15 biggest remaining differences, ranked

### P0 — major visual mismatch

**D1 · Display and accent typefaces are substituted, and the substitution cascades.**
Production uses `ambroise-francois-std` (display) and `sloop-script-three` (accent) from
Typekit kit `pig8glj`. The React build uses **Bodoni Moda** and **Pinyon Script** with
`transform: scaleX(0.53)` / `scaleX(0.82)` to fake the proportions, plus a `.fit` utility
that widens the layout box by `1/squeeze` and pulls it back with negative margins.

Every size token already matches production **exactly** — h1 172.8, h2 122.4, h3 86.4,
h4 56.7, h5 36, h6 25.2, a1 172.8, a2 108, c1 22.5, p1 11.7, p2 9.9, l1 9.9, l2 8.1 px.
The *only* typographic difference is the family. But because `scaleX` is a paint-time
transform, it is upstream of at least five separate defects measured elsewhere in this
document:

- Architecture wordmark paints **630–717 px wide** against production's **1015–1354 px**.
- CTA headline paints 717 px vs 806 px.
- Concept lead wraps to **4 lines** where production takes **3** (both 806 px measures).
- "Between Marbella and Estepona" wraps to **3 lines** in a 210 px box vs 1 line in 396 px.
- The `.fit` negative-margin hack has already caused two separate override bugs
  (documented in `final-visual-differences.md`), and will cause more.

Both faces are reachable: `https://use.typekit.net/pig8glj.css` returns **200** with the
`@font-face` blocks in the clear, and the woff2 files return **200 / 20 004 B** from
`localhost` with no `Referer` check. `Maison Neue Extended` is already byte-identical to
production. **Fixing this deletes `--display-squeeze`, `--accent-squeeze` and `.fit`
entirely** and removes seven unnecessary webfont downloads (Bodoni ×3, Pinyon, Archivo ×2).

*One caveat, stated once:* Adobe scopes a Typekit kit to registered domains. Linking
`pig8glj` is exactly what production does, but whether to do so from another origin is the
site owner's licensing call, not a technical one. Say the word and I'll wire it up.

**D2 · The Concept section's ground is the wrong colour for ~4 500 px of scroll.**
Sampled at y = 6400 / 7200 / 8000, at four points each: production paints
`rgb(243,243,236)` — cream — at every point. Local paints `rgb(52,12,36)` (plum, declared)
under a powder-sky `PageCanvas` gradient. This is one continuous stretch of ~5 screens,
about 18 % of the page, reading as an entirely different palette from the reference.

**D3 · The Concept horizontal track is a uniform 427 px behind production.**
At y = 7200 the offset is the same for every element on the track:

| Element | Production x | React x | Δ |
| --- | ---: | ---: | ---: |
| "Era Residences is a boutique gated…" | −190 | −618 | −428 |
| "Inspired by the atmosphere…" | 83 | −344 | −427 |
| SPAIN | 1026 | 714 | −312 |
| NEW GOLDEN MILE | 1163 | 736 | −427 |
| BETWEEN MARBELLA AND ESTEPONA | 2121 | 1693 | −428 |
| THE COAST YOU WANTED | 2927 | 2500 | −427 |

A *uniform* offset means this is a single mapping error, not fourteen layout problems —
fix it once and the whole 4 500 px sequence realigns. Production's mapping, recovered
verbatim: area height = `track.scrollWidth`, `x → -(scrollWidth − areaWidth)`, ScrollTrigger
`start:"2.5% top"`, `end:"97.5% bottom"`, `scrub:0.25`, ease **`horScroll` =
`cubic-bezier(0.25,0,0.75,1)`**. The eased mapping plus the 2.5 % / 97.5 % inset accounts
for the sign and rough magnitude of the drift; a linear map runs ahead in exactly this way.

**D4 · The Architecture arch is structurally different.**
Production: **one** render (`img_cam_02.webp`, 1080×1184 at 1440 wide) seen through **two
clip-path shutters** (`arch-intro-s_bg_l` spanning 0–721, `_r` spanning 720–1440) that
open from `44.444%…98.889%` / `1.111%…55.556%` outward until they meet, while the whole
intro scales `1 → 1.84`. React: **two different photographs** side by side
(`architecture-hero.webp` + `terrace.webp`), each ~862–1295 px wide, with **no clip-path
at any scroll position** and no scale-up.

This is the page's signature architectural moment and the one place where the composition,
not merely the tuning, is wrong. The exact polygon values are recovered verbatim in
`webflow-recovery.md` §5.

### P1 — clearly visible mismatch

**D5 · CTA render is the wrong crop and 224 px short.** Production serves the CTA image at
**1440 × 2211** (aspect 0.651, a tall portrait crop that parallaxes); React serves
**1440 × 1355** (aspect 1.063). Section height 1579 vs 1355. The full-resolution original
(`img_cta_1920.webp`, 1920×2400) is in `/rs`; the local `cta-sea-views.webp` is a
re-encoded 1600×2000 crop.

**D6 · Amenities body-copy block is 1.77× too wide and 270 px too far left.**
Production: heading + copy at **x 313, w 399**. React: **x 43, w 706**.

**D7 · Amenities tab column sits flush to the gutter.** Production: x 1001, w 259, right
edge 1260 — inset one grid column from the page gutter. React: x 1152, w 245, right edge
1397 — flush. Row pitch (36 px) and vertical axis are already correct.

**D8 · Apartment-type card is missing its right-hand spec column.** Production places
bedrooms / "area up to" / the *Explore ground + basement* button to the right of the card
image; the display title then fits on one line. React omits the column, and the title
wraps to two lines and pushes the pagination down.

**D9 · Concept panel is missing the "THE CONCEPT" kicker** (l1, 9.9 px, at x 126 y 354 in
production) and the panel's internal alignment differs.

**D10 · Concept title lines over-drift and collide.** Production counter-drifts the three
lines `xPercent: wrap([-5,25,-15]) → wrap([5,-25,25])` at `scrub:.25`. At y = 10000 the
local lines overlap each other legibly ("THE COAS" / "AST YOU ANTE"); production's stay
separated.

**D11 · Architecture wordmark does not climb or grow.** Production's "ARCHITECTURE" moves
y 32 → 37 → −198 and grows 1015 → 1354 px painted across y 18600–20200, riding the
`scale 1 → 1.84`. React's stays at y 86–267 and 630 → 717 px. Partly D1, partly the
missing scale-up from D4.

### P2 — moderate

**D12 · Footer clip is missing its horizontal squeeze.** Production animates
`[data-footer-clip]` to `inset(8% 22% 8% 22%)` (desktop) — insetting **all four** sides so
the footer reads as a card pulling inward. React applies `inset(4.55% 0% 0%)` — top only.

**D13 · Route-path draw-on may not be reproducing production's timing.** Production draws
`.img.loc-path` with `clipPath: inset(0% 100% 0% 0%) → inset(0)` over a **timed 2.4 s**
(`2 × durL`), ease `Out`, `delay 0.8`, `once: true`, triggered through
`containerAnimation` on the horizontal tween at `start:"left bottom"`. It is deliberately
*not* scrubbed — worth confirming ours matches, because a scrubbed version reads
completely differently.

**D14 · Stagger constant differs.** Production `stagger = 0.1` throughout;
`lib/motion.ts` uses `step = 0.045, max = 0.6`. Also `EASE.inOut` is
`[0.76,0,0.24,1]` against production's `0.75,0,0.25,1`. The `inOut` delta is invisible;
the stagger is not, on long split-text lines.

### P3 — polish

**D15 · Duplicate and re-encoded assets.** `interior-terrace.webp` (790 340 B) is a
re-encode of the identical 1600×2003 crop already present, byte-exact, as
`terrace.webp` (721 096 B). Above 1600 px viewport width production serves 1920-wide
originals that the repo does not carry. Both are available in `/rs`.

---

## E. What the React implementation already gets right

Worth stating plainly, because it constrains what should be touched:

- **Document height within 0.46 %** (24 719 vs 24 605) and **every section top within
  114 px** across 24 600 px of scroll.
- **Every typographic size token is exact** — all 13, at both breakpoints.
- **The `1vw` root sizing and the 1600/416 dual design canvas** are reproduced verbatim.
- **The hero choreography is correct.** Production's `.hero-w_bg` is 1296 px tall at
  1440 wide, giving copy travel `−(1.25·1296 − 900) = −720 px = −80 vh` and render
  parallax `−(1296 − 900) = −396 px = −44 vh`, over a 5220 px = **5.8-screen** pin.
  `lib/heroCurves.ts` independently measured `COPY_TRAVEL_VH −0.8`, `PARALLAX_VH −0.4444`,
  `HERO_SCREENS 5.8`, `ZOOM_TO 2`. Those are not approximations — they are exact.
- **Amenities pin height is exact** (2970 px), and the Interiors/Amenities 1620 px overlap
  is reproduced.
- **39 of 49 shipped assets are byte-identical to the production originals.** The 10 that
  are not are either absent from the mirror (videos, Lottie, fonts — all verified correct
  by other means) or deliberate re-encodes.
- **No console errors, no horizontal overflow** at 1440×900.

---

## F. Recommended implementation order

Ordered so that each step removes the cause of later symptoms rather than their effects.

| # | Work | Fixes | Why here |
| --- | --- | --- | --- |
| 1 | **Load the real Typekit kit; delete `--display-squeeze`, `--accent-squeeze`, `.fit`** | D1, and the type-metric half of D5, D9, D11 | Upstream of five other defects. Every size token is already right, so this is a swap, not a re-tune. Needs your go-ahead on the licensing question first. |
| 2 | **Concept ground → cream `#f3f3ec`** | D2 | One token across ~18 % of the page. Cheapest large win. |
| 3 | **Concept track mapping → `horScroll` ease + 2.5 %/97.5 % insets** | D3, and most of D10 | One mapping error; realigns 4 500 px of scroll at a stroke. |
| 4 | **Architecture: one render, two clip-path shutters, `scale 1 → 1.84`** | D4, D11 | The only genuinely structural rebuild. Polygon values are recovered verbatim. |
| 5 | CTA render crop → 1440×2211 from the 1920-wide original; restore 1579 px height | D5, D15 | |
| 6 | Amenities copy block → x 313 / w 399; tab column → x 1001 / w 259 | D6, D7 | |
| 7 | Apartment-type spec column | D8 | |
| 8 | Concept kicker; verify route-path draw-on is timed, not scrubbed | D9, D13 | |
| 9 | Footer clip → `inset(8% 22% 8% 22%)` / `inset(4% 32% 4% 32%)` | D12 | |
| 10 | `stagger` 0.045 → 0.1; `inOut` → `0.75,0,0.25,1` | D14 | |
| 11 | Dedupe `interior-terrace.webp`; pull 1920-wide originals for >1600 px viewports | D15 | |

### On the animation, explicitly

Per the brief, the working scroll-driven motion stays. Of the fifteen differences:

- **Eleven are visual state** — colour, crop, measure, position, type family, z-order.
  Fix in CSS and markup; touch no animation code.
- **Three are mapping or configuration, not mechanics** — D3 (ease + trigger insets on an
  existing tween), D14 (two constants), D13 (verify a duration). These change *numbers fed
  to* the existing animation, not the animation itself.
- **One is genuinely structural** — D4. The Architecture arch cannot be reached from the
  current markup by CSS alone: production masks a single image with two animated
  `clip-path` polygons, and the React version renders two separate images with no mask.
  There is no CSS-only path from "two photos side by side" to "one photo behind two
  opening shutters", because the second image must stop existing. This is the only place
  where I would propose writing new animation code, and the exact target values are
  already recovered.

No other animation rewrite is warranted by the evidence.

---

## G. Evidence

- Matched-scroll screenshot pairs at 20 positions (0 → 23 900), production above local,
  captured this session in the scratchpad.
- Geometry, typography and background probes reproduced by the scripts described in
  §Method; the temporary probe scripts were removed after use so the tree is unchanged.
- Motion constants and clip-path values transcribed verbatim from
  `reference-download/js/custom-main.js` — see `webflow-recovery.md` §3 and §5.
- **Nothing under `/webflow`, `/rs` or `/Front_end_website` was modified.**
