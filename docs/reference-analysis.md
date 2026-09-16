# Reference Analysis — era-residence.com

**Captured:** 2026-09-09 · **Reference:** https://www.era-residence.com/
**Primary source of truth:** live Chrome rendering (Playwright-driven, real Chrome binary).
**Secondary:** `curl` snapshot in `/reference-download`.

> The Claude-in-Chrome extension was not connected in this environment, so browser
> observation was performed by driving the **installed Chrome binary** through
> `playwright-core` (no bundled browser download). Same engine, same rendering —
> scripted rather than interactive.

---

## 1. Platform & stack (observed)

| Layer | Finding |
| --- | --- |
| CMS / builder | **Webflow** (`data-wf-site`, `w-dyn-list` collection lists) |
| Smooth scroll | **Lenis 1.3.21** |
| Animation | **GSAP 3.15** + `ScrollTrigger`, `SplitText`, `CustomEase` |
| Page transitions | **Barba.js 2.10.3** (`data-barba="wrapper"`) |
| Vector animation | **lottie-web 5.12.2** (footer credits logo only) |
| Custom code | External module on `assets.slater.app` (~59 KB minified) |
| Fonts | Adobe Typekit kit `pig8glj` → `ambroise-francois-std`, `sloop-script-three`; self-hosted `Maison Neue Extended` (Book 400 / Bold 700) |
| Analytics | GTM, GA4, Meta Pixel — **not reproduced** |

---

## 2. Design system (extracted from the live stylesheet)

### Fluid scaling mechanism

```css
html { font-size: 1vw; }          /* 1rem === 1vw at every width      */
--scale-ratio: 16;                /* desktop: design canvas = 1600px  */
--scale-ratio: 4.16;              /* <=991px: design canvas = 416px   */
--h1--size: calc(192rem / var(--scale-ratio));   /* = 12vw            */
```

Every size token is `calc(<px-at-design-width>rem / <scale-ratio>)`. Because `1rem = 1vw`,
the whole page scales linearly with viewport width, with **one hard breakpoint at 991px**
where the design canvas switches from 1600px to 416px.

Additional Webflow breakpoints: `767px`, `479px` (minor adjustments only).

Verified computed `h1` sizes: 1920 → 230.4px · 1440 → 172.8px · 1366 → 163.9px ·
1024 → 122.9px · 768 → 177.2px · 390 → 90px. (The jump at 768 is the canvas switch.)

### Colour tokens

| Token | Value | Use |
| --- | --- | --- |
| `base-1000` | `#17233b` | Deep navy — default ink |
| `base-0` | `#f3f3ec` | Cream — default page background |
| `brand / velvet-plum` | `#340c24` | Dark section background |
| `brand / powder-sky` | `#b5cedb` | Pale blue section background |
| `brand / blush-bloom` | `#f8bbcb` | Accent (rare) |
| `white` | `#ffffff` | On-image text |

Opacity ramps exist at 80 / 60 / 40 / 30 / 20 / 10 / 5 / 0 % for each.

**Theme classes** remap the same variable names, so any component inherits correctly:
`theme_on-color` (velvet plum bg, cream ink) · `theme_on-brand` (powder sky bg, navy ink)
· `theme_on-dark` (plum bg, cream ink) · `theme_on-light` (cream bg, navy ink).

### Typography scale (px at 1600px design width → mobile at 416px)

| Style | Family | Desktop | Mobile | LH | Tracking |
| --- | --- | --- | --- | --- | --- |
| `h1` | display | 192 | 96 | 87.5% | −0.024em |
| `h2` | display | 136 | 73 | 88.2% | −0.024em |
| `h3` | display | 96 | 56 | 91.7% | −0.024em |
| `h4` | display | 63 | 40 | 88.9% | −0.016em |
| `h5` | display | 40 | 28 | 100% | −0.008em |
| `h6` | display | 28 | 28 | 100% | 0 |
| `a1` | accent script | 192 | 96 | 100% | 0 |
| `a2` | accent script | 120 | 72 | 100% | 0 |
| `c1` | display | 25 | 19 | 112% | **0.8em** |
| `p1` | body | 13 | 13 | 138.5% | −0.024em |
| `p2` | body | 11 | 11 | 145.5% | −0.024em |
| `l1` | body 700 | 11 | 11 | 145.5% | 0.048em |
| `l2` | body 700 | 9 | 9 | 133.3% | **0.32em** |

