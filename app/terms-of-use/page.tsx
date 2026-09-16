import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: `Terms of use — ${site.name}` };

export default function TermsOfUsePage() {
  return (
    <LegalPage
      title="Terms of use"
      lead="The terms on which this website and the information it contains are made available."
      sections={[
        {
          heading: "Indicative information",
          body: "Renders, floor areas and specifications shown on this website are indicative and may change during construction. They do not form part of any offer or contract.",
        },
        {
          heading: "Intellectual property",
          body: "All imagery, text and design on this website remain the property of their respective owners and may not be reproduced without permission.",
        },
        {
          heading: "Availability",
          body: "We aim to keep this website available and accurate but give no warranty that it will be uninterrupted or error-free.",
        },
      ]}
    />
  );
}
