# TLS / SSL

**Vault:** `docs/30_infrastructure` · **Last verified:** 2026-07-23
**Related:** [DNS.md](DNS.md) · [DOMAINS.md](DOMAINS.md) · [REDIRECTS.md](REDIRECTS.md)

Certificates are issued by **Let's Encrypt via cPanel AutoSSL** as a single multi-domain (SAN) certificate. The certificate's CN is `www.retreatyourself.network`; the covered names are in the Subject Alternative Name (SAN) list.

## Current SAN coverage (verified 2026-07-23)

**Covered (valid https):**
- `retreatyourself.network`, `www.retreatyourself.network`
- `retreatyourself.host`, `www.retreatyourself.host`
- `retreatyourself.expert`, `www.retreatyourself.expert`
- `retreatyourself.exchange`, `www.retreatyourself.exchange`
- cPanel service names on `.network` (mail, cpanel, webmail, autodiscover, etc.)

| Hostname | HTTPS |
|----------|-------|
| apex of host / expert / exchange | ✅ valid cert |
| `www.` of host / expert / exchange | ✅ valid cert (AutoSSL re-ran after DNS propagation) |

## History — the `www` gap (resolved)

The `www` records previously pointed at Namecheap parking, so AutoSSL had never validated them. They were repointed to the app server on 2026-06-15 (see [DNS.md](DNS.md)). AutoSSL subsequently re-ran and added the `www` names to the SAN list. All six role-domain hostnames now have valid certs — confirmed 2026-07-23.

## Wildcard DNS is not wildcard TLS

The Namecheap domains use a wildcard `*` A record, so any subdomain resolves to the server — but AutoSSL only issues certificates for **named** domains it can validate (apex + `www` once it runs). An arbitrary subdomain (e.g. `foo.retreatyourself.host`) resolves to the server and is served the **server's default certificate** for an unrelated account, i.e. no valid cert. Real wildcard https would require a wildcard certificate (DNS-01 validation), which is unnecessary for this use case.

## Verify

```bash
# SAN list on the served cert
echo | openssl s_client -servername retreatyourself.host -connect 69.72.149.237:443 2>/dev/null \
  | openssl x509 -noout -ext subjectAltName

# https validity per hostname (no output error = valid cert)
for n in retreatyourself.host www.retreatyourself.host retreatyourself.expert \
         www.retreatyourself.expert retreatyourself.exchange www.retreatyourself.exchange; do
  curl -sI --resolve "$n:443:69.72.149.237" "https://$n/" >/dev/null && echo "$n OK" || echo "$n TLS-FAIL"
done
```
