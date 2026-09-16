# Final visual differences — reference vs local

Method: both sites driven in real Chrome at 1440x900 and 390x844, captured at 26 matched
scroll positions and tiled reference-above-local (`docs/vcmp/1440/p-*.jpg`, `row-*.jpg`).
Element geometry measured directly with `tools/probe2.mjs` / `tools/probe3.mjs`.

Priorities: **P0** major mismatch · **P1** clearly noticeable · **P2** moderate · **P3** polish.

---

| # | Section | Reference | Current | Difference | Likely cause | Fix | Pri |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Hero | Render parallaxes 44vh then zooms to 2× across the pin; the pool is revealed by ~900px | Render frozen at `top: 0, w: 1440` for the entire hero — only the copy moves | **The whole hero scroll reveal was dead** | Preloader writes an inline `transform: scale()` to `[data-hero-render]`; inline style out-specifies the stylesheet transform permanently | Route the preloader's entry through `--hero-intro` and multiply it into the hero's own transform | **P0** |
| 2 | ApartmentTypes | **One card at a time**, 1080×756 centred, giant display name beneath | Three small cards side by side, ~430 wide each | Reads as a generic card grid, not a property showcase | Built as a static 3-up grid with a slider bolted on | Single-card showcase at 1080×756; slider swaps the card | **P1** |
| 3 | Amenities | Tab list is **vertical, top-right**, 259 wide, 36 per row, active white / rest dimmed | Horizontal row along the bottom edge with an underline rail | Wrong position, wrong axis | Assumed a tab bar | Vertical list, top-right, opacity for state | **P1** |
| 4 | Concept | Lead is **h4 (56.7px)** on an 806 measure → 3 lines | h3 (86.4px) on a 46vw measure → 5 lines | Twice the type, fills the panel | Wrong token | h4 at 59.5% measure | **P1** |
| 5 | ApartmentIntro | Lead is **h4 (56.7px)**, 806×150, 3 lines | h4 but on a wider measure → 5 lines | Same as above | Measure too narrow for `.fit` | 59.5% measure | **P1** |
| 6 | Architecture | Title is **349px** (≈388 design px), 1015 painted, centred | `h1` (172.8px), ~770 painted | Half the size; loses the wall-of-type moment | Assumed h1 | Dedicated size token on the title | **P1** |
| 7 | ProjectFacts | Rows carry **no rules**; the `+` sits as a superscript immediately after the label | 1px rule under every row; `+` pushed to the far right | Reads as a data table | Accordion styled with borders | Drop the rules, put `+` beside the label | **P1** |
| 8 | Benefits | Slide image **374×187** (2:1), centred | 564×317 (1.8:1) | 50% too large | Guessed proportions | Match measured size | **P2** |
| 9 | Quote | Image 1440×1080 — natural aspect, no crop, no parallax | 1440×1404, `object-fit: cover`, ±15% parallax | Different crop; an animation the reference does not have | Parallax added speculatively | Natural aspect, drop the parallax | **P2** |
| 10 | CallToAction | Render stays clean daylight; plum arrives as a clean edge at the footer | Render washed violet by scrim + `bleed-bottom` stacking | Muddy | Two overlapping plum gradients | Shorten the bleed, lighten the scrim | **P2** |
| 11 | BenefitsIntro | Strap sits high; the benefits slide starts ~4020 | Strap at the bottom of its box; slide starts ~4450 | ~430px of vertical rhythm | Padding distribution | Tighten the intro's lower padding | **P2** |
| 12 | Interiors | Upgrades list sits above the feature image | List below the image | Order/rhythm | Layout order | Reorder within the column | **P3** |
| 13 | Concept | Route-path sits mid-panel at a modest width | Path lower and wider | Placement | Guessed | Align to the panel's vertical centre | **P3** |
| 14 | MasterPlan | Clouds read over mountains near the top | An extra blue gradient band above the mountains | Veil too tall | `veilTop` 30vh | Shorten | **P3** |
| 15 | Hero → Benefits | Arch crown slightly further along at 3300 | Crown ~50px lower | Arch timing | Overlap offset | Accept / minor nudge | **P3** |
| 16 | Amenities | Render inset by the page gutter (1354 wide) | Full-bleed | Edge treatment | — | Accept — the reference reads full-bleed at speed | **P3** |

---

## Fix order

1. **#1 Hero render** — nothing else matters while the hero is static
2. **#2 ApartmentTypes**, **#3 Amenity tabs** — the two sections that read as generic components
3. **#4 / #5 / #6** — display-type scale across Concept, ApartmentIntro, Architecture
4. **#7 ProjectFacts** chrome
5. **#8 / #9 / #10** — image proportion, crop and colour
6. **#11–#16** — rhythm and polish


---

## Status after the pass

**Fixed:** #1–#11, #14 (P0 through P2, plus the master-plan veil).

**Deliberately not changed:** #12 (Interiors list order), #13 (route-path
placement), #15 (arch-crown timing at 3300), #16 (amenity render inset). These
are sub-screen placement nuances; each would cost a layout change for a
difference that is not visible at scrolling speed. They are listed so the next
pass can pick them up rather than rediscover them.

Verification, remaining limitations and the before/after geometry are in
[`final-visual-qa.md`](final-visual-qa.md).

Two of them turned out to be bugs rather than styling gaps:

- **#1** the hero render's motion was dead, not merely mistuned — an inline
  `transform` from the preloader was overriding the stylesheet.
- **#5** the ApartmentIntro measure was being cancelled: a CSS-module `width` on
  an element carrying `.fit` out-orders the global utility. The same class of bug
  had already produced the Quote overflow in the previous pass.
