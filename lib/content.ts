/**
 * Content extracted from the reference site's rendered DOM (docs/content.txt,
 * docs/cms.json). Mirrors the Webflow collections one-for-one so the sections
 * stay data-driven rather than hard-coding copy in JSX.
 */

export const site = {
  name: "Marquis Living",
  title: "Marquis Living — Bespoke Interior Design Studio in Dubai",
  description:
    "Exclusive interiors in Dubai for the true connoisseurs of fine living. Consultancy, turnkey solutions and furniture, delivered by one studio from first sketch to final handover.",
  url: "https://marquis-living-frontend.vercel.app",
  /* the line the footer prints; the menu, the booking modal and the contact
     panel all read it from here. TODO: no street address for the Dubai studio
     yet — `address` below and `footer.offices` still carry what we were given. */
  phone: "+971 52 241 9949",
  phoneHref: "tel:+971522419949",
  addressLabel: "Studio",
  address: "Dubai, United Arab Emirates",
  mapHref:
    "https://www.google.com/maps/search/?api=1&query=Dubai+United+Arab+Emirates",
} as const;

export const nav = {
  primary: { label: "See Our \nWork", href: "/apartments" },
  /* the header's top-right link; there is no gallery index, so it opens the
     first gallery, as the site's other "See our work" links do */
  gallery: { label: "Gallery", href: "/gallery/residential" },
  secondary: [
    { label: "Book a consultation", href: "#book-a-call", modal: true },
    { label: "Contact", href: "/contact", modal: false },
  ],
} as const;

/* ---------------------------------------------------------------- hero ---- */

export const hero = {
  /* MARQUIS LIVING. The plate supplies the interior; the type below is set in
     HTML so the hero's existing copy layer can carry it. */
  wordmark: ["Marquis"],
  accent: "living",
  tagline: "Interiors envisioned, delivered exactly as promised",
  /* One statement per bottom corner — they differ now, so the hero reads as
     two claims rather than one repeated twice. A `small` of "" prints no
     label line at all, which is what the right-hand corner wants. */
  strap: {
    left: {
      small: "Exclusive interiors in Dubai",
      large: "For the true connoisseurs of fine living",
    },
    right: {
      small: "",
      large: "One of the best interior design firms in UAE",
    },
  },
  background: "/images/hero-02.jpg",
  cta: { label: "Book a consultation", href: "#book-a-call" },
  description:
    "Exclusive interiors in Dubai for the true connoisseurs of fine living.",
} as const;

/* ------------------------------------------------------------ benefits ---- */

export const benefitsIntro = {
  logoLeft: "Marquis",
  logoRight: "Living",
  strap: "Every studio says they're different.\nHere's what that actually looks like, in practice.",
  curvedTitle: "Designed Around Your Life",
} as const;

export const benefits = [
  {
    id: "made-for-you",
    title: "Made for you",
    body: "Every project begins with what the space and the people in it actually need, shaping something considered and personal around your requirements.",
    kicker: "Shaped by you,\nbuilt with care",
    image: "/images/benefit-study-in-openness.webp",
  },
  {
    id: "value-by-design",
    title: "Value, by design",
    body: "Beautiful design and a sensible budget can absolutely coexist. Our process protects your investment at every stage, so you can see the quality in every detail.",
    kicker: "Refined choices,\nhonest costs",
    image: "/images/benefit-value-by-design.webp",
  },
  {
    id: "one-familiar-voice",
    title: "One familiar voice",
    body: "Your account manager stays with you from the first call to the final walkthrough — the same person at every stage — which is exactly why our timelines hold.",
    kicker: "One person,\nstart to finish",
    image: "/images/benefit-one-familiar-voice.webp",
  },
] as const;

/* --------------------------------------------------------------- quote ---- */

