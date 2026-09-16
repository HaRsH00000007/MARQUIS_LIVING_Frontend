"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { faq } from "@/lib/content";
import { SplitReveal } from "../ui/Reveal";
import styles from "./Faq.module.css";

/** Four dots when the row is closed, a cross when it is open. */
function Mark({ open }: { open: boolean }) {
  return (
    <span className={styles.mark} aria-hidden>
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        {open ? (
          <>
            <path d="M3 3 13 13" />
            <path d="M13 3 3 13" />
          </>
        ) : (
          <g fill="currentColor" stroke="none">
            <circle cx="5" cy="5" r="1.35" />
            <circle cx="11" cy="5" r="1.35" />
            <circle cx="5" cy="11" r="1.35" />
            <circle cx="11" cy="11" r="1.35" />
          </g>
        )}
      </svg>
    </span>
  );
}

/**
 * The questions that come before a first conversation. A photograph holds the
 * left third and the answers stack beside it, one open at a time — the first
 * already open, so the section never arrives as a wall of closed rows.
 */
export function Faq() {
  const uid = useId();
  const [open, setOpen] = useState<string | null>(faq.items[0].id);

  return (
    <section
      data-theme="light"
      data-canvas="cream"
      className={`section bleed ${styles.section}`}
      aria-labelledby="faq-title"
    >
      <div className="container">
        <h2 id="faq-title" className={`h2 a-center ${styles.title}`}>
          <SplitReveal mode="word">{faq.title}</SplitReveal>
        </h2>

        <div className={styles.grid}>
          <figure className={styles.figure}>
            <Image
              src={faq.image}
              alt={faq.alt}
              fill
              sizes="(max-width: 991px) 100vw, 31vw"
              className={styles.img}
            />
          </figure>

          <dl className={styles.list}>
            {faq.items.map((item) => {
              const isOpen = open === item.id;
              const panelId = `${uid}-${item.id}`;
              return (
                <div key={item.id} className={styles.row}>
                  <dt>
                    <button
                      type="button"
                      className={styles.trigger}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : item.id)}
                    >
                      <span className={`h5 ${styles.q}`}>{item.q}</span>
                      <Mark open={isOpen} />
                    </button>
                  </dt>
                  <dd id={panelId} className={styles.panel} data-open={isOpen ? "" : undefined}>
                    <div className={styles.panelInner}>
                      <p className={`p1 ${styles.answer}`}>{item.a}</p>
                    </div>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
