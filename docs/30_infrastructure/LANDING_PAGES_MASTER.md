# Landing pages & domain-routing master reference

**Vault:** `docs/30_infrastructure` · **Compiled:** 2026-07-15 (for Mujahid's 13 July "master doc" task)
**Related:** [DOMAINS.md](DOMAINS.md) · [REDIRECTS.md](REDIRECTS.md) · [DNS.md](DNS.md)
**Canonical origin:** `https://retreatyourself.network`

Single source of truth for **every live URL and every redirect**. Source of truth
for domain routing = `src/proxy.ts` (`HOST_REDIRECTS`) + `next.config.ts` (`redirects()`),
cross-checked with the WhatsApp confirmations (18 Jun / 13 Jul).

> **Deploy caveat:** production serves the last deploy of `main`; the `feature/milestone-plan-audit`
> branch is ahead of it. URLs below are the canonical structure — a page marked *pending deploy*
> exists in the branch but may not be on production until the next deploy.
> **Phase-2 caveat:** at the Systeme.io transfer these domains repoint off this app — see [DOMAINS.md](DOMAINS.md) §Phase-2.

## 1. Domain routing (which domain goes where)

| Domain | Type | Resolves to | Mechanism |
| --- | --- | --- | --- |
| **retreatyourself.network** | **Canonical** | serves the app directly (200) | — |
| **retreatyourself.host** | Role/marketing | `308 → https://retreatyourself.network/for-retreat-owners` | `proxy.ts` (SCOPE-003) |
| **retreatyourself.expert** | Role/marketing | `308 → https://retreatyourself.network/facilitators-portal` | `proxy.ts` — **provisional, pending Andrew (SCOPE-004)** |
| **retreatyourself.exchange** | Role/marketing | `308 → https://retreatyourself.network/facilitators-portal` | `proxy.ts` — **provisional, pending Andrew (SCOPE-004)** |

Every path on a non-canonical host 308-redirects to the fixed landing above (path is
intentionally dropped). `www.` is stripped before matching.

## 2. Primary landing pages (all on the canonical domain)

| Page | Live URL | Audience / purpose |
| --- | --- | --- |
| Home | `https://retreatyourself.network/` | All visitors — three role entry points |
| Why work with us / trust | `/why-work-with-us` | Value proposition, trust |
| Browse retreats | `/retreat-listings` | Seekers — directory (type / need-intent / budget / region / date filters) |
| Retreat detail | `/retreat/{slug}` | Seekers — individual retreat |
| Seeker questionnaire | `/retreat-discovery-form` | Seekers — intention-based discovery |
| For retreat owners | `/for-retreat-owners` | Owners/hosts — **`.host` landing** |
| Make your retreat | `/make-your-retreat` | Owners — start a retreat |
| Retreat intake form | `/retreat-intake-form` | Owners — submit a retreat |
| Facilitators portal | `/facilitators-portal` | Facilitators/coaches — **`.expert`/`.exchange` landing** |
| Facilitator onboarding | `/facilitator-onboarding` | Facilitators — join |
| Facilitator matching | `/facilitator-matching-form` | Facilitators — get matched |
| Facilitator directory | `/facilitator-directory` (+ `/{slug}`) | Public directory |
| Contact | `/contact` | Contact form |
| About | `/about`, `/about/our-story` | Brand story |
| Legal | `/privacy`, `/terms`, `/cookies` | Legal (gated by `NEXT_PUBLIC_LEGAL_PAGES_VISIBLE`) |
| Thank you | `/thank-you` | Post-submission |

## 3. Path aliases (short URLs → canonical page, `next.config.ts`, 308 permanent)

| Short URL | Redirects to |
| --- | --- |
| `/discover` | `/retreat-listings` |
| `/find-your-path` | `/retreat-discovery-form` |
| `/create` | `/make-your-retreat` |
| `/facilitators` | `/facilitators-portal` |
| `/how-it-works`, `/about/how-it-works` | `/why-work-with-us` |

## 4. Related non-page URLs (for the master doc / marketing)

- Social + Metricool + (pending) Google Drive `RetreatYourself/Assets` — tracked internally by the marketing team, not part of this codebase.
- Server IP `69.72.149.237`; DNS/registrar → [DNS.md](DNS.md); TLS → [TLS_SSL.md](TLS_SSL.md).
