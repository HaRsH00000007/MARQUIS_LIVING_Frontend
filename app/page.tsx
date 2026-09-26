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
import { HomeScrollMemory } from "@/components/HomeScrollMemory";
import { site } from "@/lib/content";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: site.title,
  description: site.description,
  inLanguage: "en",
  mainEntity: {
    "@type": "InteriorDesignService",
    name: site.name,
    description:
      "A bespoke interior design studio in Dubai, delivering consultancy, turnkey solutions and furniture across residential, commercial and hospitality projects.",
    /* TODO: no street address for the Dubai studio in the content deck — fill
       `streetAddress` / `postalCode` in once supplied. */
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    telephone: site.phone,
    areaServed: "Dubai, United Arab Emirates",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeScrollMemory />
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
