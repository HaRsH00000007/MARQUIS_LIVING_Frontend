import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/content";

export const metadata: Metadata = { title: `Privacy policy — ${site.name}` };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      lead="How ERA Residence collects, uses and protects the information you share with us."
      sections={[
        {
          heading: "Information we collect",
          body: "We collect the name, telephone number and email address you provide when requesting a call or contacting the sales team, together with anonymous usage statistics from this website.",
        },
        {
          heading: "How we use it",
          body: "Your details are used solely to respond to your enquiry and to share information about availability at ERA Residence. We do not sell or rent personal data to third parties.",
        },
        {
          heading: "Cookies",
          body: "This website stores a single preference recording your cookie choice. No analytics or advertising cookies are set unless you accept them.",
        },
        {
          heading: "Your rights",
          body: "You may request access to, correction of, or deletion of your personal data at any time by contacting the sales office.",
        },
      ]}
    />
  );
}
