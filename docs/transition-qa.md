# Transition QA — second pass

Method: both sites driven in real Chrome at 1440x900 (`tools/geom.mjs`, `tools/trans.mjs`).
Every transition captured at boundary −450px and +250px on each site and tiled
(`docs/trans/cmp-*.jpg`, reference on top, local below). Section geometry in `docs/geom.json`.

## Measured scroll geometry

Distance each section *owns* (its top to the next section's top), 1440x900:

| Section | Reference | Local (before) | Drift |
| --- | ---: | ---: | ---: |
| Hero | 3600 | 3600 | 0 |
| BenefitsIntro | 720 | 677 | −43 |
| Benefits | 900 | 876 | −24 |
| Quote | 1080 | 810 | −270 |
| Concept | 4514 | 3780 | **−734** |
| MasterPlan | 1260 | 1523 | +263 |
| ApartmentTypes | 900 | 757 | −143 |
| ApartmentIntro | 855 | 868 | +13 |
| Amenities | 1350 | 4126 | **+2776** |
| Interiors | 2979 | 3615 | +636 |
| Architecture | 3380 | 2880 | −500 |
| ProjectFacts | 818 | 567 | −251 |
| CallToAction | 1349 | 1125 | −224 |
| Footer | 900 | 900 | 0 |
| **Document** | **24605** | **26104** | +1499 |

### The structural finding

The reference is continuous largely because **sections overlap**. Three do:

| Overlap | Amount | Mechanism |
| --- | ---: | --- |
| Hero → BenefitsIntro | 1620 | the arch rises over the pinned hero |
| **Amenities → Interiors** | **1620** | the arch rises over the pinned amenity render |
| CallToAction → Footer | 230 | the footer clips up over the CTA render |

Hero→Benefits was already implemented. Amenities→Interiors was not — which is why that
transition reads as "one section stopped, another started".

## Scorecard

| Transition | Reference feel | Current feel | Difference | Fix |
| --- | --- | --- | --- | --- |
| Hero → Benefits | Arch rises over the pinned, zooming render | Matches | — | Done in pass 1 |
| Benefits → Quote | Flat powder-sky, small framed image, generous negative space | A render bleeds behind the benefits slide | Background should be flat here | Remove the bleed |
| Quote → Concept | Quote set as **white text directly on the pool render**, right-aligned under a `"` glyph | Text inside a **solid plum card** floating on the image | Hard rectangle where the reference has none | Drop the card; type on image |
| Concept → MasterPlan | Route-path diagram, then clouds drift while the aerial photo rises underneath — no seam | Cream → **plum band** → hard-edged photo | Bare canvas band; path diagram missing entirely | Photo covers the seam; add the path panel |
| MasterPlan → Apartments | Aerial holds, cards arrive on powder-sky | Close | Height +263 | Re-align |
| Apartments → Amenities | Amenity render reaches the section's top edge | Sky-blue → **plum band** → photo | Bare canvas band | Let the render cover it |
| **Amenities → Interiors** | **Interiors' arch rises over the live amenity render for 1620px** | Amenities ends, plum band, then cream Interiors | **No overlap at all** | Overlap −180vh; pin 2070 |
| Interiors → Architecture | A **staggered cluster** of 2–3 offset images at different scales | One centred image | Flat, no depth | Rebuild as a cluster |
| Architecture → Facts | Plum panel releases into cream | Close | Height −500 | Re-align |
| Facts → CTA | Facts are a **large display-type accordion** (`DEVELOPER⁺ / SALES & MARKETING⁺ / …`) | A 4-column row of small labels | Wrong component entirely | Rebuild |
| CTA → Footer | Render stays clean; footer clips up over it | Heavy purple wash over the render | Scrim too strong | Lighten |

## Priority order

1. Amenities → Interiors overlap (the single largest break in continuity)
2. Quote card → type on image
3. Section-height re-alignment (Concept, Amenities, Interiors, Architecture, Facts, CTA)
4. Remove bare canvas bands at Concept→MasterPlan and Apartments→Amenities
5. ProjectFacts accordion
6. Concept route-path panel
7. Architecture staggered image cluster
8. Benefits background bleed
9. Scrim weights on Amenities / CTA


---

# Results

## Geometry after the pass

| Section | Reference top | Local top | Drift |
| --- | ---: | ---: | ---: |
| Hero | 0 | 0 | 0 |
| BenefitsIntro | 3600 | 3600 | 0 |
| Benefits | 4320 | 4320 | 0 |
| Quote | 5220 | 5218 | −2 |
| Concept | 6300 | 6298 | −2 |
| MasterPlan | 10814 | 10798 | −16 |
| ApartmentTypes | 12074 | 12058 | −16 |
| ApartmentIntro | 12974 | 12959 | −15 |
| Amenities | 13829 | 13827 | −2 |
| Interiors | 15179 | 15177 | −2 |
| Architecture | 18158 | 18225 | +67 |
| ProjectFacts | 21538 | 21600 | +62 |
| CallToAction | 22356 | 22422 | +66 |
| Footer | 23705 | 23778 | +73 |
| **Document** | **24605** | **24678** | **+73** |

Worst drift 73px on a 24 678px page — 0.3%. Every major visual moment now lands
within a fraction of a screen of where the reference puts it.

## What changed

| # | Change | Why |
| --- | --- | --- |
| 1 | **Interiors overlaps Amenities by 180vh**; Amenities re-sized 500vh → 330vh (pin 2070) | The reference's single largest continuity device, and it was missing. The arch now climbs across a still-pinned, still-changing render instead of waiting for it to finish. |
| 2 | **Quote rebuilt as type on the render** — right-aligned white under an oversized `"`, edges veiled into the sky above and cream below | It was a solid plum card: the exact hard rectangle the section exists to avoid |
| 3 | **MasterPlan rebuilt**: the aerial is the section's ground, copy over it, top edge dissolved into cream behind the clouds | It was a picture on a plum panel, which produced a bare colour band before the photo |
| 4 | **Amenities and CallToAction stopped declaring their own canvas colour** | Their renders cover the section, so the declaration only painted a band across the *previous* section |
| 5 | **ProjectFacts rebuilt as a display-scale accordion** in an 806px column | The reference is four 79px rows of display type behind `+`, not a four-column row of small labels |
| 6 | **Concept gained the route-path panel** — the coast line and drive-time labels | Both SVGs were downloaded in pass 1 and never placed; the panel that makes the location concrete was simply absent |
| 7 | **Architecture intro rebuilt as two overlapping portraits** (measured 721x909 + 720x909) | A single centred landscape read as a picture on a page; the pair reads as a wall of building |
| 8 | **Scrims halved** on Architecture, CallToAction and Amenities | A full plum overlay turned bright Mediterranean renders lavender; the reference darkens only where type sits |
| 9 | **Benefits and Quote made opaque** | Both sit inside the hero's 5.8-screen box, which still paints its pinned render *above* the fixed page canvas — so a transparent section showed the hero through it |
| 10 | Heights re-aligned across nine sections; Concept pin given an end-hold | Removed 1 499px of accumulated drift |

## Bugs found while doing it

| Bug | Effect | Fix |
| --- | --- | --- |
| `.fit`'s negative inline margins cancelled by a CSS-module `margin: 0` on the same element | The quote's widened layout box was never pulled back, so the text ran off the right edge **on both desktop and mobile** | Module rule narrowed to `margin-block` |
| `useHorizontalPin` used the default `pinType`, switching the section to `position: fixed` | Engaging and releasing the pin was the *only* source of layout shift on the page: **CLS 1.94** | `pinType: "transform"` → **CLS 0** |
| `white-space: normal` on the mobile place-title | "GOLDEN" broke mid-word as "GOLDE / N" | nowrap per word; the panel clips the squeezed overflow |

## Performance

| Metric | Value |
| --- | --- |
| Frame time, median | 16.1 ms |
| Frame time, p90 | 31.7 ms |
| Cumulative layout shift, full-page scroll | **0** (was 1.94) |
| Horizontal overflow at 390px | none |
| Console errors | none |

All scroll work is `transform` / `opacity` and rAF-throttled; the page canvas writes
its gradient directly to the element rather than through React state.
