/**
 * Content extracted from the reference site's rendered DOM (docs/content.txt,
 * docs/cms.json). Mirrors the Webflow collections one-for-one so the sections
 * stay data-driven rather than hard-coding copy in JSX.
 */

export const site = {
  name: "ERA Residence",
  title: "ERA Residence — Contemporary Mediterranean Residences in Estepona",
  description:
    "Boutique residences on the New Golden Mile combining contemporary architecture, natural materials and resort-style living near Marbella and Estepona.",
  url: "https://era-residence.example",
  phone: "+34 (655) 408-648",
  phoneHref: "tel:+34655408648",
  addressLabel: "Sales office",
  address: "Avenida Litoral, 29680 Estepona, Málaga, Spain",
  mapHref:
    "https://www.google.com/maps/search/?api=1&query=Avenida+Litoral+29680+Estepona+Malaga+Spain",
} as const;

export const nav = {
  primary: { label: "Select \nGallery", href: "/apartments" },
  secondary: [
    { label: "Book a call", href: "#book-a-call", modal: true },
    { label: "Contact", href: "/contact", modal: false },
  ],
} as const;

/* ---------------------------------------------------------------- hero ---- */

export const hero = {
  /* MARQUIS LIVING. The plate supplies the interior; the type below is set in
     HTML so the hero's existing copy layer can carry it. */
  wordmark: ["Marquis"],
  accent: "living",
  tagline: "A higher way of living.",
  strap: {
    small: "Spaces composed around light. Proportion. and",
    large: "The way life unfolds.",
  },
  background: "/images/hero-02.jpg",
  cta: { label: "View available apartments", href: "/apartments" },
  description:
    "A boutique gated community of 25 residences on the New Golden Mile, five minutes from the sea.",
} as const;

/* ------------------------------------------------------------ benefits ---- */

export const benefitsIntro = {
  logoLeft: "Costa",
  logoRight: "del Sol",
  strap: "A place to live — to return\nyear after year",
  curvedTitle: "Three reasons to choose Era",
} as const;

export const benefits = [
  {
    id: "study-in-openness",
    title: "A study in openness",
    body: "Generous proportions, sculptural lighting and a calm palette create a room that feels expansive without losing intimacy.",
    kicker: "Stone · Pale timber · Ivory",
    image: "/images/benefit-study-in-openness.webp",
  },
  {
    id: "room-to-gather",
    title: "Room to gather",
    body: "Bouclé seating curves around a single low table beneath a wall of alabaster and brass, so the plan is set by conversation rather than by furniture.",
    kicker: "Designed as a community,\nnot a complex",
    image: "/images/benefit-gathering-room.webp",
  },
  {
    id: "boutique-concept",
    title: "Boutique concept",
    body: "A boutique gated community of 25 residences on Costa del Sol, designed around privacy, wellbeing and timeless Mediterranean living.",
    kicker: "Designed as a community,\nnot a complex",
    image: "/images/benefit-boutique-concept.webp",
  },
] as const;

/* --------------------------------------------------------------- quote ---- */

export const quote = {
  text: "Instead of corridors, walking paths connect the apartments — making ERA Residence feel closer to a group of private homes than a standard",
  authorRole: "Architecture team",
  authorName: "ERA Residence",
  image: "/images/quote-render.webp",
} as const;

/* ------------------------------------------------------------- concept ---- */

export const concept = {
  panels: {
    intro: {
      eyebrow: "The concept",
      lead: "ERA Residences is a boutique gated community of only 25 residences, designed around privacy, wellbeing and timeless Mediterranean living",
      body: "Inspired by the atmosphere of Marbella's golden era, the project combines contemporary architecture with warm materials, natural landscaping and carefully curated spaces.",
      /* the interiors the 3D flip gallery deals across this panel; its two
         arrangements refer to them by position in this list. Six of them, so
         each face fills both strips — three down the left margin, three down
         the right — with none left over. */
      photos: [
        { src: "/images/flip-01.webp", width: 960, height: 1200 },
        { src: "/images/flip-02.webp", width: 960, height: 1200 },
        { src: "/images/flip-03.webp", width: 1200, height: 800 },
        { src: "/images/flip-04.webp", width: 960, height: 1200 },
        { src: "/images/flip-05.webp", width: 1065, height: 1200 },
        { src: "/images/flip-06.webp", width: 1200, height: 960 },
      ],
    },
    place: {
      country: "Spain",
      title: ["New", "Golden", "Mile"],
      caption: "Between Marbella and Estepona",
      body: "Surrounded by beaches, golf courses, wellness clubs and established lifestyle destinations, the project combines privacy with effortless connectivity to everything essential for Mediterranean living. A location designed not around movement — but around returning.",
      image: "/images/concept-place-interiors.webp",
      cta: { label: "View available apartments", href: "/apartments" },
    },
  },
} as const;

