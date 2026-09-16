"use client";

import { useEffect, useState } from "react";
import { cookies } from "@/lib/content";
import styles from "./CookieConsent.module.css";

const KEY = "era-cookie-consent";

/** The reference's consent card: a cream panel with the word "Cookies" set in
 *  the accent script, bleeding past the panel edge. */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Read after the first paint: localStorage is client-only, and the card is
    // meant to animate in a beat after the page settles anyway.
    const id = requestAnimationFrame(() => {
      try {
        if (!localStorage.getItem(KEY)) setVisible(true);
      } catch {
        /* storage blocked — stay hidden rather than nagging on every render */
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const decide = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className={`${styles.card} theme_on-light`} aria-label="Cookie consent">
      <span className={`a2 ${styles.script}`} aria-hidden>
        {cookies.title}
      </span>
      <p className={`l2 ${styles.body}`}>{cookies.body}</p>
      <div className={styles.actions}>
        <button type="button" className="l1" onClick={() => decide("accepted")}>
          <u>{cookies.accept}</u>
        </button>
        <span className="l1 muted" aria-hidden>
          /
        </span>
        <button type="button" className="l1" onClick={() => decide("declined")}>
          <u>{cookies.decline}</u>
        </button>
      </div>
    </aside>
  );
}