### Spacing

Utility spacers `u-4 … u-272` map to the token ladder and **shrink below 992px**
(`u-96 → 64`, `u-160 → 96`, `u-272 → 120`). Page gutters: `48` desktop / `24` mobile.
Grid gap `16`. Grid cell: `136` horizontal, `96` vertical (desktop).

### Motion tokens

```css
--dur-s: .4s;  --dur-m: .8s;  --dur-l: 1.2s;
--ease-in-out: cubic-bezier(.76,0,.24,1);
--ease-out:    cubic-bezier(.25,1,.5,1);
--ease-in:     cubic-bezier(.5,0,.75,0);
--ease:        cubic-bezier(.25,.1,.25,1);
```

Hover behaviour is implemented as **attribute-scoped CSS custom properties**
(`[hover-btn]`, `[hover-nav-item-l2]`, `[hover-img-card]`, `[hover-social]`,
`[data-hover-group]`) — all hovers gated behind `@media (min-width: 992px)`.

---

## 3. Section inventory (top → bottom, measured at 1440x900)

Total document height ≈ **21 670 px** (≈ 24 viewport screens).

| # | Class | Top | Height | BG | Contents & behaviour |
| --- | --- | --- | --- | --- | --- |
| — | `header-nav` (fixed) | — | — | transparent | Rotating ERA badge (left); `Select an Apartment` link + `Book a call` / `Contact` (right); `Menu` toggle on mobile. Ink colour inverts per section theme. |
| — | `s-bar` (fixed, left) | — | — | — | Scroll-progress rail with a numeric thumb (`00`–`99`) and a `Scroll ↓` label. |
| 0 | `section clip theme_on-color` | 0 | 5220 | plum | **Hero.** `ERA / RESIDENCE` display + `Estepona` script. `A PLACE · by day ⇄ by night · TO RETURN TO`. Full-bleed day/night render cross-fade, pulsing hotspot pins opening floating tips, CTA pill. Long scroll area (≈5.8 screens) parallaxing the render. |
| 1 | `section arch clip theme_on-brand` | 3600 | 720 | powder sky | **Benefits intro.** Top edge is a giant *arch* (huge top border-radius) rising over the hero. `COSTA ✳ DEL SOL`, vertical rule, `A PLACE TO LIVE — TO RETURN YEAR AFTER YEAR`, then `Three reasons to choose Era` on a curved SVG `textPath`. |
| 2 | `section z-2 theme_on-brand` | 4320 | 900 | powder sky | **Benefits slider.** 3 slides: giant `h1` title, framed image, body copy, kicker. Pagination `‹ 1 —— 3 ›` with an animated progress rule. |
| 3 | `section z-2 theme_on-brand` | 5220 | 1080 | powder sky | **Quote.** Plum card over a pool render with an alpha-cut foreground; red rule, `h5` pull-quote, author block. |
| 4 | `section clip` | 6300 | 4514 | cream | **Concept / Location — pinned horizontal scroll.** Three panels ride a horizontal track pinned for ~4.5 screens: *The Concept* → *New Golden Mile* → *Location path*. Looping bougainvillea `.webm` clips with alpha bleed into each panel. |
| 5 | `section clip theme_on-color` | 10814 | 1260 | plum | **Master plan.** Site-plan render, three independent cloud marquees at different speeds, a clip-path trapezoid `loc-w_decor`, description column. Mobile swaps to a "Drag to see more" pannable plan. |
| 6 | `section theme_on-brand` | 12074 | 900 | powder sky | **Apartment types.** 3 cards (Ground + Basement / Ground floor / Penthouse duplex): bedrooms · area · copy · CTA. Slider with the shared `pag` control. |
| 7 | `section clip theme_on-brand` | 12974 | 855 | powder sky | **Apartment intro copy** + ERA mark; bougainvillea video bottom-right. |
| 8 | `section clip theme_on-color` | 13829 | 2970* | plum | **Amenities.** Pinned tab-scroller: 5 amenities (Gated community, Swimming pool, Parking, Spa & gym, Landscaping). Scroll advances the active tab; the underline rail tracks it; images cross-fade. |
| 9 | `section arch clip` | 15179 | 2979 | cream | **Interiors.** Arch top edge. `THE SPACE TO` (display, char-split) + `Live in` (script). Two-column image + copy, then a 4-slide gallery with `pag`. |
| 10 | `section clip` | 18158 | 3379 | cream→plum | **Architecture.** Pinned intro with two flanking bougainvillea videos, then a plum panel rising over a render: `ARCHITECTURE` char-split title, pull-quote, credits (Schiemann Weyers / OCWA), circular CTA. |
| 11 | `section clip` | 21538 | 818 | cream | **Project facts.** 4 items: Developer, Sales & Marketing (Unreal Estate logo), License obtained, 2026 status. |
| 12 | `section theme_on-color` | 22356 | 1579 | plum | **CTA.** `PERFECT / SEA VIEWS` char-split over a rooftop render; `FROM ROOFTOP TERRACES` in `c1` (0.8em tracking); circular `VIEW AVAILABLE APARTMENTS` button. |
| 13 | `section theme_on-dark` | 23705 | 900 | plum | **Footer.** `TO TOP ↑`, ERA mark, phone, sales-office address, legal links, Lottie credits logo. |

