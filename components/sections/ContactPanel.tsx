"use client";

import { useState } from "react";
import { site } from "@/lib/content";
import { ButtonPill } from "../ui/Buttons";
import styles from "./ContactPanel.module.css";

/**
 * The reference posts this form to a Webflow endpoint we have no access to, so
 * the recreation validates and confirms locally instead of submitting.
 */
export function ContactPanel() {
  const [sent, setSent] = useState(false);

  return (
    <section data-theme="light" data-canvas="cream" className={`section bleed ${styles.section}`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.details}>
          <p className="l2 muted">{site.addressLabel}</p>
          <div className="u-8" />
          <a href={site.mapHref} target="_blank" rel="noreferrer" className="h5">
            {site.address}
          </a>
          <div className="u-48" />
          <p className="l2 muted">Telephone</p>
          <div className="u-8" />
          <a href={site.phoneHref} className="h5">
            {site.phone}
          </a>
        </div>

        {sent ? (
          <p className="h5" role="status">
            Thank you — we will be in touch shortly.
          </p>
        ) : (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <label className={styles.field}>
              <span className="l2">Name</span>
              <input className="p1" type="text" name="name" required autoComplete="name" />
            </label>
            <label className={styles.field}>
              <span className="l2">Email</span>
              <input className="p1" type="email" name="email" required autoComplete="email" />
            </label>
            <label className={styles.field}>
              <span className="l2">Message</span>
              <textarea className="p1" name="message" rows={4} />
            </label>
            <div className="u-16" />
            <ButtonPill label="Send" type="submit" />
          </form>
        )}
      </div>
    </section>
  );
}
