import type { Metadata } from "next";
import { PageHead } from "@/components/PageHead";
import { Footer } from "@/components/sections/Footer";
import { ContactPanel } from "@/components/sections/ContactPanel";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: `Contact — ${site.name}`,
  description: `Speak to the ERA Residence sales team. ${site.address}`,
};

export default function ContactPage() {
  return (
    <>
      <PageHead
        eyebrow="Get in touch"
        title="Contact"
        lead="A short conversation is enough to understand which apartment fits your usecase."
      />
      <ContactPanel />
      <Footer />
    </>
  );
}
