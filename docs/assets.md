# Asset Inventory

All assets were downloaded from publicly accessible URLs observed in the browser network
log, renamed meaningfully, and organised under `/public`. The raw `curl` snapshot stays
separate in `/reference-download` and is **not** part of the built application.

```
public/
  favicon.png
  fonts/     Maison Neue Extended (Book 400, Bold 700)
  icons/     ERA mark, arrows, location path, partner logos, preloader art
  images/    renders, plans, cloud sprites, flower poster frames
  lottie/    footer credits animation
  videos/    7 alpha-channel bougainvillea loops
```

## Font licensing — read before deploying

| Family | Role | Status |
| --- | --- | --- |
| `ambroise-francois-std` | Display (h1–h6) | **Adobe Fonts / Typekit.** The client confirmed the project is licensed for kit `pig8glj`, so the kit stylesheet is linked from `app/layout.tsx` exactly as the reference links it. Nothing is redistributed — the fonts are served by Adobe. |
| `sloop-script-three` | Accent script (`Estepona`, `Live in`, `yours`) | **Adobe Fonts / Typekit.** Same kit, same arrangement. |
| `Maison Neue Extended` | Body / labels | Self-hosted by the reference site and publicly fetchable. Downloaded and used locally for fidelity, **but it is a commercial licence** — a real deployment must either buy it or swap in the bundled fallback (`Archivo` at expanded width, already wired into the font stack). |

The substitutions were the single largest known visual difference from the reference. They
were removed in Round 4 (2026-09-11) once the kit licence was confirmed — along with the
`--display-squeeze` / `--accent-squeeze` calibration and the `.fit` utility that existed
only to compensate for them. See `round-4-three-source-pass.md`.

If the licence ever lapses, reverting is a one-file change: drop the `<link>` in
`app/layout.tsx` and point `--font-display` / `--font-accent` in `styles/tokens.css` at
free stand-ins. The layout is measured against the real metrics now, so a substitute would
need its own calibration again.

## Image assets

