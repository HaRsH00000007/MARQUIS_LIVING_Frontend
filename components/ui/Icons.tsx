/** Icon set traced from the reference's inline SVGs (24 / 16 / 48 unit grids). */

type P = { className?: string };

const base = { width: "100%", height: "100%", fill: "none", xmlns: "http://www.w3.org/2000/svg" } as const;

export const ArrowRight = ({ className }: P) => (
  <svg {...base} viewBox="0 0 16 16" className={className} aria-hidden>
    <path
      d="M8.6 3.3 13.3 8 8.6 12.7l-.7-.7 3.5-3.5H2.7v-1h8.7L7.9 4z"
      fill="currentColor"
    />
  </svg>
);

export const ArrowLeft = ({ className }: P) => (
  <svg {...base} viewBox="0 0 16 16" className={className} aria-hidden>
    <path
      d="M7.4 3.3 2.7 8l4.7 4.7.7-.7L4.6 8.5h8.7v-1H4.6L8.1 4z"
      fill="currentColor"
    />
  </svg>
);

/** The long horizontal arrow used by the scroll indicator and "to top" link. */
export const ArrowLong = ({ className }: P) => (
  <svg {...base} viewBox="0 0 48 12" className={className} aria-hidden>
    <path
      d="M7.365 3c-.261.547-.514 1.026-.758 1.436-.261.41-.514.752-.758 1.026H45v1.077H5.849c.244.29.497.64.758 1.05.244.411.497.881.758 1.411h-.915C5.352 7.752 4.202 6.83 3 6.23v-.461C4.202 5.188 5.352 4.265 6.45 3z"
      fill="currentColor"
    />
  </svg>
);

export const PlusIcon = ({ className }: P) => (
  <svg {...base} viewBox="0 0 16 16" className={className} aria-hidden>
    <path
      d="M8 2.666a.667.667 0 0 1 .667.668v4h4a.667.667 0 1 1 0 1.333h-4v4a.667.667 0 1 1-1.334 0v-4h-4a.667.667 0 0 1 0-1.333h4v-4A.667.667 0 0 1 8 2.666"
      fill="currentColor"
    />
  </svg>
);

export const CloseIcon = ({ className }: P) => (
  <svg {...base} viewBox="0 0 16 16" className={className} aria-hidden>
    <path
      d="m8 7.06 4.24-4.24.94.94L8.94 8l4.24 4.24-.94.94L8 8.94l-4.24 4.24-.94-.94L7.06 8 2.82 3.76l.94-.94z"
      fill="currentColor"
    />
  </svg>
);

export const MenuIcon = ({ className }: P) => (
  <svg {...base} viewBox="0 0 24 24" className={className} aria-hidden>
    <path d="M13.5 19a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" fill="currentColor" />
    <path d="M13.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" fill="currentColor" />
    <path d="M13.5 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" fill="currentColor" />
  </svg>
);