/* ---------------------------------------------------------- masterplan ---- */

export const masterPlan = {
  title: "New Golden Mile,\nEstepona",
  region: "Costa del Sol",
  country: "Spain",
  image: "/images/render.jpg",
  dragHint: "Drag to see more",
} as const;

/* ---------------------------------------------------- apartment types ---- */

/* `video` is the stem under /public/videos: each has .webm, .mp4 and a
   -poster.webp beside it. The clips run ~5s and hand over to the next slide
   when they end. */
export const apartmentTypes = [
  {
    id: "ground-basement",
    name: "Ground floor + basement",
    bedrooms: "3",
    area: "178 — 202 m²",
    body: "Private basement, direct outdoor access and a dedicated lower level.",
    cta: "Explore ground + basement",
    href: "/apartments",
    video: "apartment-ground-basement",
  },
  {
    id: "ground-floor",
    name: "Ground floor",
    bedrooms: "2",
    area: "97 — 104 m²",
    body: "Step directly onto your terrace and into the communal gardens, blending indoor comfort with outdoor living.",
    cta: "Explore ground floor",
    href: "/apartments",
    video: "apartment-ground-floor",
  },
  {
    id: "penthouse-duplex",
    name: "Penthouse duplex",
    bedrooms: "2-3",
    area: "124 — 243 m²",
    body: "Two floors crowned with panoramic views and a private rooftop solarium — the ultimate expression of luxury living.",
    cta: "Explore penthouses",
    href: "/apartments",
    video: "apartment-penthouse-duplex",
  },
] as const;

export const apartmentIntro = {
  strap: "A place to live — to return\nyear after year",
  lead: "Residences range from 104 to 244 sq.m., offering spacious single level and duplex layouts with generous terraces and rooftop solariums.",
} as const;

/* ----------------------------------------------------------- amenities ---- */

export const amenities = [
  {
    id: "gated-community",
    name: "Gated community",
    body: "Walking paths, not corridors, connect the apartments — a group of private homes, not a block.",
    image: "/images/amenity-gated-community.webp",
    video: "/videos/amenity-l3.webm",
    poster: "/videos/amenity-l3-poster.webp",
  },
  {
    id: "swimming-pool",
    name: "Swimming pool",
    body: "Saltwater pool, children's pool, sauna, jacuzzi and wellness shower.",
    image: "/images/amenity-pool.webp",
    video: "/videos/amenity-l2.webm",
    poster: "/videos/amenity-l2-poster.webp",
  },
  {
    id: "parking-area",
    name: "Parking area",
    body: "Every parking space is pre-installed for optional EV charging.",
    image: "/images/amenity-parking.webp",
    video: "/videos/amenity-l1.webm",
    poster: "/videos/amenity-l1-poster.webp",
  },
  {
    id: "spa-gym",
    name: "Spa & gym",
    body: "For residents and their guests — a slower, more balanced Mediterranean lifestyle.",
    image: "/images/amenity-spa-gym.webp",
    video: "/videos/amenity-spa-gym.webm",
    poster: "/videos/amenity-spa-gym-poster.webp",
  },
] as const;

export const amenitiesCta = { label: "Book a call now", href: "#book-a-call" } as const;

/* ----------------------------------------------------------- interiors ---- */

export const interiors = {
  title: ["The", "space", "to"],
  accent: "Live in",
  upgradesTitle: "Optional upgrades are available:",
  upgrades: [
    "Private jacuzzi",
    "EV charging point installation",
    "Photovoltaic panels",
  ],
  lead: "Every detail was selected to create homes that feel elegant, intuitive and effortless to live in",
  /* the right column's answering punchline, set in the same display face as `lead` */
  leadRight: "Designed to be lived in, not simply looked at",
  body: "Underfloor heating throughout the property. Climate automation systems. Smart lock access systems. Electrically adjustable aluminium shutters. Schneider Electric DLIFE switches and mechanisms.",
  cta: { label: "View available apartments", href: "/apartments" },
  featureImage: "/images/founder-kunal-jaggi.png",
  sideImage: "/images/founder-shruti-sodhi.png",
  founders: [
    {
      name: "Kunal Jaggi",
      role: "Co-Founder & Strategic Director",
      bio: "An entrepreneur with a decade of building and growing ventures, bringing the strategic vision that turns ambition into meaningful impact.",
    },
    {
      name: "Shruti Sodhi",
      role: "Co-Founder & Creative Director",
      bio: "An internationally acclaimed interior designer behind luxury hospitality and residences, renowned for a distinctive eye for materiality and craftsmanship.",
    },
  ],
} as const;