export const quote = {
  text: "Beautiful is only the beginning. We create spaces with presence, purpose, and a character that stays long after the first impression.",
  authorRole: "Team",
  authorName: "Marquis Living",
  image: "/images/quote-render.webp",
} as const;

/* ------------------------------------------------------------- concept ---- */

export const concept = {
  panels: {
    intro: {
      eyebrow: "The concept",
      lead: "Marquis Living is a bespoke interior design studio, built around one idea: a space should work exactly the way you want it to",
      body: "Every project begins with real understanding, of the space and the people it's for, shaped through considered design and hands-on execution from the very first sketch.",
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
      country: "Dubai",
      title: ["Built", "on", "Ambition"],
      caption: "Precision over everything",
      body: "This is a city that expects more, and the spaces within it carry that same energy. We design with a full understanding of what it takes to stand out here.",
      image: "/images/concept-place-interiors.webp",
      cta: { label: "See our work", href: "/gallery/residential" },
    },
  },
} as const;

/* ---------------------------------------------------------- masterplan ---- */

export const masterPlan = {
  title: "A studio built to return to,\nproject after project",
  region: "Dubai",
  country: "United Arab Emirates",
  image: "/images/render.jpg",
  dragHint: "Drag to see more",
} as const;

/* ---------------------------------------------------- apartment types ---- */

/* `video` is the stem under /public/videos: each has .webm, .mp4 and a
   -poster.webp beside it. The clips run ~5s and hand over to the next slide
   when they end. */
export const apartmentTypes = [
  {
    id: "residential",
    name: "Residential",
    projectType: "Full homes, apartments, renovations",
    area: "80 — 600 m²",
    body: "Every room shaped around how you actually live, from the first sketch to the last cushion.",
    cta: "Explore residential",
    href: "/gallery/residential",
    video: "apartment-ground-basement",
  },
  {
    id: "commercial",
    name: "Commercial",
    projectType: "Offices, showrooms, retail",
    area: "150 — 2,000 m²",
    body: "Spaces built to perform beautifully every day, not just in the opening week.",
    cta: "Explore commercial",
    href: "/gallery/commercial",
    video: "apartment-ground-floor",
  },
  {
    id: "hospitality",
    name: "Hospitality",
    projectType: "Restaurants, hotels, lounges",
    area: "200 — 3,000 m²",
    body: "Designed to feel effortless and inviting, day after day.",
    cta: "Explore hospitality",
    href: "/gallery/hospitality",
    video: "apartment-penthouse-duplex",
  },
] as const;

/* ------------------------------------------------------------- gallery ---- */

/* The three "Explore" buttons each open the parallax gallery for their sector.
   Until each sector has its own photography, all three draw on the same set of
   the site's own interiors; only the heading and lead change. */
export const galleryCategories = {
  residential: {
    title: "Our works",
    lead: "Full homes, apartments and renovations, shaped around how you actually live.",
  },
  commercial: {
    title: "Commercial",
    lead: "Offices, showrooms and retail, built to perform beautifully every day.",
  },
  hospitality: {
    title: "Hospitality",
    lead: "Restaurants, hotels and lounges that feel effortless and inviting.",
  },
} as const;

export type GalleryCategory = keyof typeof galleryCategories;

/* `w` / `h` are the files' own pixel sizes, so each card keeps its photo's
   proportions on the strip. */
