# DNS

**Vault:** `docs/30_infrastructure` · **Last verified:** 2026-06-15
**Related:** [DOMAINS.md](DOMAINS.md) · [TLS_SSL.md](TLS_SSL.md) · [REDIRECTS.md](REDIRECTS.md)

## Providers / nameservers

| Domain | Nameservers | DNS managed at |
|--------|-------------|----------------|
| retreatyourself.network | `ns1`–`ns4.mysecurecloudhost.com` | Hosting provider |
| retreatyourself.host | `dns1`/`dns2.registrar-servers.com` | **Namecheap** (BasicDNS) |
| retreatyourself.expert | `dns1`/`dns2.registrar-servers.com` | **Namecheap** (BasicDNS) |
| retreatyourself.exchange | `dns1`/`dns2.registrar-servers.com` | **Namecheap** (BasicDNS) |

The app server is `69.72.149.237` (fra1, Frankfurt — stableserver.net). It is a **static IP**.

## Current records (verified 2026-06-15)

| Domain | apex `@` | `www` | wildcard `*` |
|--------|----------|-------|--------------|
| retreatyourself.network | A `69.72.149.237` | alias → apex | (n/a) |
| retreatyourself.host | A `69.72.149.237` | A `69.72.149.237` | A `69.72.149.237` |
| retreatyourself.expert | A `69.72.149.237` | A `69.72.149.237` | A `69.72.149.237` |
| retreatyourself.exchange | A `69.72.149.237` | A `69.72.149.237` | A `69.72.149.237` |

The three Namecheap domains are configured with **`@` and `*` (wildcard) pointing at the app IP**, so the apex and any subdomain resolve to the server. `www` is set explicitly to the app IP as well.

### History / cleanup notes

- Until 2026-06-15 the `www` records pointed at Namecheap's parking IP `192.64.119.254`, which 302-redirected to the `.network` homepage (bypassing the app). These were repointed to the app server so [`proxy.ts`](../../src/proxy.ts) handles them. The Namecheap parking/URL-forward is now out of the path.
- A transient stray second apex A record once seen on `.expert` (`192.64.119.107`) is no longer present.

## Wildcard implications

The wildcard `*` is convenient (every subdomain reaches the app), but note:

1. **Wildcard DNS is not wildcard TLS.** Arbitrary subdomains resolve to the server but have **no valid certificate** (cPanel AutoSSL only covers named domains). See [TLS_SSL.md](TLS_SSL.md).
2. **`proxy.ts` only redirects the apex and `www`** of the role domains (it strips a leading `www.`). Other subdomains (e.g. `blog.retreatyourself.host`) resolve to the app and currently serve a 200 rather than redirecting. If full-subdomain redirecting is wanted, change the host match in `proxy.ts` to a domain-suffix match.

## Dynamic DNS — not used (and why)

Namecheap Dynamic DNS keeps an A record in sync with a **changing** IP. It does **not** apply here:

- The server IP is **static**, so there is nothing to keep in sync.
- DDNS only updates IP addresses; it cannot do HTTP redirects, paths, or `www` handling (those are app-layer, in `proxy.ts`).

For programmatic record management (if ever needed for many records), use the Namecheap Domains API or move DNS to Cloudflare — not DDNS.

## Change procedure

- **Namecheap domains (`.host`/`.expert`/`.exchange`):** Namecheap dashboard → Domain → **Advanced DNS** → edit Host Records (`@`, `www`, `*`). After repointing `www`, run AutoSSL (see [TLS_SSL.md](TLS_SSL.md)). TTL is ~30 min (1799s).
- **`.network`:** managed at the hosting provider's nameservers.

## Verify

```bash
# Authoritative answer (bypasses local cache during propagation)
host -t A www.retreatyourself.exchange dns1.registrar-servers.com

# All four domains: apex / www
for d in retreatyourself.network retreatyourself.host retreatyourself.expert retreatyourself.exchange; do
  echo "$d";  host -t A "$d";  host -t A "www.$d"
done
```
