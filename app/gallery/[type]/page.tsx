import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ParallaxGallery } from "@/components/gallery/ParallaxGallery";
import { galleryCategories, site, type GalleryCategory } from "@/lib/content";

type Props = { params: Promise<{ type: string }> };

const isCategory = (t: string): t is GalleryCategory => t in galleryCategories;

export function generateStaticParams() {
  return Object.keys(galleryCategories).map((type) => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  if (!isCategory(type)) return {};
  const meta = galleryCategories[type];
  return { title: `${meta.title} gallery — ${site.name}`, description: meta.lead };
}

/** The gallery each "Explore …" button opens: /gallery/residential and so on. */
export default async function GalleryPage({ params }: Props) {
  const { type } = await params;
  if (!isCategory(type)) notFound();
  return <ParallaxGallery category={type} />;
}
