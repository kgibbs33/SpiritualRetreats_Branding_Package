import { SITE_CONFIG } from "@/config/site";

/** Returns the canonical URL: https://lightpathretreats.com/<path> */
export function canonicalUrl(path: string): string {
  const base = SITE_CONFIG.canonical.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
