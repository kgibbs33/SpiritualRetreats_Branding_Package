# 30_infrastructure — Infrastructure & Operations Vault

**Purpose:** Single source of truth for how the platform runs in production — domains, DNS, TLS, redirects, database residency, and CI/CD environment. Operational counterpart to `10_architecture` (system design) and `20_execution` (build plan).

**Last verified:** 2026-07-23

> Each note carries its own **Last verified** date. When you change infrastructure, update the relevant note and this dashboard, and re-run the verification commands at the bottom of each note.

---

## Production at a glance

> **Current as of 2026-07-23.** `main` is fully deployed. All M4 + M5 work (trust badges, facilitator vetting, security hardening, Phase 1 features) is live. See `git log` or `/api/health` to confirm the exact running version.

| Thing | Value | Status |
|-------|-------|--------|
| Canonical domain | `https://retreatyourself.network` | ✅ Live |
| App server IP | `69.72.149.237` (fra1, Frankfurt — stableserver.net) | Static |
| Hosting | cPanel / CloudLinux Passenger; custom server `app.js` | ✅ Live |
| Database | Supabase EU project `ruzxlccdoywshavwtulc` (eu-central-1) | ✅ Live, GDPR |
| Retired DB | Singapore `tzmnvbuhnugaiefpdfhp` (ap-southeast-1) | Paused |
| TLS | Let's Encrypt via cPanel AutoSSL (single SAN cert) | ✅ All domains covered incl. `www.` of role domains (verified 2026-07-23) |
| Role redirects | `src/proxy.ts` host map → 308 to canonical | ✅ Live |
| Email (sending) | SMTP via `noreply@retreatyourself.network`; Resend-capable when key set | ✅ Verified end-to-end 2026-07-23 — see [MAIL.md](MAIL.md) |
| Email (recipients) | `grow@` and `team@retreatyourself.network` created 2026-07-23; pending shared-inbox connection | 🟡 Forwarding setup pending |
| Security headers | CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy | ✅ Live (M5 audit, ADR-002/007) |
| Admin panel | `/admin` — password-gated via `OPERATOR_SECRET`; all pages server-auth'd | ✅ Live |
| Version tracking | `DEPLOY_ID` + `DEPLOY_SHA` in env; exposed via `/api/health` + `X-Deploy-Version` header | ✅ Live — see [CICD_ENV.md](CICD_ENV.md) |
| Serving | LiteSpeed / Passenger | ✅ Up — [screenshots](screenshots/) |

---

## Notes in this vault

| Note | Covers |
|------|--------|
| [DOMAINS.md](DOMAINS.md) | The four domains, their roles, canonical domain, redirect destination map, open decisions |
| [DNS.md](DNS.md) | DNS providers/nameservers, apex/`www`/wildcard records, current verified records, change procedure, Dynamic DNS analysis |
| [TLS_SSL.md](TLS_SSL.md) | AutoSSL, the multi-domain SAN cert, the `www` coverage gap, wildcard-DNS-vs-wildcard-cert, how to run AutoSSL |
| [REDIRECTS.md](REDIRECTS.md) | Host-based role redirects in `proxy.ts`, why app-level not cPanel/DNS, options compared, custom-server note |
| [SUPABASE_EU.md](SUPABASE_EU.md) | EU project, GDPR data residency, API keys, the paused Singapore project, CLI link |
| [CICD_ENV.md](CICD_ENV.md) | GitHub Actions variables/secrets, build-time vs runtime values, what targets which Supabase instance |
| [MAIL.md](MAIL.md) | Transactional email: SMTP via cPanel mailbox, the bare-`MAIL_FROM` gotcha, where the values live, verification (SCOPE-008) |
| [CPANEL_PASSENGER.md](CPANEL_PASSENGER.md) | Hosting internals: `app.js` custom server, the two `.htaccess` blocks, the 2026-06-17 outage runbook, zombie `lsnode` fix |
| [STORAGE.md](STORAGE.md) | Supabase Storage: the private `facilitator-media` bucket, the photo-upload route (validation/optimization/signed URLs), SCOPE-026 |

## Related architecture decisions

- [ADR-003 — Site-wide canonical & social metadata](../10_architecture/ADR-003-site-metadata-canonical.md)
- [ADR-004 — Host-based role redirects in `proxy.ts`](../10_architecture/ADR-004-host-based-role-redirects.md)
- [DEPLOYMENT.md](../DEPLOYMENT.md) — full deploy guide (§2.6 = domains & redirects)

