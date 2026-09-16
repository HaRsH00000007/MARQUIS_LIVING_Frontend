import Link from "next/link";
import { PageHead } from "@/components/PageHead";
import { Footer } from "@/components/sections/Footer";

export default function NotFound() {
  return (
    <>
      <PageHead
        eyebrow="404"
        title="Page not found"
        lead="The page you were looking for has moved or no longer exists."
      />
      <section data-theme="light" className="section" style={{ padding: "var(--u-160) 0" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <Link href="/" className="l1">
            <u>Return to the homepage</u>
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
