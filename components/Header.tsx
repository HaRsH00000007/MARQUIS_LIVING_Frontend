"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EraBadge } from "./ui/EraMark";
import { NavItem } from "./ui/Buttons";
import { MenuIcon, CloseIcon } from "./ui/Icons";
import { nav, site } from "@/lib/content";
import { useModal } from "./ModalProvider";
import { useSectionTheme } from "@/hooks/useSectionTheme";
import styles from "./Header.module.css";

/**
 * Fixed header. Its ink colour follows whichever section is currently beneath
 * it — sections declare `data-theme="light" | "dark"` and `useSectionTheme`
 * picks the active one — reproducing the reference's per-section nav inversion.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const dark = useSectionTheme();
  const { open: openModal } = useModal();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className={`${styles.header} ${dark ? "theme_on-image" : "theme_on-light"}`}>
        <Link href="/" className={styles.badge} aria-label={`${site.name} — home`}>
          <EraBadge />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <Link href={nav.primary.href} className={styles.primary} hover-nav-item="">
            <span className={styles.primaryStack}>
              <span className={styles.primaryLine} data-hover="text">
                <span className="h6 a-right">
                  Select
                  <br />
                  Gallery
                </span>
              </span>
              <span
                className={`${styles.primaryLine} ${styles.primaryLine2}`}
                data-hover="text"
                aria-hidden
              >
                <span className="h6 a-right">
                  Select
                  <br />
                  Gallery
                </span>
              </span>
            </span>
          </Link>

          <span className={styles.secondary}>
            <NavItem label="Book a call" onClick={() => openModal("book")} ariaLabel="Book a call" />
            <NavItem label="Contact" href="/contact" ariaLabel="Contact" />
          </span>

          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="l2">{open ? "Close" : "Menu"}</span>
            <span className={styles.menuIco}>{open ? <CloseIcon /> : <MenuIcon />}</span>
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={`${styles.sheet} theme_on-color ${open ? styles.sheetOpen : ""}`}
        hidden={!open}
      >
        <ul className={styles.sheetList}>
          <li>
            <Link href={nav.primary.href} className="h3" onClick={() => setOpen(false)}>
              Apartments
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="h3"
              onClick={() => {
                setOpen(false);
                openModal("book");
              }}
            >
              Book a call
            </button>
          </li>
          <li>
            <Link href="/contact" className="h3" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>
        <div className={styles.sheetFoot}>
          <a href={site.phoneHref} className="l1">
            {site.phone}
          </a>
          <p className="l1 reg muted">{site.address}</p>
        </div>
      </div>
    </>
  );
}