export const galleryItems = [
  { src: "/images/hero-02.jpg", w: 2304, h: 1536, title: "Marble Hour", caption: "A living room composed around stone and brass" },
  { src: "/images/book-entrance.webp", w: 2400, h: 2999, title: "Grand Arrival", caption: "A chandelier-lit entrance framed in marble" },
  { src: "/images/flip-01.webp", w: 960, h: 1200, title: "Soft Geometry", caption: "Curved forms softening a formal plan" },
  { src: "/images/quote-render.webp", w: 1920, h: 1440, title: "Evening Light", caption: "Warm lamplight layered over quiet neutrals" },
  { src: "/images/book-bar.webp", w: 2400, h: 3373, title: "The Cellar Bar", caption: "Amber glass, dark timber and a cascade of light" },
  { src: "/images/flip-03.webp", w: 1200, h: 800, title: "Open Plan", caption: "One continuous room for living and gathering" },
  { src: "/images/architecture-render-19.webp", w: 1122, h: 1402, title: "Structure & Warmth", caption: "Architecture and interior speaking one language" },
  { src: "/images/book-living.webp", w: 2400, h: 2999, title: "Quiet Grandeur", caption: "Scale held in check by softness" },
  { src: "/images/flip-06.webp", w: 1200, h: 960, title: "Dining in Stone", caption: "A marble table as the room's anchor" },
  { src: "/images/concept-place-interiors.webp", w: 1181, h: 1331, title: "A Considered Place", caption: "Every piece chosen for how it will be used" },
  { src: "/images/flip-04.webp", w: 960, h: 1200, title: "Brass & Velvet", caption: "Rich materials, restrained palette" },
  { src: "/images/cta-render-21.webp", w: 1024, h: 1536, title: "The Long View", caption: "Rooms arranged around the light they receive" },
  { src: "/images/benefit-boutique-concept.webp", w: 1869, h: 2243, title: "Boutique Concept", caption: "Hotel-grade detail for everyday living" },
  { src: "/images/flip-05.webp", w: 1065, h: 1200, title: "Tailored Corners", caption: "Joinery made to measure, edge to edge" },
  { src: "/images/render.jpg", w: 1402, h: 1122, title: "From First Sketch", caption: "The design as it was promised, delivered" },
  { src: "/images/book-room-v2.webp", w: 1024, h: 1536, title: "Private Retreat", caption: "A bedroom that asks nothing of you" },
] as const;

export const apartmentIntro = {
  strap: "The approach",
  lead: "Every project is built by one team, design through delivery, so the vision stays intact from first sketch to final handover",
} as const;

/* ----------------------------------------------------------- amenities ---- */

export const amenities = [
  {
    id: "global-sourcing",
    name: "Global sourcing network",
    body: "Materials and pieces from furniture houses, workshops and ateliers we've partnered with directly for years, going beyond what's available locally.",
    image: "/images/amenity-gated-community.webp",
    video: "/videos/amenity-l3.webm",
    poster: "/videos/amenity-l3-poster.webp",
  },
  {
    id: "on-site-execution",
    name: "On-site execution",
    body: "A member of the Marquis team is present on site throughout the build, offering hands-on oversight at every stage.",
    image: "/images/amenity-pool.webp",
    video: "/videos/amenity-l2.webm",
    poster: "/videos/amenity-l2-poster.webp",
  },
  {
    id: "transparent-costing",
    name: "Transparent costing",
    body: "A quote you can rely on, fully transparent from the very first conversation and honoured throughout the project.",
    image: "/images/amenity-parking.webp",
    video: "/videos/amenity-l1.webm",
    poster: "/videos/amenity-l1-poster.webp",
  },
  {
    id: "post-handover-support",
    name: "Post-handover support",
    body: "Our relationship continues well beyond the walkthrough. If something needs attention months later, you call the same person you've always called.",
    image: "/images/amenity-spa-gym.webp",
    video: "/videos/amenity-spa-gym.webm",
    poster: "/videos/amenity-spa-gym-poster.webp",
  },
] as const;

export const amenitiesCta = { label: "Book a consultation", href: "#book-a-call" } as const;

/* ----------------------------------------------------------- interiors ---- */

