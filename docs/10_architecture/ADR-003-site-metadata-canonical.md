# ADR-003: Site-wide canonical URLs and social metadata

**Status**: Accepted
**Date**: 2026-06-15
**Scope**: SCOPE-002 (Configure retreatyourself.network as main website domain)
**Context7**: `/vercel/next.js` — App Router Metadata API (`metadataBase`, `alternates.canonical`, `openGraph`, `twitter`); relative metadata URLs resolve against `metadataBase`; explicit absolute URLs override it.

## Context

The platform is served from a **single canonical domain, `retreatyourself.network`**, while the cPanel account also hosts the parked domains `retreatyourself.host`, `.exchange`, and `.expert` (legacy/role redirects are tracked under SCOPE-003/SCOPE-004). For `.network` to be the *main* website domain in the SEO/social sense, every page must:

1. Declare a **canonical URL** on `.network`, so search engines consolidate ranking signals and never index a parked domain or a query-string duplicate.
2. Emit **absolute** Open Graph / Twitter tags on `.network`, so link previews (the team shares heavily over WhatsApp) render correctly — social scrapers cannot resolve relative image paths.

Before this change, the root layout exported only `title` + `description`. There were **no canonical tags anywhere**, and Open Graph existed **only** on `/retreat/[slug]`, where absolute URLs were hand-built by a local `absoluteUrlForOg()` helper duplicating the mail-template origin logic.

**Self-hosting caveat:** Next.js's *default* `metadataBase` fallback resolves to `VERCEL_PROJECT_PRODUCTION_URL` in production or `http://localhost:3000` otherwise (see `resolve-url.ts`). This app runs on **cPanel/Passenger, not Vercel**, so those `VERCEL_*` variables do not exist — without an explicit `metadataBase`, every absolute metadata URL would fall back to `localhost`. We therefore **must** set `metadataBase` ourselves.

## Decision

1. **Set `metadataBase` once in the root layout** ([`src/app/layout.tsx`](../../src/app/layout.tsx)) from the public site URL:

   ```ts
   const siteUrl =
     process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/+$/, "") ||
     process.env.APP_URL?.trim()?.replace(/\/+$/, "") ||
     "https://retreatyourself.network"; // self-hosted fallback (no VERCEL_* vars)

   export const metadata: Metadata = {
     metadataBase: new URL(siteUrl),
     alternates: { canonical: "/" },
     openGraph: { type: "website", siteName, url: "/", locale: "en_US", images: [defaultShareImage], /* … */ },
     twitter: { card: "summary_large_image", images: [defaultShareImage.url], /* … */ },
   };
   ```

   `NEXT_PUBLIC_APP_URL` is the **primary** source (it is build-time inlined and available to client + server); `APP_URL` is an optional server-only override; the literal `.network` is the last-resort fallback so the value is never `localhost` in production. The committed [`.env.public`](../../.env.public) sets `NEXT_PUBLIC_APP_URL=https://retreatyourself.network`, which the CI build bakes in.

2. **Use relative metadata URLs everywhere.** `metadataBase` cascades to every route's `generateMetadata`, so per-route metadata returns **relative** paths (`canonical: "/retreat/foo"`, `images: ["/images/x.jpg"]`) and Next absolutizes them against `metadataBase`. Absolute URLs (e.g. Supabase storage links) are passed through unchanged.

3. **Per-route canonical on dynamic pages.** [`src/app/retreat/[slug]/page.tsx`](../../src/app/retreat/[slug]/page.tsx) sets `alternates.canonical` and `openGraph.url` to `/retreat/{slug}` and `openGraph.type: "article"`. The hand-rolled `absoluteUrlForOg()` / `publicSiteOrigin()` helpers were **removed** — `metadataBase` replaces them.

4. **Default share image** is `/images/hero-meditation.jpg` (brand photo) until a purpose-built 1200×630 OG image or a generated `opengraph-image.tsx` is added.

## Consequences

- Every route now emits an absolute `.network` `<link rel="canonical">` plus Open Graph + Twitter tags. Validated live in production (release `ad4a195`, 2026-06-15) via `curl https://retreatyourself.network/` and `…/retreat/[slug]`.
- Adding metadata to a new route requires only relative URLs; no per-file origin plumbing.
- **`metadataBase` must stay set** — if it is ever removed, self-hosted builds silently fall back to `localhost` URLs in all tags.
- Changing the canonical domain requires updating `NEXT_PUBLIC_APP_URL` in `.env.public` **and a rebuild** (the value is build-time inlined).
- A dedicated OG share image (or `opengraph-image` route) is a recommended follow-up for better preview cards.
- Mail link origin ([`src/lib/mail/transactional-templates.ts`](../../src/lib/mail/transactional-templates.ts) `getPublicBaseUrl`) intentionally remains separate — it runs server-side for emails, outside the Metadata API.

## References

- [`src/app/layout.tsx`](../../src/app/layout.tsx) — `metadataBase`, default `openGraph`/`twitter`, `alternates.canonical`
- [`src/app/retreat/[slug]/page.tsx`](../../src/app/retreat/[slug]/page.tsx) — per-route canonical + `og:url`
- [`.env.public`](../../.env.public) — `NEXT_PUBLIC_APP_URL`
- Next.js Metadata API (`generate-metadata`, `metadataBase` URL composition) via Context7 `/vercel/next.js`
