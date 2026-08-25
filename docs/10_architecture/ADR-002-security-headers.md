# ADR-002: Global HTTP security headers

**Status**: Superseded — see update below  
**Date**: 2026-04-27  **Updated**: 2026-07-23  
**Context7**: `/vercel/next.js/v16.2.2` — `next.config.js` [`headers`](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers).

## Context

The app had no global security headers. A full **Content-Security-Policy** is deferred until third-party scripts and analytics are inventoried (risk of breaking inline or vendor assets).

## Decision

Apply **minimal, low-risk** headers on all routes via [`next.config.ts`](../../next.config.ts) `headers()`:

| Header | Value | Rationale |
|--------|-------|-----------|
| `X-Content-Type-Options` | `nosniff` | Reduces MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Balances privacy and debugging |
| `X-Frame-Options` | `SAMEORIGIN` | Reduces clickjacking for classic framing |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Defaults for a site that does not need these |

**Not set globally (yet):**

- **Strict-Transport-Security** — Enable at the **CDN / reverse proxy** (e.g. Vercel project settings) with `includeSubDomains` and a tested `max-age`, or add here only when all environments serve HTTPS-only.
- **Content-Security-Policy** — Add in a follow-up ADR after auditing `script-src`, `img-src`, and any inline styles (Tailwind + Next may need `nonce` or hashes).

## Consequences

- Defense in depth without blocking current UI.
- Revisit CSP when adding embeds, GTM, chat widgets, or user-generated HTML rendering.

---

## Update — 2026-07-23 (M5 audit, commit `6f9466a`)

Both previously-deferred headers are now live. ADR-007 covers the CSP decision in full.

| Header | Value | Notes |
|--------|-------|-------|
| `Content-Security-Policy` | See [ADR-007](ADR-007-content-security-policy.md) | `unsafe-eval` added in dev only; no nonces needed (no external scripts) |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | 2-year max-age; cPanel serves HTTPS-only on all canonical routes |
| `X-Deploy-Version` | `DEPLOY_ID` env var (set at deploy time) | Operational header — which release is running; not a security header |

The `X-Deploy-Version` header was added alongside the security headers for operational convenience (visible in DevTools / `curl -I` without hitting `/api/health`).
