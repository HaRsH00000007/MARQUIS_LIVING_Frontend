"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EraBadge } from "./ui/EraMark";
import { NavItem } from "./ui/Buttons";
import { MenuIcon, CloseIcon } from "./ui/Icons";
import { nav, site } from "@/lib/content";
import { useModal } from "./ModalProvider";
import { useLenis, useScrollTo } from "./SmoothScroll";
import { useSectionTheme } from "@/hooks/useSectionTheme";
import styles from "./Header.module.css";

/**
 * Fixed header. Its ink colour follows whichever section is currently beneath
 * it — sections declare `data-theme="light" | "dark"` and `useSectionTheme`
 * picks the active one — reproducing the reference's per-section nav inversion.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dark = useSectionTheme();
  const { open: openModal } = useModal();
  const lenisRef = useLenis();
  const scrollTo = useScrollTo();
  const router = useRouter();

  /*
   * "Contact" goes to the contact details in the footer. On the home page it
   * glides down to them; from any other page it opens the home page at
   * `#contact`, where the footer picks the hash up and settles there.
   */
  const goToContact = () => {
    setOpen(false);
    if (document.getElementById("contact")) {
      scrollTo(document.documentElement.scrollHeight - window.innerHeight);
    } else {
      router.push("/#contact");
    }
  };

  /*
   * With the sheet open the page underneath must not move. `overflow: hidden`
   * alone does not stop Lenis, which drives the scroll itself, so it is paused
   * too.
   */
  useEffect(() => {
    const lenis = lenisRef?.current;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open, lenisRef]);

  // the sheet only exists below 992px; rotating past it must not leave it open
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 992px)");
    const onChange = () => mql.matches && setOpen(false);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  /*
   * Once the page has left the hero's top edge the phone header gets a solid
   * bar (see `.scrolled` in the stylesheet), so copy scrolling underneath can
   * never run through the logo or the menu button.
   */
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <header
        className={[
          styles.header,
          dark ? "theme_on-image" : "theme_on-light",
          scrolled && !open ? styles.scrolled : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Link href="/" className={styles.badge} aria-label={`${site.name} — home`}>
          <EraBadge />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <Link href={nav.gallery.href} className={styles.primary} hover-nav-item="">
            <span className={styles.primaryStack}>
              <span className={styles.primaryLine} data-hover="text">
                <span className="h6 a-right">{nav.gallery.label}</span>
              </span>
              <span
                className={`${styles.primaryLine} ${styles.primaryLine2}`}
                data-hover="text"
                aria-hidden
              >
                <span className="h6 a-right">{nav.gallery.label}</span>
              </span>
            </span>
          </Link>

          <span className={styles.secondary}>
            <NavItem label="Book a call" onClick={() => openModal("book")} ariaLabel="Book a call" />
            <NavItem label="Contact" onClick={goToContact} ariaLabel="Contact" />
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
            <button type="button" className="h3" onClick={goToContact}>
              Contact
            </button>
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
