import { Hero } from "@/components/sections/Hero";
import { BenefitsIntro } from "@/components/sections/BenefitsIntro";
import { Benefits } from "@/components/sections/Benefits";
import { Quote } from "@/components/sections/Quote";
import { Concept } from "@/components/sections/Concept";
import { MasterPlan } from "@/components/sections/MasterPlan";
import { ApartmentTypes } from "@/components/sections/ApartmentTypes";
import { ApartmentIntro } from "@/components/sections/ApartmentIntro";
import { Amenities } from "@/components/sections/Amenities";
import { Interiors } from "@/components/sections/Interiors";
import { Architecture } from "@/components/sections/Architecture";
import { ProjectFacts } from "@/components/sections/ProjectFacts";
import { Book } from "@/components/sections/Book";
import { Faq } from "@/components/sections/Faq";
import { CallToAction } from "@/components/sections/CallToAction";
import { Footer } from "@/components/sections/Footer";
import { site } from "@/lib/content";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: site.title,
  description: site.description,
  inLanguage: "en",
  mainEntity: {
    "@type": "ApartmentComplex",
    name: site.name,
    description:
      "A boutique gated community of 25 residences on Costa del Sol, designed around privacy, wellbeing and timeless Mediterranean living.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Avenida Litoral",
      postalCode: "29680",
      addressLocality: "Estepona",
      addressRegion: "Málaga",
      addressCountry: "ES",
    },
    telephone: site.phone,
    numberOfAccommodationUnits: 25,
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <BenefitsIntro />
      <Benefits />
      <Quote />
      <Concept />
      <MasterPlan />
      <ApartmentTypes />
      <ApartmentIntro />
      <Amenities />
      <Interiors />
      <Architecture />
      <ProjectFacts />
      <Book />
      <Faq />
      <CallToAction />
      <Footer />
    </>
  );
}
