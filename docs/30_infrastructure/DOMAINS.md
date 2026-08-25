# Domains

**Vault:** `docs/30_infrastructure` · **Last verified:** 2026-06-15
**Related:** [DNS.md](DNS.md) · [REDIRECTS.md](REDIRECTS.md) · [TLS_SSL.md](TLS_SSL.md) · [ADR-004](../10_architecture/ADR-004-host-based-role-redirects.md)

The project owns four domains, all served by the **same Next.js app** on one cPanel account. Only one is canonical; the rest are role/marketing entry domains that redirect into it.

> **⚠️ Phase-2 destination change — the domains move off this app.** Everything
> below documents the **current** state (all four domains → the cPanel/Passenger
> app at `69.72.149.237`). Per the confirmed Phase-2 plan (Andrew, 10 Jul: *"transfer
> and establishment in **Systeme.io**"*; SCOPE-053), plans call for a rebuild in
> Systeme.io using this build as a reference. The domains will be
> **repointed to Systeme.io at handover** and this app becomes reference-only. The
> client therefore needs **registrar + DNS-management account access** to change
> the A records / nameservers; Systeme.io then
> issues its own TLS (cPanel AutoSSL stops being relevant for these domains) and
> mail routing may need reconfiguration. **A possible brand/domain rename to
> `spiritualretreat.network` (SCOPE-072) may change the domain set entirely.**

## The four domains

| Domain | Role | Destination on canonical | Status |
|--------|------|--------------------------|--------|
| **retreatyourself.network** | Canonical main site (seekers + everything) | — (it is canonical) | Live, SCOPE-002 done |
| **retreatyourself.host** | Retreat owners / hosts | `/for-retreat-owners` | Destination confirmed; redirect pending deploy (SCOPE-003) |
| **retreatyourself.expert** | Coaches / experts | `/facilitators-portal` | **Provisional** — pending Andrew (SCOPE-004) |
| **retreatyourself.exchange** | Facilitators / marketplace | `/facilitators-portal` | **Provisional** — pending Andrew (SCOPE-004) |

Source for roles: 21 May 2026 team meeting to-dos.

## Canonical domain

`retreatyourself.network` is the single canonical domain. This is enforced at two layers:

- **App / SEO:** `NEXT_PUBLIC_APP_URL=https://retreatyourself.network` drives `metadataBase`, canonical tags, Open Graph, and mail links. See [ADR-003](../10_architecture/ADR-003-site-metadata-canonical.md).
- **HTTP:** the other three domains permanently redirect (308) to a fixed landing page on `.network`. See [REDIRECTS.md](REDIRECTS.md).

## cPanel account note

The cPanel account's **main domain is still `retreatyourself.host`** (a historical artifact). Changing the account's primary domain is a WHM/root operation and is **not required** — `.network` is canonical at the app and redirect layer regardless. `.network`, `.expert`, and `.exchange` are added to the account as additional/parked domains sharing the same document root.

## Open decisions (for Andrew)

1. **`.expert`** (coaches/experts): land on the facilitator portal, or build a dedicated experts page? Currently → `/facilitators-portal`.
2. **`.exchange`** (facilitators/marketplace): facilitator portal, retreat listings, or hold for a future marketplace? Currently → `/facilitators-portal`.

To change a destination, edit `HOST_REDIRECTS` in [`src/proxy.ts`](../../src/proxy.ts) (one line each) — see [REDIRECTS.md](REDIRECTS.md).

## Verify

```bash
# Which domains the cPanel account serves (run on the server)
ssh retreatyourself 'uapi --output=json DomainInfo list_domains'
```
