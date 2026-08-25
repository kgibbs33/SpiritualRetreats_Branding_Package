# Redirects (host-based role redirects)

**Vault:** `docs/30_infrastructure` · **Last verified:** 2026-06-15
**Related:** [DOMAINS.md](DOMAINS.md) · [DNS.md](DNS.md) · [ADR-004](../10_architecture/ADR-004-host-based-role-redirects.md)
**Context7:** `/vercel/next.js` — App Router `proxy.ts`, `NextResponse.redirect(url, 308)`, `config.matcher`.

The three non-canonical domains permanently redirect (HTTP 308) every path to a fixed landing page on `retreatyourself.network`.

| Source host (+ `www`) | Destination |
|-----------------------|-------------|
| retreatyourself.host | `https://retreatyourself.network/for-retreat-owners` |
| retreatyourself.expert | `https://retreatyourself.network/facilitators-portal` *(provisional)* |
| retreatyourself.exchange | `https://retreatyourself.network/facilitators-portal` *(provisional)* |

## Implementation

Defined in [`src/proxy.ts`](../../src/proxy.ts) as `HOST_REDIRECTS`. The `proxy` function reads the request host (honoring `x-forwarded-host`, stripping port and a leading `www.`), and if it matches the map, returns `NextResponse.redirect(new URL(path, CANONICAL_ORIGIN), 308)`. `CANONICAL_ORIGIN` comes from `NEXT_PUBLIC_APP_URL`. The `config.matcher` runs on all routes except Next internals so the redirect covers every path; the host check short-circuits to `NextResponse.next()` on the canonical host. Full rationale and design choices: [ADR-004](../10_architecture/ADR-004-host-based-role-redirects.md).

Key behaviors:
- **308 permanent** (App Router standard, method-preserving; SEO-equivalent to 301).
- **Fixed landing** — the request path is not carried over (avoids the old cPanel wildcard path-append bug).
- **Cross-domain absolute Location** to `.network`.

## Why app-level (not cPanel or DNS)

| Approach | Survives deploy | Valid https | Touches app | Verdict |
|----------|-----------------|-------------|-------------|---------|
| **`proxy.ts` (chosen)** | Yes (versioned) | Yes (apex cert) | Yes | Best fit here |
| cPanel *Redirects* | **No** — written into `public_html/.htaccess`, which the deploy rewrites (it was clobbered 2026-06-15; wildcard also appended the path) | Yes | No | Fragile |
| Namecheap URL forward | Yes | **Weak** on `https://` | No | OK for http only |
| Cloudflare Redirect Rules | Yes | Yes | No | Good, but needs NS migration |

## Runs under the custom server

Production runs a **custom server** (`app.js` using `next().getRequestHandler()` behind Passenger). Verified 2026-06-15 that `getRequestHandler()` **does** execute `proxy.ts` (redirects fired in a local `app.js` run), so the proxy is not bypassed.

## Validation (local, production-canonical build)

Built with `NEXT_PUBLIC_APP_URL=https://retreatyourself.network`, then `app.js`:

- `Host: retreatyourself.host` + `/deep/path?q=1` → 308 → `https://retreatyourself.network/for-retreat-owners`
- `Host: retreatyourself.expert` / `.exchange` → 308 → `https://retreatyourself.network/facilitators-portal`
- `Host: retreatyourself.network` → 200 (no redirect)

## Status / open items

- **Pending deploy** — the redirects are committed but not yet live. Until deployed, the apex domains serve the app (200) instead of redirecting.
- **`.expert` / `.exchange` destinations provisional** — confirm with Andrew, then edit `HOST_REDIRECTS`.
- **`www` over https** depends on AutoSSL covering the `www` names — see [TLS_SSL.md](TLS_SSL.md).
- **Wildcard subdomains** other than `www` are not redirected (they serve the app). Optional enhancement: match by domain suffix in `proxy.ts`.

## Verify (after deploy)

```bash
curl -sI -H 'Host: retreatyourself.host' https://retreatyourself.network/x | grep -i location
# → https://retreatyourself.network/for-retreat-owners
curl -sI https://retreatyourself.expert/x | grep -i location
# → https://retreatyourself.network/facilitators-portal
```
