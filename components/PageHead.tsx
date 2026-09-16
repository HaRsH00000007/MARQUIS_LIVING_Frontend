import { SplitReveal } from "./ui/Reveal";
import styles from "./PageHead.module.css";

interface Props {
  eyebrow: string;
  title: string;
  lead: string;
}

/** Shared masthead for the secondary pages. */
export function PageHead({ eyebrow, title, lead }: Props) {
  return (
    <section data-theme="dark" data-canvas="plum" className={`section bleed theme_on-color ${styles.head}`}>
      <div className="container">
        <p className="l2 a-center muted">{eyebrow}</p>
        <div className="u-48" />
        <h1 className="h1 a-center">
          <SplitReveal mode="char">{title}</SplitReveal>
        </h1>
        <div className="u-48" />
        <p className={`p1 a-center ${styles.lead}`}>{lead}</p>
      </div>
    </section>
  );
}