| Local file | Type | Size | Section / purpose | Origin |
| --- | --- | --- | --- | --- |
| `public/fonts/maisonneueext-bold.woff2` | woff2 | 46 KB | Global typography | `cdn.prod.website-files.com` |
| `public/fonts/maisonneueext-book.woff2` | woff2 | 45 KB | Global typography | `cdn.prod.website-files.com` |
| `public/icons/preloader-bg.svg` | svg | 23 KB | Preloader | `cdn.prod.website-files.com` |
| `public/icons/landscape.svg` | svg | 23 KB | Preloader | `cdn.prod.website-files.com` |
| `public/icons/location-path-labels.svg` | svg | 25 KB | Location path panel | `cdn.prod.website-files.com` |
| `public/icons/location-path.svg` | svg | 70 KB | Location path panel | `cdn.prod.website-files.com` |
| `public/icons/preloader-arch.svg` | svg | 0 KB | Preloader | `cdn.prod.website-files.com` |
| `public/icons/unreal-estate-logo.svg` | svg | 15 KB | Project facts | `cdn.prod.website-files.com` |
| `public/images/amenity-gated-community.webp` | webp | 263 KB | Amenities | `cdn.prod.website-files.com` |
| `public/images/amenity-landscaping.webp` | webp | 697 KB | Amenities | `cdn.prod.website-files.com` |
| `public/images/amenity-parking.webp` | webp | 498 KB | Amenities | `cdn.prod.website-files.com` |
| `public/images/amenity-pool.webp` | webp | 432 KB | Amenities | `cdn.prod.website-files.com` |
| `public/images/amenity-spa-gym.webp` | webp | 171 KB | Amenities | `cdn.prod.website-files.com` |
| `public/images/apartment-ground-basement.webp` | webp | 361 KB | Apartment types | `cdn.prod.website-files.com` |
| `public/images/architecture-hero.webp` | webp | 409 KB | Architecture / Benefits | `cdn.prod.website-files.com` |
| `public/images/benefit-garden.webp` | webp | 494 KB | Benefits | `cdn.prod.website-files.com` |
| `public/images/flower-01.avif` | avif | 95 KB | Decorative flower loops | `cdn.prod.website-files.com` |
| `public/images/flower-02.avif` | avif | 106 KB | Decorative flower loops | `cdn.prod.website-files.com` |
| `public/images/flower-03.avif` | avif | 109 KB | Decorative flower loops | `cdn.prod.website-files.com` |
| `public/images/flower-04.avif` | avif | 61 KB | Decorative flower loops | `cdn.prod.website-files.com` |
| `public/images/flower-05.avif` | avif | 89 KB | Decorative flower loops | `cdn.prod.website-files.com` |
| `public/images/flower-06.avif` | avif | 57 KB | Decorative flower loops | `cdn.prod.website-files.com` |
| `public/images/flower-07.avif` | avif | 117 KB | Decorative flower loops | `cdn.prod.website-files.com` |
| `public/images/cta-sea-views.png` | png | 1946 KB | CTA | `cdn.prod.website-files.com` |
| `public/favicon.png` | png | 1 KB | Favicon | `cdn.prod.website-files.com` |
| `public/images/gallery-interior-01.webp` | webp | 225 KB | Interior gallery | `cdn.prod.website-files.com` |
| `public/images/gallery-interior-02.webp` | webp | 338 KB | Interior gallery | `cdn.prod.website-files.com` |
| `public/images/gallery-interior-03.webp` | webp | 361 KB | Interior gallery | `cdn.prod.website-files.com` |
| `public/images/gallery-kitchen.webp` | webp | 142 KB | Interior gallery | `cdn.prod.website-files.com` |
| `public/images/hero-day.webp` | webp | 370 KB | Hero | `cdn.prod.website-files.com` |
| `public/images/hero-night.webp` | webp | 258 KB | Hero | `cdn.prod.website-files.com` |
| `public/images/cloud-02.avif` | avif | 21 KB | Master plan (marquee) | `cdn.prod.website-files.com` |
| `public/images/cloud-33.avif` | avif | 63 KB | Master plan (marquee) | `cdn.prod.website-files.com` |
| `public/images/cloud-47.avif` | avif | 21 KB | Master plan (marquee) | `cdn.prod.website-files.com` |
| `public/images/interior-garden.webp` | webp | 760 KB | — | `cdn.prod.website-files.com` |
| `public/images/interior-terrace.png` | png | 1889 KB | Benefits / Apartments / Interiors | `cdn.prod.website-files.com` |
| `public/images/location-master-plan.webp` | webp | 503 KB | Master plan | `cdn.prod.website-files.com` |
| `public/images/quote-pool.webp` | webp | 474 KB | Quote | `cdn.prod.website-files.com` |
| `public/images/terrace.webp` | webp | 704 KB | Benefits / Apartments / Interiors | `cdn.prod.website-files.com` |
| `public/lottie/credits-logo.json` | json | 754 KB | Footer credits (Lottie) | `pub-157506367d4c4fa1825d7a6d26b687a2.r2.dev` |
| `public/videos/flower-01.webm` | webm | 3102 KB | Decorative flower loops | `assets.era-residence.com` |
| `public/videos/flower-02.webm` | webm | 3266 KB | Decorative flower loops | `assets.era-residence.com` |
| `public/videos/flower-03.webm` | webm | 3226 KB | Decorative flower loops | `assets.era-residence.com` |
| `public/videos/flower-04.webm` | webm | 2907 KB | Decorative flower loops | `assets.era-residence.com` |
| `public/videos/flower-05.webm` | webm | 2872 KB | Decorative flower loops | `assets.era-residence.com` |
| `public/videos/flower-06.webm` | webm | 2959 KB | Decorative flower loops | `assets.era-residence.com` |
| `public/videos/flower-07.webm` | webm | 3313 KB | Decorative flower loops | `assets.era-residence.com` |

## Optimisation applied

- `cta-sea-views.png` (1.9 MB) and `interior-terrace.png` (1.9 MB) additionally exported to
  `.webp`; `next/image` serves AVIF/WebP derivatives at the requested width.
- All content images go through `next/image` with explicit `sizes`, so no oversized
  download happens at small viewports.
- The 7 `.webm` loops are `preload="none"`, `muted`, `playsInline`, `loop`, and are only
  attached once their section enters the viewport; each has an `.avif` poster frame.
- Fonts are `font-display: swap`, preloaded for the two weights actually used.

## Not downloaded (deliberately)

Analytics and tag-manager payloads (GTM, GA4, Meta Pixel), the Webflow runtime bundle,
jQuery, and the site's Slater custom-code module — none belong in an independent rebuild.
