"use client";

import { createElement, type ElementType, type ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";
import { stagger } from "@/lib/motion";

type Mode = "word" | "char" | "line";

/**
 * How each split piece arrives.
 *  - `rise` — translates up out of an overflow-hidden mask (body copy, labels)
 *  - `fade` — fades in place, no mask (the hero wordmark: the reference's
 *    display headings have no clipping edge, the letters simply resolve
 *    left-to-right)
 */
type Motion = "rise" | "fade";

interface SplitProps {
  children: string;
  /** `word` and `char` split display headings; `line` masks whole lines. */
  mode?: Mode;
  as?: ElementType;
  className?: string;
  /** Seconds added before the first item starts. */
  delay?: number;
  /** Seconds between consecutive items. */
  step?: number;
  /** Reveal on mount instead of on viewport entry (see useReveal). */
  immediate?: boolean;
  /** Drive the reveal from a caller-owned signal instead of viewport entry. */
  revealed?: boolean;
  motion?: Motion;
}

/**
 * Reimplements the reference's SplitText-driven reveal: text is broken into
 * words, characters or lines, each wrapped in an overflow-hidden mask, and
 * translated up into place on viewport entry. `\n` forces a line break.
 */
export function SplitReveal({
  children,
  mode = "word",
  as = "span",
  className,
  delay = 0,
  step,
  immediate = false,
  revealed,
  motion = "rise",
}: SplitProps) {
  const ref = useReveal<HTMLElement>(immediate, revealed);
  const maskClass = motion === "fade" ? "split-plain" : "split-word-mask";
  const lines = children.split("\n");
  let index = 0;

  const content: ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) content.push(<br key={`br-${lineIndex}`} />);

    if (mode === "line") {
      const i = index++;
      content.push(
        <span className="split-line-mask" key={`l-${lineIndex}`}>
          <span
            className="split-line"
            style={{ "--reveal-delay": `${delay + stagger(i, step ?? 0.08)}s` } as React.CSSProperties}
          >
            {line}
          </span>
        </span>,
      );
      return;
    }

    line.split(" ").forEach((word, wordIndex, all) => {
      const key = `${lineIndex}-${wordIndex}`;
      if (mode === "char") {
        content.push(
          <span className={maskClass} key={key}>
            <span className="split-word">
              {Array.from(word).map((char, charIndex) => {
                const i = index++;
                return (
                  <span
                    className="split-char"
                    key={charIndex}
                    style={
                      { "--reveal-delay": `${delay + stagger(i, step ?? 0.028)}s` } as React.CSSProperties
                    }
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          </span>,
        );
      } else {
        const i = index++;
        content.push(
          <span className={maskClass} key={key}>
            <span
              className="split-word"
              style={{ "--reveal-delay": `${delay + stagger(i, step ?? 0.05)}s` } as React.CSSProperties}
            >
              {word}
            </span>
          </span>,
        );
      }
      if (wordIndex < all.length - 1) content.push(<span key={`sp-${key}`}> </span>);
    });
  });

  return createElement(
    as,
    { ref, className, "data-reveal": motion },
    content,
  );
}

interface AccentProps {
  children: string;
  className?: string;
  delay?: number;
  step?: number;
  immediate?: boolean;
}

/**
 * The script "write-on" used for `Dubai`, `Marquis Living` and `yours`.
 *
 * Measured from a screen recording of the reference: the word starts at a wide
 * tracking and collapses to zero over ~0.7s while the characters fade in
 * left-to-right, so the glyphs appear to draw together — the later a letter
 * sits in the word, the further it travels.
 */
export function AccentReveal({
  children,
  className,
  delay = 0,
  step = 0.035,
  immediate = false,
}: AccentProps) {
  const ref = useReveal<HTMLElement>(immediate);
  return (
    <span
      ref={ref}
      className={className}
      data-accent-reveal=""
      style={{ "--reveal-delay": `${delay}s` } as React.CSSProperties}
    >
      {Array.from(children).map((char, i) => (
        <span
          key={i}
          className="accent-char"
          style={{ "--reveal-delay": `${delay + stagger(i, step, 0.5)}s` } as React.CSSProperties}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

interface FadeProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
  immediate?: boolean;
}

/** Simple rise-and-fade used for images, cards and non-text blocks. */
export function FadeIn({
  children,
  as = "div",
  className,
  delay = 0,
  style,
  immediate = false,
}: FadeProps) {
  const ref = useReveal<HTMLElement>(immediate);
  return createElement(
    as,
    {
      ref,
      className,
      "data-fade": "",
      style: { ...style, "--reveal-delay": `${delay}s` } as React.CSSProperties,
    },
    children,
  );
}
