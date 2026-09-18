import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

const routes = [
  "",
  "/apartments",
  "/gallery/residential",
  "/gallery/commercial",
  "/gallery/hospitality",
  "/contact",
  "/privacy-policy",
  "/terms-of-use",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
