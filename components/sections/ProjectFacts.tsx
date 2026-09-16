import { projectFacts } from "@/lib/content";
import { SplitReveal } from "../ui/Reveal";
import styles from "./ProjectFacts.module.css";

/**
 * The four measures the place is composed to.
 *
 * This was an accordion of four closed rows, which left most of a screen of
 * cream empty and put the copy a click away. Nothing here is long enough to
 * need hiding, so it is all on the page: a two-by-two field of display-scale
 * labels, each with its paragraph under it, between a strapline above and a
 * closing line below. No state, no interaction — a server component.
 */
export function ProjectFacts() {
  return (
    <section data-theme="light" data-canvas="cream" className={`section bleed clip ${styles.section}`}>
      <div className="container">
        <p className="l1 a-center">
          <SplitReveal mode="line">{projectFacts.strap}</SplitReveal>
        </p>

        <div className="u-48" />
        <div className="divider">
          <span className="line-v" />
        </div>
        <div className="u-48" />

        <p className={`p1 a-center ${styles.lead}`}>
          <SplitReveal mode="line">{projectFacts.lead}</SplitReveal>
        </p>

        <ul className={styles.list}>
          {projectFacts.items.map((item) => (
            <li key={item.id} className={styles.row}>
              <span className={`l1 reg ${styles.index}`}>{item.index}</span>
              <h3 className={`h4 ${styles.label}`}>{item.label}</h3>
              <p className={`p1 ${styles.body}`}>{item.value}</p>
            </li>
          ))}
        </ul>

        <p className={`l1 reg a-center ${styles.close}`}>{projectFacts.close}</p>
      </div>
    </section>
  );
}
