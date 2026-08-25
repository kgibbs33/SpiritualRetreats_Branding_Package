import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Host-based role redirects (SCOPE-003 / SCOPE-004).
 *
 * The cPanel account serves the same Next app on four domains. Only
 * `retreatyourself.network` is canonical; the others are marketing / role
 * entry domains that must 301/308-redirect to a fixed landing page on the
 * canonical domain so they never serve a duplicate full site.
 *
 * This lives in the app (not cPanel "Redirects") on purpose: a cPanel
 * redirect is written into `public_html/.htaccess`, which the deploy
 * pipeline rewrites — so it gets clobbered on every deploy. Keeping the map
 * here makes it versioned, deploy-safe, and path-complete (every path on the
 * source host lands on the destination; the request path is intentionally
 * NOT carried over).
 *
 * See: docs/10_architecture/ADR-004-host-based-role-redirects.md
 *
 * NOTE: `.expert` and `.exchange` destinations are a provisional default
 * (facilitator portal) pending stakeholder confirmation (Andrew) — see ADR-004.
 */
const CANONICAL_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/+$/, "") ||
  "https://retreatyourself.network";

const HOST_REDIRECTS: Record<string, string> = {
  "retreatyourself.host": "/for-retreat-owners", // owners / hosts (SCOPE-003)
  "retreatyourself.expert": "/facilitators-portal", // coaches / experts (SCOPE-004 — PENDING)
  "retreatyourself.exchange": "/facilitators-portal", // facilitators / marketplace (SCOPE-004 — PENDING)
};

/** Resolve the request host (honoring a reverse proxy), normalized: no port, no `www.`. */
function normalizedHost(request: NextRequest): string | null {
  const raw =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!raw) return null;
  return raw.split(",")[0].trim().split(":")[0].toLowerCase().replace(/^www\./, "");
}

const LEGAL_PATHS = ["/privacy", "/terms", "/cookies"];

function isLegalPath(pathname: string): boolean {
  return LEGAL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/** Next.js 16+ convention (replaces `middleware`). */
export function proxy(request: NextRequest) {
  // 1) Host-based role redirects — fixed landing on the canonical domain for
  //    EVERY path on a non-canonical host. Permanent redirect (308 = the App
  //    Router standard; SEO-equivalent to 301).
  const host = normalizedHost(request);
  const target = host ? HOST_REDIRECTS[host] : undefined;
  if (target) {
    return NextResponse.redirect(new URL(target, CANONICAL_ORIGIN), 308);
  }

  // 2) Legal-page gating (unchanged) — only relevant on the canonical host.
  if (request.nextUrl.pathname === "/legal-pages-disabled") {
    return NextResponse.next();
  }

  const legalVisible =
    process.env.NEXT_PUBLIC_LEGAL_PAGES_VISIBLE === "true";

  if (legalVisible || !isLegalPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/legal-pages-disabled";
  url.searchParams.set("_blocked", "1");
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on all routes (so host redirects cover every path) except Next
  // internals and the favicon. The host check short-circuits to `next()` on
  // the canonical domain, so non-redirect hosts are unaffected.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
