# ADR-004: Host-based role redirects in `proxy.ts`

**Status**: Accepted
**Date**: 2026-06-15
**Scope**: SCOPE-003 (`.host`), SCOPE-004 (`.expert`, `.exchange`)
**Context7**: `/vercel/next.js` — App Router `proxy.ts` (the Next 16 rename of `middleware`); `NextResponse.redirect(url, 308)` for permanent redirects; `config.matcher`.

## Context

The cPanel account serves the **same Next app** on four domains:

| Domain | Role | Destination |
|--------|------|-------------|
| `retreatyourself.network` | Canonical main site | — (canonical) |
| `retreatyourself.host` | Retreat owners / hosts | `/for-retreat-owners` |
| `retreatyourself.expert` | Coaches / experts | `/facilitators-portal` *(provisional — pending Andrew)* |
| `retreatyourself.exchange` | Facilitators / marketplace | `/facilitators-portal` *(provisional — pending Andrew)* |

Only `.network` is canonical. The other three are marketing / role entry domains that must **permanently redirect to a fixed landing page** on the canonical domain so they never serve a duplicate full site (an SEO and brand problem, and a SCOPE-003 acceptance criterion: "no duplicate full site served on `.host`").

**Why not cPanel "Redirects":** the original `.host` redirect was configured in cPanel, which writes the rule into `public_html/.htaccess` — the exact file the deploy pipeline **rewrites** for the Passenger/Node config. The redirect was silently **clobbered on the next deploy** (2026-06-15), and its "wildcard" option also appended the request path, producing malformed URLs (`…/for-retreat-owners` + `foo/bar`). Infra redirects living outside the repo are fragile here.

## Decision

Implement host-based redirects in the app's **`src/proxy.ts`** (Next 16's `proxy`, formerly `middleware`):

```ts
const CANONICAL_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/+$/, "") ||
  "https://retreatyourself.network";

const HOST_REDIRECTS: Record<string, string> = {
  "retreatyourself.host": "/for-retreat-owners",
  "retreatyourself.expert": "/facilitators-portal",   // PENDING Andrew
  "retreatyourself.exchange": "/facilitators-portal",  // PENDING Andrew
};

export function proxy(request: NextRequest) {
  const host = normalizedHost(request); // x-forwarded-host || host, no port, no www.
  const target = host ? HOST_REDIRECTS[host] : undefined;
  if (target) {
    return NextResponse.redirect(new URL(target, CANONICAL_ORIGIN), 308);
  }
  // …existing legal-page gating…
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

Design choices:

1. **Fixed landing, path NOT carried over.** Every path on a source host (`/`, `/deep/path`, `/api/*`, with query strings) lands on the single destination. This is intentional (a role entry domain has one landing page) and avoids the cPanel-wildcard path-append bug.
2. **Permanent redirect = `308`** — the App Router standard (method-preserving); SEO-equivalent to `301`.
3. **Destination is absolute on the canonical origin.** `new URL(path, CANONICAL_ORIGIN)` resolves to `https://retreatyourself.network/…` so the redirect crosses domains. `CANONICAL_ORIGIN` comes from `NEXT_PUBLIC_APP_URL` (build-time), with a `.network` literal fallback.
4. **Host normalization** honors `x-forwarded-host` (reverse proxy), strips port and a leading `www.`, lowercased.
5. **Broad `matcher`** so the redirect covers every route; the host check short-circuits to `NextResponse.next()` on the canonical host, so `.network` is unaffected.
6. **`proxy.ts` runs under the custom server.** Production runs `app.js` (`next().getRequestHandler()` behind Passenger). Verified that `getRequestHandler()` **does** execute `proxy.ts` (redirects fired in a local `app.js` run), so this is not bypassed.

## Consequences

- Redirects are versioned in the repo and **survive every deploy** — no `.htaccess` clobber.
- Validated locally against a production-canonical build (`NEXT_PUBLIC_APP_URL=https://retreatyourself.network`):
  - `Host: retreatyourself.host` + `/deep/path?q=1` → `308` → `https://retreatyourself.network/for-retreat-owners`
  - `Host: retreatyourself.expert` / `.exchange` → `308` → `https://retreatyourself.network/facilitators-portal`
  - `Host: retreatyourself.network` → `200` (no redirect)
- The legacy cPanel `.host` redirect should be **removed** so it cannot conflict once this is deployed.
- **`.expert` / `.exchange` destinations are provisional** (both → facilitator portal) pending stakeholder confirmation (Andrew). Update `HOST_REDIRECTS` when confirmed.
- Adding/retargeting a domain is a one-line change to `HOST_REDIRECTS`.

## References

- [`src/proxy.ts`](../../src/proxy.ts) — `HOST_REDIRECTS`, `normalizedHost`, `proxy`, `config.matcher`
- [`docs/DEPLOYMENT.md`](../DEPLOYMENT.md) §2.6 — domains & redirects runbook
- Next.js `proxy.ts` / `NextResponse.redirect` via Context7 `/vercel/next.js`
- Related: SCOPE-002 canonical domain ([ADR-003](./ADR-003-site-metadata-canonical.md))