/* -------------------------------------------------------- architecture ---- */

export const architecture = {
  title: "Architecture",
  intro:
    "Clean contemporary lines, warm Mediterranean texture, and terraces that carry the light from midday through to sunset.",
  quote:
    "The architecture of ERA Residences balances clean contemporary lines with Mediterranean warmth and texture",
  creditRole: "By Schiemann Weyers",
  creditName: "Architects OCWA Architects",
  cta: { label: "Book a call now", href: "#book-a-call" },
  image: "/images/architecture-render-19.webp",
} as const;

/* The two notes that sit on the cream either side of the reveal, where the
   bougainvillea used to hang. */
export const architectureNotes = {
  left: {
    kicker: "Residence / 01",
    title: ["Living", "with light."],
    body: [
      "One interior, first framed as an editorial composition, then revealed as one continuous place.",
      "Morning comes in across the terrace and moves over the stone until the last of the evening.",
      "Nothing is arranged for a photograph — only for the hours you actually keep here.",
    ],
  },
  right: {
    kicker: "Marquis living / Point of view",
    title: ["Spaces composed around light,", "proportion and the way life", "unfolds."],
    body: [
      "Rooms are set to the path of the sun rather than to the convenience of a plan.",
      "What remains is proportion, quiet material, and room enough for a day to take its own shape.",
    ],
  },
} as const;

/* ---------------------------------------------------------------- book ---- */

/* The scroll-driven editorial book: three spreads, each with a copy page and a
   photograph that opens out to full screen before the page turns. */
export const book = {
  label: "The Living Journal / Selected spaces",
  title: ["A story you can", "step inside."],
  background: "/images/book-room-v2.webp",
  spreads: [
    {
      kicker: "Marquis Living / 01",
      title: ["The art", "of belonging."],
      body: "A considered world of space, texture and the moments that make a home.",
      foot: "01 / A higher life",
      image: "/images/book-entrance.webp",
      alt: "Double-height entrance hall with a crystal chandelier between twin staircases",
      caption: "From page to place / 01",
    },
    {
      kicker: "Marquis Living / 02",
      title: ["Designed for", "togetherness."],
      body: "A composed setting for conversation, ritual and shared moments.",
      foot: "Dining / Atmosphere",
      image: "/images/book-bar.webp",
      alt: "Lit bar with a mirrored counter, stone backdrop and glass pendants",
      caption: "Gathering place / Study 02",
    },
    {
      kicker: "Marquis Living / 03",
      title: ["A quieter", "point of view."],
      body: "Softness, privacy and a slower rhythm define the most personal spaces.",
      foot: "Private retreat / Atmosphere",
      image: "/images/book-living.webp",
      alt: "Living room with a curved sofa under a blossom chandelier, city view at dusk",
      caption: "Private retreat / Study 03",
    },
  ],
} as const;

/* ----------------------------------------------------------------- faq ---- */

/* The questions that come up before a first conversation, answered plainly.
   One row opens at a time; the first is open on arrival. */
