"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { site } from "@/lib/content";
import { CloseIcon } from "./ui/Icons";
import { ButtonPill } from "./ui/Buttons";
import styles from "./ModalProvider.module.css";

type ModalId = "book" | null;

/* matches the closing keyframes' length in ModalProvider.module.css */
const CLOSE_MS = 650;

interface Ctx {
  open: (id: Exclude<ModalId, null>) => void;
  close: () => void;
  current: ModalId;
}

const ModalContext = createContext<Ctx>({
  open: () => {},
  close: () => {},
  current: null,
});

export const useModal = () => useContext(ModalContext);

/**
 * Hosts the "Book a call" dialog behind the reference's `data-modal-cta-btn`
 * triggers. The reference posts to a Webflow form endpoint we have no access
 * to, so the form validates and confirms locally instead of submitting.
 */
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<ModalId>(null);
  const [sent, setSent] = useState(false);
  /* the dialog stays mounted while it plays its closing animation */
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const close = useCallback(() => {
    if (closeTimer.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setClosing(true);
    closeTimer.current = window.setTimeout(
      () => {
        closeTimer.current = undefined;
        setCurrent(null);
        setClosing(false);
        setSent(false);
      },
      reduce ? 0 : CLOSE_MS,
    );
  }, []);
  const open = useCallback((id: Exclude<ModalId, null>) => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
    setClosing(false);
    setCurrent(id);
  }, []);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [current, close]);

  const value = useMemo(() => ({ open, close, current }), [open, close, current]);

  return (
    <ModalContext.Provider value={value}>
      {children}

      {current === "book" && (
        <div className={`${styles.backdrop} ${closing ? styles.closing : ""}`} onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-a-call-title"
            className={`${styles.dialog} ${closing ? styles.closing : ""} theme_on-light`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.close}
              onClick={close}
              aria-label="Close dialog"
            >
              <CloseIcon />
            </button>
            <div className={styles.content}>
              <h2 id="book-a-call-title" className="h4">
                Book a call
              </h2>
              <div className="u-16" />
              <p className="p1 muted">
                A short conversation is enough to understand which apartment fits your usecase.
                Leave your details and the sales team will call you back.
              </p>
              <div className="u-32" />

              {sent ? (
                <p className="l1" role="status">
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
                    <span className="l2">Phone</span>
                    <input className="p1" type="tel" name="phone" required autoComplete="tel" />
                  </label>
                  <label className={styles.field}>
                    <span className="l2">Email</span>
                    <input className="p1" type="email" name="email" required autoComplete="email" />
                  </label>
                  <div className="u-16" />
                  <ButtonPill label="Request a call" type="submit" />
                </form>
              )}

              <div className="u-32" />
              <a href={site.phoneHref} className="l1">
                {site.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
