import type { Metadata } from "next";
import { ApartmentTypes } from "@/components/sections/ApartmentTypes";
import { ApartmentIntro } from "@/components/sections/ApartmentIntro";
import { CallToAction } from "@/components/sections/CallToAction";
import { Footer } from "@/components/sections/Footer";
import { PageHead } from "@/components/PageHead";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: `Available apartments — ${site.name}`,
  description:
    "Ground floor, ground floor with basement and penthouse duplex residences from 97 to 243 m².",
};

export default function ApartmentsPage() {
  return (
    <>
      <PageHead
        eyebrow="Availability"
        title="Available apartments"
        lead="Twenty-five residences across three layouts, from single-level ground-floor homes to penthouse duplexes with private rooftop solariums."
      />
      <ApartmentTypes />
      <ApartmentIntro />
      <CallToAction />
      <Footer />
    </>
  );
}