export const faq = {
  title: "Your Inquiries Answered",
  image: "/images/faq-bar.webp",
  alt: "Bar counter in fluted glass beneath a blossom chandelier, lit shelves of bottles behind",
  items: [
    {
      id: "scope",
      q: "How Is The Required Scope Defined?",
      a: "Commissions are accepted exclusively for comprehensive spatial renovations or ground-up construction. Single-room curation or isolated furnishing requests are not currently accommodated.",
    },
    {
      id: "international",
      q: "Are International Commissions Accepted?",
      a: "Yes. Projects are undertaken beyond Spain, with site visits and milestone reviews travelled in person. Execution on the ground is coordinated with contractors vetted in the project’s own region.",
    },
    {
      id: "timeline",
      q: "What Is The Standard Project Timeline?",
      a: "A full renovation usually runs eighteen to twenty-four months from first brief to handover. Ground-up construction runs longer, and the programme is set against the site itself before any work is committed.",
    },
    {
      id: "availability",
      q: "Are New Commissions Currently Accepted?",
      a: "A limited number are taken each year, so that every project keeps the studio’s full attention. Enquiries for the coming season are welcome, and current availability is confirmed at first contact.",
    },
    {
      id: "fees",
      q: "How Are Fees Structured?",
      a: "Fees are set against the scope once the brief is fixed — a single figure for the whole commission rather than an hourly rate. A schedule of stage payments is agreed before any drawing begins.",
    },
    {
      id: "site",
      q: "Who Manages The Build On Site?",
      a: "The studio holds the design through to completion and reviews the work at every stage. Day-to-day construction is run by the main contractor, appointed jointly and answerable to the drawings.",
    },
    {
      id: "architect",
      q: "Can An Existing Architect Be Retained?",
      a: "Readily. Where an architect or engineer is already appointed, the studio works alongside them on the interior scope, and the division of responsibility is set down in writing before work starts.",
    },
  ],
} as const;

/* ------------------------------------------------------ project facts ---- */

/* The four measures the whole place is composed to. The reference listed a
   developer, an agent and a construction licence here; those were its facts,
   not this site's subject — these follow the hero's own line about light,
   proportion and the way life unfolds. */
/* Three cards, dealt across a track that drifts left to right as the section
   scrolls (see ProjectFacts.tsx). */
export const projectFacts = {
  strap: "A place to live — to return\nyear after year",
  lead: "Three measures, held to from the first drawing through to the day the keys change hands.",
  close: "Nothing here is new for its own sake. It is only meant to last.",
  items: [
    {
      id: "light",
      index: "01",
      label: "Light",
      value:
        "Every room is set to the path of the sun rather than to the convenience of a plan. Morning arrives across the terrace; by evening the same walls hold something lower and warmer. Nothing here has to be staged to look well.",
    },
    {
      id: "proportion",
      index: "02",
      label: "Proportion",
      value:
        "Ceilings, openings and thresholds are drawn to one set of measures, so a room reads as calm before anything at all is placed in it. Scale does the work that decoration would otherwise be asked to do.",
    },
    {
      id: "material",
      index: "03",
      label: "Material",
      value:
        "Stone, oiled oak, lime plaster and unlacquered brass — surfaces chosen because they age rather than wear. Each is left close to its natural state, so the interior settles over the years instead of dating.",
    },
  ],
};

/* ----------------------------------------------------------------- cta ---- */

export const callToAction = {
  lead: "A short conversation is enough to understand which apartment fits your usecase — whether it is a family second home, a longer stay, or a place to return to year after year.",
  title: ["Perfect", "sea views"],
  caption: "From rooftop terraces",
  cta: { label: "View available apartments", href: "/apartments" },
  image: "/images/cta-render-21.webp",
} as const;

/* -------------------------------------------------------------- footer ---- */

/* Head Field Solutions' own offices and lines, as supplied. The big number is
   set apart from its region tag so it keeps the reference's single nowrap
   line at display scale. */
export const footer = {
  toTop: "To top",
  strap: "Reach out to us in the nearest office.",
  phone: "+91 9211733881",
  phoneRegion: "(India)",
  phoneHref: "tel:+919211733881",
  offices: [
    {
      label: "Corporate Headquarters",
      places: [
        ["Head Field Solutions Pvt. Ltd.", "Lajpat Nagar II New Delhi – 110024"],
      ],
    },
    {
      label: "Branch Offices",
      places: [
        ["Head Field Solutions Pvt. Ltd.", "B-73, Sector -57 NOIDA - 201 301 (UP)"],
      ],
    },
  ],
  reach: [
    { label: "info@headfield.com", href: "mailto:info@headfield.com" },
    { label: "+91 (931) 056 8481 (India)", href: "tel:+919310568481" },
  ],
  copyright: "Head Field Solutions Pvt. Ltd.",
  rights: "©2026 All rights reserved",
  legal: [
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms of use", href: "/terms-of-use" },
  ],
  creditsLabel: "Made by",
  creditsName: "THEFIRSTTHELAST",
  creditsHref: "https://thefirstthelast.com",
} as const;

export const cookies = {
  title: "Cookies",
  body: "This website uses cookies to ensure you get the best experience on website.",
  accept: "Accept",
  decline: "Decline",
} as const;
