import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/metadata";
import { listPublishedRetreats } from "@/lib/retreats/queries";
import { isDemoRetreatHref } from "@/lib/retreats/demo-records";

export const revalidate = 3600;

const STATIC_PATHS = [
  "/", "/retreat-listings", "/retreat-planners", "/find-a-venue", "/find-a-facilitator", "/facilitator-directory",
  "/how-it-works", "/about", "/about/our-story", "/contact", "/education", "/partner-with-us", "/join-our-community",
  "/terms", "/privacy", "/cookies", "/retreat-intake-form", "/retreat-discovery-form", "/venue-application",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({ url: canonicalUrl(p), changeFrequency: "weekly", priority: p === "/" ? 1 : 0.6 }));
  try {
    const res = await listPublishedRetreats({});
    for (const c of res.cards) {
      if (!c.href || isDemoRetreatHref(c.href)) continue;
      entries.push({ url: canonicalUrl(c.href), changeFrequency: "weekly", priority: 0.7 });
    }
  } catch {
    // Static pages only if the listings query fails.
  }
  return entries;
}
