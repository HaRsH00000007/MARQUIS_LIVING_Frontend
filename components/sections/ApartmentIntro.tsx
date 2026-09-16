import { apartmentIntro } from "@/lib/content";
import { EraMark } from "../ui/EraMark";
import { SplitReveal } from "../ui/Reveal";
import styles from "./ApartmentIntro.module.css";

/** Centred lead statement between the apartment cards and the amenities. */
export function ApartmentIntro() {
  return (
    <section data-theme="dark" data-canvas="sky" className={`section bleed clip theme_on-brand ${styles.section}`}>
      <div className="container">
        <div className="divider">
          <span className="line-v" />
        </div>
        <div className="u-48" />

        <p className="l1 a-center">
          <SplitReveal mode="line">{apartmentIntro.strap}</SplitReveal>
        </p>

        <div className="u-160" />

        <div className={styles.leadWrap}>
          <p className="h4 a-center">
            <SplitReveal mode="word">{apartmentIntro.lead}</SplitReveal>
          </p>
        </div>

        <div className="u-96" />
        <EraMark className={styles.mark} />
      </div>
    </section>
  );
}
