import type { Metadata, Viewport } from "next";

import "@/styles/tokens.css";
import "@/styles/typography.css";
import "@/styles/components.css";

import { SmoothScroll } from "@/components/SmoothScroll";
import { PageCanvas } from "@/components/PageCanvas";
import { ModalProvider } from "@/components/ModalProvider";
import { Header } from "@/components/Header";
import { ScrollRail } from "@/components/ScrollRail";
import { Preloader } from "@/components/Preloader";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  icons: { icon: "/favicon.png", apple: "/favicon.png" },
  openGraph: {
    type: "website",
    title: site.title,
    description: site.description,
    siteName: site.name,
    images: [{ url: "/images/hero-day.webp", width: 1600, height: 900, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/images/hero-day.webp"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#260004",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
         * The reference's display and accent faces — `ambroise-francois-std`
         * and `sloop-script-three` — are served from the project's own Adobe
         * Fonts kit. Linking the kit stylesheet is exactly what production
         * does, so the metrics the whole layout is measured against are the
         * real ones: no synthetic squeeze, no substitute-font compensation.
         *
         * It is a render-blocking stylesheet by design. Text that has not
         * painted cannot reflow, which is what keeps CLS at zero here; a
         * `preload`-and-swap arrangement would trade that away for a first
         * paint nobody sees, because the hero is behind the preloader anyway.
         */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/pig8glj.css" />
      </head>
      <body>
        <PageCanvas />
        <SmoothScroll>
          <ModalProvider>
            <Preloader />
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <Header />
            <ScrollRail />
            <main id="main">{children}</main>
            <div className="grain" aria-hidden />
          </ModalProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
