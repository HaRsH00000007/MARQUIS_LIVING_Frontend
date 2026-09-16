import { PageHead } from "./PageHead";
import { Footer } from "./sections/Footer";
import styles from "./LegalPage.module.css";

interface Props {
  title: string;
  lead: string;
  sections: { heading: string; body: string }[];
}

/** Shared shell for the privacy-policy and terms-of-use pages. */
export function LegalPage({ title, lead, sections }: Props) {
  return (
    <>
      <PageHead eyebrow="Legal" title={title} lead={lead} />
      <section data-theme="light" data-canvas="cream" className={`section bleed ${styles.section}`}>
        <div className={`container ${styles.body}`}>
          {sections.map((s) => (
            <article key={s.heading} className={styles.block}>
              <h2 className="h5">{s.heading}</h2>
              <div className="u-16" />
              <p className="p1 muted">{s.body}</p>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}