export const interiors = {
  /* opens the booking modal (there is no page behind it) */
  cta: { label: "Know more" },
  title: ["The", "Minds", "Behind"],
  accent: "Marquis Living",
  upgradesTitle: "The studio works across:",
  upgrades: [
    "Single rooms and full homes",
    "Offices and commercial fit-outs",
    "Hospitality spaces",
  ],
  lead: "Bringing a distinctive eye for interiors, materiality, craftsmanship, and the art of living",
  /* the right column's answering punchline, set in the same display face as `lead` */
  leadRight: "Every space tells a story. We just make sure it's told properly",
  body: "As a bespoke interior design company in Dubai, we work across single rooms, full homes, offices, and hospitality spaces, with every project carrying the same studio, the same account manager, and the same standard from first sketch to handover.",
  featureImage: "/images/founder-kunal-jaggi.png",
  sideImage: "/images/founder-shruti-sodhi.png",
  founders: [
    {
      name: "Kunal Jaggi",
      role: "Co-Founder & Strategic Director",
      bio: "Bringing entrepreneurial vision, strategic thinking, and the discipline to turn ambition into execution.",
    },
    {
      name: "Shruti Sodhi",
      role: "Co-Founder & Creative Director",
      bio: "Shaping every project from the first sketch, drawn to materials and proportion as much as vision.",
    },
  ],
} as const;

/* -------------------------------------------------------- architecture ---- */

export const architecture = {
  title: "The build",
  intro:
    "Every space starts as an idea, then becomes somewhere people actually spend their time.",
  quote:
    "Every space we design balances structure and warmth, built to feel considered from the first sketch to the final finish.",
  creditRole: "By Shruti Sodhi & Kunal Jaggi",
  creditName: "Co-Founders, Marquis Living",
  cta: { label: "Book a consultation", href: "#book-a-call" },
  image: "/images/architecture-render-19.webp",
} as const;

/* The two notes that sit on the cream either side of the reveal, where the
   bougainvillea used to hang. */
export const architectureNotes = {
  left: {
    kicker: "The Build",
    title: ["Clean lines,", "honest materials."],
    body: [
      "Proportion that holds a room together before a single piece of furniture is placed in it.",
      "Light moves differently through every room and every layout, so we design around it rather than against it.",
      "Nothing here is arranged for a photograph. Only for the people who'll use it, every day.",
    ],
  },
  right: {
    kicker: "Marquis Living / Point of view",
    title: ["Spaces composed around light,", "proportion, and the way", "life actually moves."],
    body: [
      "Every layout is set to how a space will be used, not to how it will photograph.",
      "What remains is proportion, honest material, and room enough for each day to take its own shape.",
    ],
  },
} as const;

/* ---------------------------------------------------------------- book ---- */

/* The scroll-driven editorial book: three spreads, each with a copy page and a
   photograph that opens out to full screen before the page turns. */