\* pinned — occupies more scroll distance than its rendered height.

---

## 4. Animation catalogue

| Trigger | Elements | Behaviour |
| --- | --- | --- |
| Page load | `.transition-wrapper` | Barba preloader: arch mask wipes open, hero content staggers in. |
| Scroll (Lenis) | whole page | Smoothed/lerped scrolling — every ScrollTrigger reads from it. |
| `data-scroll-reveal="h"` | headings | SplitText → `.split-word` / `.split-char`; stagger up + fade out of a clipping mask. |
| `data-scroll-reveal="a"` | script accents | Same, slower; the script "writes on" with `--ease-write`. |
| `.split-line-mask` / `.split-line` | body copy, labels | Line-masked reveal, `y: 100% → 0`, staggered. |
| Pinned horizontal | `.loc-scroll-area_track` | `x: 0 → −(track − vw)` while the section is pinned. |
| Pinned tabs | `.amen-scroll-area` | Scroll drives the active amenity index; tab underline + image cross-fade. |
| Pinned reveal | `.arch-scroll-area` | Intro holds, then the plum panel slides up over the render. |
| Parallax | hero render, section images | `y` offset ≈ 10–20 % of the scroll distance. |
| Marquee | `.marquee_track` (clouds x3) | Infinite `x` translate at three different speeds. |
| Loop | `.flower video` | 7 bougainvillea `.webm` clips — autoplay / muted / loop, alpha channel. |
| Pulse | `.pin_bg_pulse` | Two offset expanding rings behind each hotspot. |
| Continuous | header badge | Slow `rotate` on the circular `ERA · RESIDENCE` lockup. |
| Scroll | `.s-bar` | Thumb position + `00–99` counter track scroll progress. |
| Hover (≥992px) | buttons | Background wipes up `100% → 0%`, radius `100% → 0%`, label colour inverts. |
| Hover (≥992px) | nav items | Two stacked labels slide `0 → −100%` / `100% → 0`. |
| Hover (≥992px) | image cards | `scale(1 → 1.15)` over `1.2s`. |
| Hover (≥992px) | list groups | Non-hovered siblings drop to `opacity .2`. |

---

## 5. Interactions

- Hero **by day / by night** tabs cross-fade two full-bleed renders.
- Hero **hotspot pins** open floating tip cards (`floating-tip-trigger`).
- **Sliders** (benefits, apartment types, interior gallery) — prev/next, progress rule, index.
- **Amenity tabs** — clickable *and* scroll-driven.
- **Book a call** modal CTA (`data-modal-cta-btn`).
- **Cookie consent** card (accept / decline).
- Mobile **Menu / Close** toggle with a 3-dot icon.
- Footer **To top** smooth-scroll.
- Master plan is **drag-pannable** on mobile.

---

## 6. Responsive behaviour

| Width | Observed |
| --- | --- |
| ≥992px | 1600px design canvas; all hovers live; horizontal-pin sections active; `.b-desk` shown. |
| ≤991px | 416px design canvas (tokens roughly halve relative to width); gutters 48→24; `.b-mob` shown, `.b-desk` hidden; `100vh → 100svh`; hovers disabled; pinned sections degrade to vertical stacks; plan becomes drag-pannable. |
| ≤767 / ≤479 | Minor grid and spacing adjustments only. |
