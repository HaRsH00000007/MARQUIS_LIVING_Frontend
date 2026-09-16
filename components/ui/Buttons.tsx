"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Buttons.module.css";

interface PillProps {
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}

/**
 * The reference's `[hover-btn]` pill: the label sits above a background layer
 * that wipes up from `inset: 100% 0 auto` to `0`, its radius collapsing from
 * 100% to 0 at the same time, while the label colour inverts. The label is
 * duplicated so the second copy can ride up behind the wipe.
 */
export function ButtonPill({ label, href, onClick, className, type = "button" }: PillProps) {
  const inner = (
    <>
      <span aria-hidden className={styles.pillBg} data-hover="bg" />
      <span className={styles.pillLabel}>
        <span className="l2" data-hover="text">
          {label}
        </span>
      </span>
    </>
  );

  const cls = [styles.pill, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={cls} hover-btn="" aria-label={label}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} hover-btn="" onClick={onClick} aria-label={label}>
      {inner}
    </button>
  );
}

interface CircleProps {
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/** The large circular CTA — label wraps in two lines inside a ringed disc. */
export function ButtonCircle({ label, href, onClick, className }: CircleProps) {
  const inner = (
    <>
      <span aria-hidden className={styles.circleBg} data-hover="bg" />
      <span className={`l2 ${styles.circleLabel}`} data-hover="text">
        {label}
      </span>
    </>
  );

  const cls = [styles.circle, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={cls} hover-btn="" aria-label={label}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} hover-btn="" onClick={onClick} aria-label={label}>
      {inner}
    </button>
  );
}

interface NavItemProps {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "l2" | "h6";
  ariaLabel?: string;
}

/**
 * `[hover-nav-item]`: two stacked copies of the label. On hover the first
 * slides out upward while the second slides in from below.
 */
export function NavItem({
  label,
  href,
  onClick,
  className,
  size = "l2",
  ariaLabel,
}: NavItemProps) {
  const cls = [styles.navItem, className].filter(Boolean).join(" ");
  const inner = (
    <span className={styles.navItemStack}>
      <span className={styles.navItemLine} data-hover="text">
        <span className={size}>{label}</span>
      </span>
      <span className={`${styles.navItemLine} ${styles.navItemLine2}`} data-hover="text" aria-hidden>
        <span className={size}>{label}</span>
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={cls} hover-nav-item="" aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} hover-nav-item="" onClick={onClick} aria-label={ariaLabel}>
      {inner}
    </button>
  );
}