export const book = {
  label: "The Marquis Journal / Selected spaces",
  title: ["The art of living,", "done properly."],
  background: "/images/book-room-v2.webp",
  /* the small button on each left-hand page */
  cta: { label: "See our work", href: "/gallery/residential" },
  spreads: [
    {
      kicker: "Marquis Living / 01",
      title: ["A considered", "world of space."],
      body: "Space, material, and the moments that make it feel right.",
      foot: "01 / The art of living",
      image: "/images/book-entrance.webp",
      alt: "Double-height entrance hall with a crystal chandelier between twin staircases",
      caption: "From page to place / 01",
    },
    {
      kicker: "Marquis Living / 02",
      title: ["Designed for", "togetherness."],
      body: "A composed setting for conversation, ritual and shared moments.",
      foot: "Gathering / Atmosphere",
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
  title: "Everything You Need to Know",
  image: "/images/faq-bar.webp",
  alt: "Bar counter in fluted glass beneath a blossom chandelier, lit shelves of bottles behind",
  items: [
    {
      id: "process",
      q: "What does the process actually look like?",
      a: "Every project follows the same four stages: Briefing, Design, Execution, and Handover. Your account manager stays with you through all four, so nothing gets passed between teams along the way.",
    },
    {
      id: "timeline",
      q: "How long does a typical project take?",
      a: "It depends entirely on scope — a single room moves faster than a full home or a commercial fit-out. During briefing, we agree on a realistic timeline upfront, and that's the timeline we hold to.",
    },
    {
      id: "sectors",
      q: "Do you work across residential, commercial, and hospitality projects?",
      a: "Yes. As a bespoke interior design company, we take on homes, offices, retail spaces, and hospitality venues, all with the same process and the same standard of execution.",
    },
    {
      id: "pricing",
      q: "How is pricing structured?",
      a: "You receive a transparent quote after the briefing stage, once we understand the full scope. That figure is what you can expect to pay, honoured throughout the project.",
    },
    {
      id: "included",
      q: "What's included in your service?",
      a: "Space planning, design development, material and furniture sourcing, on-site execution, and project management, all under one roof, managed by a single account manager.",
    },
    {
      id: "sourcing",
      q: "Do you source materials internationally?",
      a: "Yes. Our sourcing network includes furniture houses, workshops, and ateliers well beyond what's available locally, giving every project access to a wider range of materials and pieces.",
    },
    {
      id: "after-handover",
      q: "What happens after the project is handed over?",
      a: "Our relationship continues well past the final walkthrough. If something needs attention months later, you're speaking to the same person who managed your project from day one.",
    },
    {
      id: "minimum",
      q: "Is there a minimum project size you take on?",
      a: "We work on everything from single rooms to full homes and large commercial spaces. The best way to know if a project is the right fit is a short initial conversation.",
    },
  ],
} as const;

/* ------------------------------------------------------ project facts ---- */

/* The four numbers the studio is measured by, from the content deck. Each card
   sets the figure as its display label and the detail underneath, and the row
   drifts left to right as the section scrolls (see ProjectFacts.tsx). */
export const projectFacts = {
  strap: "Delivered, not just promised",
  lead: "Fifteen years of consultancy, turnkey solutions and furniture, across more than five hundred projects.",
  close: "Every number here reflects a project delivered, not just promised.",
  items: [
    {
      id: "projects",
      index: "01",
      label: "500+",
      value:
        "Projects successfully delivered across consultancy, turnkey solutions and furniture.",
    },
    {
      id: "clients",
      index: "02",
      label: "300+",
      value: "Clients worldwide, across residential, commercial and hospitality work.",
    },
    {
      id: "experience",
      index: "03",
      label: "15+",
      value: "Years of industry experience, carried into every brief we take on.",
    },
    {
      id: "team",
      index: "04",
      label: "50+",
      value: "Professional consultants, designers and architects working under one studio.",
    },
  ],
};

/* ----------------------------------------------------------------- cta ---- */

export const callToAction = {
  lead: "A short call is usually enough to know if we're the right fit.",
  title: ["Let's", "talk."],
  caption: "Have a question for us?",
  cta: { label: "Book a consultation", href: "#book-a-call" },
  image: "/images/cta-render-21.webp",
} as const;

/* -------------------------------------------------------------- footer ---- */

/* Head Field Solutions' own offices and lines, as supplied. The big number is
   set apart from its region tag so it keeps the reference's single nowrap
   line at display scale. */
export const footer = {
  toTop: "To top",
  strap: "Come say hello at our Dubai studio.",
  phone: "+971 52 241 9949",
  phoneRegion: "(UAE)",
  phoneHref: "tel:+971522419949",
  reach: [{ label: "info@headfield.com", href: "mailto:info@headfield.com" }],
  /* the two offices again, as the foot of the panel */
  bottomLeft: {
    label: "Corporate headquarters",
    lines: ["Head Field Solutions Pvt. Ltd.", "Lajpat Nagar II New Delhi – 110024"],
  },
  bottomRight: {
    label: "Branch offices",
    lines: ["Head Field Solutions Pvt. Ltd.", "B-73, Sector -57 NOIDA - 201 301 (UP)"],
  },
} as const;

