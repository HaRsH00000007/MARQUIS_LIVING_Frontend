# Network / Asset Discovery

Captured by driving real Chrome (Playwright) at 1440x900, scrolling the full document
so lazy-loaded and in-viewport-triggered requests all fire.
Raw log: `docs/net-home.json` (93 responses).

## Request breakdown

| Category | Count | Notes |
| --- | --- | --- |
| Images (`webp` / `avif` / `png` / `svg`) | 33 | Webflow CDN, several served as `-p-1600` responsive variants |
| Video (`webm`) | 7 | `assets.era-residence.com/flowers/` — alpha-channel bougainvillea loops |
| Fonts (`woff2`) | 4 | 2 self-hosted (Maison Neue Ext), 2 from Typekit |
| Stylesheets | 2 | Webflow bundle (128 KB), Lenis |
| Scripts | 11 | jQuery, Webflow, GSAP x4, Lenis, Lottie, Barba, Slater custom |
| Analytics / pixels | 6 | GTM, GA4, Meta — excluded from the recreation |

## Loading strategy observed

**Above the fold (eager, in `<head>` or first paint)**
- `css/era-residence.webflow.shared.*.min.css`
- Typekit loader `use.typekit.net/pig8glj.js` (blocking `<script>`)
- `preloader_bg.svg`, `landscape.svg` — preloader artwork
- `hero-day.webp`, `hero-night.webp` — both hero renders load immediately (the day/night
  tab must cross-fade with no flash)

**Lazy / on-scroll**
- Every section image below the hero (`loading="lazy"` + Webflow `srcset`)
- The 7 `.webm` flower clips — requested as the owning section approaches the viewport;
  each is preceded by an `.avif` poster frame of the same clip
- `credits-logo.json` (754 KB Lottie) — fetched by XHR only when the footer nears view

**Responsive images**
Webflow emits `srcset` with `-p-500 / -p-800 / -p-1080 / -p-1600` derivatives.
At 1440px the `-p-1600` variant is chosen for most content images; the master plan and
the two large PNGs are served at full size.

**Background images**
All `linear-gradient(...)` overlays (`.img-over-grad`) are CSS-generated, not files.

## Critical visual assets

| Asset | Why critical |
| --- | --- |
| `hero-day.webp` / `hero-night.webp` | Hero — LCP candidate, both needed at once |
| `location-master-plan.webp` | Master-plan section is built around it |
| `architecture-hero.webp` | Architecture reveal background |
| `cta-sea-views.png` | Final CTA background |
| `maisonneueext-book/bold.woff2` | All UI text |
| Typekit `ambroise-francois-std`, `sloop-script-three` | All display + script type |

## Decorative / non-blocking

Cloud marquee AVIFs, the 7 flower `.webm` loops, `preloader-*.svg`,
`location-path*.svg`, `unreal-estate-logo.svg`, the Lottie credits mark.

## Third-party endpoints (not reproduced)

`googletagmanager.com` · `google-analytics.com` · `connect.facebook.net` ·
`assets.slater.app` (the site's own custom-JS host) · `p.typekit.net` (font analytics).
