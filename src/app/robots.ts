import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/metadata";

// Only the production deployment may be indexed. Preview and branch deployments stay closed.
export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV !== "production") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/operator-listing", "/design", "/media-workflow-preview"] }],
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
