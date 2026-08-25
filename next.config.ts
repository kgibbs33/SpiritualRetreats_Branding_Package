import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { NextConfig } from "next";

/**
 * Load committed `.env.public` before Next’s own env merge so local `.env.local`
 * can override. Does not overwrite keys already set (e.g. CI/host).
 */
function loadEnvPublic(): void {
  const filePath = join(process.cwd(), ".env.public");
  if (!existsSync(filePath)) return;

  const raw = readFileSync(filePath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    // Only inject committed client-safe vars; secrets belong in `.env.local`.
    if (!key.startsWith("NEXT_PUBLIC_")) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] !== undefined) continue;
    process.env[key] = val;
  }
}

loadEnvPublic();

const isDev = process.env.NODE_ENV === "development";

const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    unoptimized: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Deploy-Version", value: process.env.DEPLOY_ID ?? "local" },
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/discover", destination: "/retreat-listings", permanent: true },
      { source: "/find-your-path", destination: "/retreat-discovery-form", permanent: true },
      { source: "/create", destination: "/make-your-retreat", permanent: true },
      { source: "/facilitators", destination: "/facilitators-portal", permanent: true },
      { source: "/about/how-it-works", destination: "/why-work-with-us", permanent: true },
      { source: "/how-it-works", destination: "/why-work-with-us", permanent: true },
    ];
  },
};

export default nextConfig;
