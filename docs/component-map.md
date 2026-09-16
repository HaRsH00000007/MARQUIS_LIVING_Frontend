# Component Map

Reference section → React component → responsibility.

```
app/layout.tsx
  └─ <SmoothScrollProvider>            Lenis + GSAP ScrollTrigger wiring
       ├─ <Preloader />                arch wipe on first load
       ├─ <Header />                   fixed nav, rotating badge, mobile menu
       ├─ <ScrollRail />               left progress rail + 00–99 counter
       ├─ app/page.tsx  (sections)
       ├─ <CookieConsent />
       ├─ <BookCallModal />            driven by useModal()
       └─ <FloatingTip />              hero hotspot cards
```

## Sections

| # | Reference section | Component | Responsibility |
| --- | --- | --- | --- |
| 0 | Hero | `sections/Hero.tsx` | Day/night render cross-fade, split-reveal wordmark, hotspot pins, CTA pill, parallax scroll area |
| 1 | Benefits intro | `sections/BenefitsIntro.tsx` | Arch top edge, `COSTA ✳ DEL SOL` lockup, curved `textPath` headline |
| 2 | Benefits slider | `sections/Benefits.tsx` | 3-slide slider (title / image / copy / kicker) driven by `useSlider` |
| 3 | Quote | `sections/Quote.tsx` | Plum card over an alpha-cut pool render, red rule, author block |
| 4 | Concept + Location | `sections/Concept.tsx` | Pinned horizontal track, 3 panels, flower video bleed |
| 5 | Master plan | `sections/MasterPlan.tsx` | Site plan, 3 cloud marquees, clip-path decor, mobile drag-pan |
| 6 | Apartment types | `sections/ApartmentTypes.tsx` | 3 typed cards + shared pagination |
| 7 | Apartment intro | `sections/ApartmentIntro.tsx` | Centred lead copy, ERA mark, flower video |
| 8 | Amenities | `sections/Amenities.tsx` | Pinned scroll-driven tabs, cross-fading images, underline rail |
| 9 | Interiors | `sections/Interiors.tsx` | Arch edge, char-split title + script accent, 2-col feature, 4-slide gallery |
| 10 | Architecture | `sections/Architecture.tsx` | Pinned intro with flanking videos, rising plum panel, credits, circular CTA |
| 11 | Project facts | `sections/ProjectFacts.tsx` | 4 fact rows, partner logo |
| 12 | CTA | `sections/CallToAction.tsx` | Char-split headline over a render, `c1` kicker, circular button |
| 13 | Footer | `sections/Footer.tsx` | To-top, mark, contact, address, legal, Lottie credits |

## UI primitives (`components/ui/`)

| Component | Reference counterpart | Notes |
| --- | --- | --- |
| `SplitReveal` | `[data-scroll-reveal]` + SplitText | Splits into words or chars, mask-reveals on viewport entry |
| `LineReveal` | `.split-line-mask` / `.split-line` | Line-masked copy reveal |
| `ButtonPill` | `[hover-btn]` | Label + background wiping up from `100% → 0%`, radius `100% → 0` |
| `ButtonCircle` | `.btn-circle` | Circular CTA with rotating label ring |
| `NavItem` | `[hover-nav-item-l2]` | Two stacked labels sliding on hover |
| `Pagination` | `.pag` | `‹ index —— total ›` with an animated progress rule |
| `ImageCard` | `[hover-img-card]` | `scale(1 → 1.15)` inside `overflow:hidden` |
| `Pin` | `.pin` | Hotspot dot with two offset pulse rings |
| `Marquee` | `.marquee` | Infinite horizontal track, duplicated list |
| `FlowerVideo` | `.flower video` | Lazy alpha `.webm` with `.avif` poster |
| `Divider`, `Spacer`, `EraMark`, `Icon` | `.divider`, `.u-*`, `.logo`, `.ico-*` | Token-driven primitives |

## Hooks (`hooks/`)

| Hook | Purpose |
| --- | --- |
| `useLenis` | Creates the Lenis instance, drives it from GSAP's ticker, exposes it via context |
| `useScrollReveal` | Wraps the shared IntersectionObserver used by `SplitReveal` / `LineReveal` |
| `useSlider` | Index state + next/prev/goto + progress fraction, shared by all three sliders |
| `useHorizontalPin` | ScrollTrigger pin that maps vertical scroll to `x` on a track |
| `useScrollTabs` | Maps pinned scroll progress to a discrete active index (amenities) |
| `useMediaQuery` | `min-width: 992px` desktop gate for hover-only behaviour |
| `useDragPan` | Pointer-drag panning for the mobile master plan |

## Data (`lib/`)

| File | Contents |
| --- | --- |
| `content.ts` | Every string and image reference, typed — mirrors the Webflow collections (benefits, apartment types, amenities, gallery, project facts, contact, legal, hero pins) |
| `motion.ts` | Duration + cubic-bezier easing constants matching the reference tokens |
| `gsap.ts` | Single registration point for GSAP plugins (client-only) |

## Styles (`styles/`)

| File | Contents |
| --- | --- |
| `tokens.css` | `html{font-size:1vw}`, the `--scale-ratio` system, colour/size/motion variables, `theme_*` classes |
| `typography.css` | `.h1`–`.h6`, `.a1`/`.a2`, `.c1`, `.p1`/`.p2`, `.l1`/`.l2` |
| `components.css` | Hover custom-property system (`[hover-btn]`, `[hover-nav-item-l2]`, …), arch/clip helpers, grid utilities |
