# Feature implementation status

**Document**: FEATURE_IMPLEMENTATION_STATUS.md  
**Purpose**: Single matrix linking user-visible behavior, code, migrations, and documentation SSOT.  
**Change frequency**: Update when shipping features or correcting drift (see **Last verified**).

**Last verified**: 2026-06-15 (Next 16.2.6, React 19.2.5, Zod 4.3.x, Node ≥24)

---

## Legend

| Status   | Meaning |
|----------|---------|
| Done     | Implemented and wired in production path |
| Stub     | Page or flow exists but minimal / placeholder |
| Phase2   | Explicitly out of MVP; see linked architecture doc |
| N/A      | Not applicable or deferred by product decision |

---

## Core platform

| Area | User-visible feature | Code / data | Doc SSOT | Status | Notes |
|------|----------------------|-------------|----------|--------|-------|
| Runtime | App shell, routing | `src/app/`, `next.config.ts` | `docs/10_architecture/SYSTEM_OVERVIEW.md` | Done | Redirects: `/discover`→listings, `/find-your-path`→discovery form, `/create`→make-your-retreat, `/facilitators`→portal, `/about/how-it-works`→`/trust` |
| Config | Public env defaults | `.env.public`, `next.config.ts` `loadEnvPublic` | `.env.example` | Done | |
| Edge | Request filtering | `src/proxy.ts` | `docs/10_architecture/` (routing) | Done | |
| SEO | Canonical + social metadata | `src/app/layout.tsx` (`metadataBase`), `src/app/retreat/[slug]/page.tsx` | `docs/10_architecture/ADR-003-site-metadata-canonical.md` | Done | Site-wide `canonical` + OpenGraph + Twitter on `retreatyourself.network` via `metadataBase`=`NEXT_PUBLIC_APP_URL`; per-route canonical on retreat detail. Validated live 2026-06-15 (SCOPE-002) |

---

## Data & migrations

| Table / topic | Migration file | Used by | Status |
|---------------|------------------|---------|--------|
| events | `supabase/migrations/20240218000000_events.sql` | All form APIs | Done |
| contact_inquiries | `supabase/migrations/20240218000001_contact_inquiries.sql` | `/api/contact` | Done |
| seeker_discovery_responses | `supabase/migrations/20260417000000_seeker_discovery.sql` | `/api/seeker-discovery` | Done |
| newsletter_subscriptions | `supabase/migrations/20260417000001_newsletter_subscriptions.sql` | `/api/newsletter` | Done |
| retreat_submissions | `supabase/migrations/20260417000002_retreat_submissions.sql` | `/api/retreat-submission` | Done |
| retreats (public directory) | `supabase/migrations/20260428000000_retreats_public_listings.sql` | `/retreat-listings`, `/retreat/[slug]` | Done | RLS: `anon`/`authenticated` SELECT only `status = published`; six seeded demos |
| retreats trust + source link | `supabase/migrations/20260428120001_retreats_trust_and_source.sql` | directory UI, operator publish | Done | `trust_tier`, `verified_at`, `credibility_note`, `source_submission_id` |
| facilitator_onboarding_responses | `20260428120002_facilitator_onboarding_and_matches.sql` + profile extensions: `20260618000000` (photo), `20260619000000` (location), `20260619010000` (CV), `20260619020000` (social links), `20260619030000` (referrals) | `POST /api/facilitator-onboarding` (+ `/api/facilitator-photo`, `/api/facilitator-cv`) | Done | RLS on, no public policies — admin client only. Fields: photo, location (city/region/country, SCOPE-027), CV PDF (SCOPE-028), website/LinkedIn/Instagram (SCOPE-029), referee contacts + consent (SCOPE-030). See `DATA_MODEL.md` / `STORAGE.md` |
| facilitators (published directory) | `20260619060000_facilitators_published.sql` | publish from onboarding | Done | SCOPE-038; curated public-safe SSOT; anon SELECT only `status=published`; GIN on `practice_areas`; see ADR-005 |
| matches | same | `POST /api/operator/create-match` | Done | RLS on — service-role API only |

---

## Public APIs (forms)

| Route | Guards + validation | Mail | Status |
|-------|---------------------|------|--------|
| `POST /api/contact` | `publicJsonPostGuards`, Zod, honeypot `company` | Operator + user confirmation | Done |
| `POST /api/newsletter` | Same pattern | User confirmation (new row only) | Done |
| `POST /api/seeker-discovery` | Same + DB idempotency key optional | User confirmation | Done |
| `POST /api/retreat-submission` | Same | User confirmation | Done |
| `POST /api/facilitator-onboarding` | `publicJsonPostGuards`, Zod, honeypot | Facilitator welcome mail | Done |
| `POST /api/facilitator-photo` | Rate limit + `Sec-Fetch-Site`, size/MIME/magic-byte | — | Done | Private `facilitator-media` upload; returns object path (SCOPE-026) |
| `POST /api/facilitator-cv` | Rate limit + `Sec-Fetch-Site`, size/MIME/magic-byte (`%PDF`) | — | Done | Private CV upload; admin reads via forced-download signed URL (SCOPE-028) |
| `POST /api/operator/publish-retreat-submission` | `OPERATOR_SECRET` (**server**); Zod | — | Done | Promotes intake → `retreats`; `revalidateTag` list + slug |
| `POST /api/operator/create-match` | `OPERATOR_SECRET`; Zod | Seeker + facilitator match mail | Done |
| `POST /api/operator/publish-facilitator` | `OPERATOR_SECRET`; Zod | — | Done | Promotes onboarding → `facilitators` (SCOPE-038); `revalidateTag` |
| `PATCH /api/admin/facilitator-responses/[id]` | admin session | — | Done | **Vetting workflow (SCOPE-058):** `vet` (checklist-gated pending→vetted, writes `vetting` jsonb + `vetted_at` + `facilitator_vetted` event), `publish` **gated on vetted** (no public exposure until vetted), reject/reset (reset clears vetting + withdraws public row). Set open-to-work (SCOPE-037); set verified (SCOPE-044) |
| `GET /api/health` | — | — | Done |

**SSOT**: [`docs/10_architecture/CONTACT_MAIL.md`](../10_architecture/CONTACT_MAIL.md) — providers, env, failure behavior, rate limits, `Sec-Fetch-Site`, newsletter compliance.

**Resend**: Idempotency keys + bounded retry on 429 / 5xx — see [`docs/10_architecture/ADR-001-resend-idempotency-retry.md`](../10_architecture/ADR-001-resend-idempotency-retry.md).

---

## Mail modules

| Module | Role |
|--------|------|
| `src/lib/mail/send-email.ts` | Resend + SMTP (`MAIL_PROVIDER`), optional idempotency + retry (Resend) |
| `src/lib/mail/contact-notification.ts` | Operator contact notification |
| `src/lib/mail/transactional-confirmations.ts` | User receipts + facilitator welcome + match notifications |
| `src/lib/mail/transactional-templates.ts` | Shared HTML/text framing |

---

## Abuse & transport helpers

| Module | Role |
|--------|------|
| `src/lib/rate-limit.ts` | In-memory per-IP window (multi-instance = separate counters; document for ops) |
| `src/lib/request-guards.ts` | Rate limit + optional `Sec-Fetch-Site: cross-site` reject |

---

## Directory data (server)

| Module | Role |
|--------|------|
| `src/lib/retreats/queries.ts` | Anonymous reads via [`src/lib/supabase/public-server.ts`](../../src/lib/supabase/public-server.ts) (no `cookies()` — compatible with **`unstable_cache`**) + tags `retreats-list` / `retreat-{slug}` for `revalidateTag` |

---

## Pages (selected)

| Path | Purpose | Status | Notes |
|------|---------|--------|-------|
| `/` | Home | Done | |
| `/contact` | Contact | Done | |
| `/retreat-discovery-form` | Seeker questionnaire | Done | Canonical; replaces legacy `/find-your-path` URL |
| `/retreat-intake-form` | Retreat submission | Done | |
| `/retreat-listings` | Directory grid | Done | Supabase `retreats`; URL filters + sorts; segment `revalidate = 60`; cache tags for operator publish. **SCOPE-055:** type, **need/intent**, budget, region, date, price/rating sort. Need/intent is derived from the `type` category taxonomy via `RETREAT_INTENT_TO_CATEGORIES` (no intent column); `applyRetreatFilters` + DB `.in(type, cats)` narrowing; shareable `?intent=` param; empty state on no match |
| `/retreat/[slug]` | Retreat detail | Done | **Hero:** `next/image` (`fill`, `object-cover`, `sizes`, `priority` for LCP per Next 16 docs). **`image_path`** from `retreats`. **OG/Twitter:** `openGraph.images` + `twitter.summary_large_image` when `NEXT_PUBLIC_APP_URL` / `APP_URL` can form an absolute image URL |
| `/for-retreat-owners` | Owner info | Stub | |
| `/facilitator-matching-form` | Matching | Stub | |
| `/facilitators-portal` | Facilitator hub | Done | Links to onboarding + intake |
| `/facilitator-directory` | Public facilitator directory | Done | SCOPE-035; reads `facilitators` (anon, published only); list + `[slug]` profile + `[slug]/photo` signed-redirect; no PII. SCOPE-036: skill (GIN array-overlap) + open-to-work filters via shareable `?skills=&open=` URL params; open-to-work-first sort |
| `/facilitator-onboarding` | Facilitator intake form | Done | `FacilitatorOnboardingForm` → `/api/facilitator-onboarding` |
| `/make-your-retreat` | Creator track | Stub | Enrollment placeholder |
| `/trust` | Trust / how it works | Done | Canonical vs legacy about route |
| `/about/our-story` | Story | Stub | Optional merge with marketing copy |
| Legal | Privacy, terms, cookies | Done | Env-gated via `proxy` where applicable |

Legacy URLs above redirect in `next.config.ts`; duplicate `page.tsx` trees under redirected paths were removed to avoid drift.

---

## Newsletter compliance

| Topic | Status | Notes |
|-------|--------|-------|
| Single opt-in + receipt email | Done | Documented in CONTACT_MAIL.md |
| Double opt-in (token + confirm route) | N/A | **Product choice (2026-04):** not required for current jurisdictions; re-open if EU/UK marketing policy changes. |

---

## Stub and Phase 2 backlog (milestone order)

Use this order when scheduling product work (aligns with [`docs/10_architecture/SYSTEM_OVERVIEW.md`](../10_architecture/SYSTEM_OVERVIEW.md)):

1. ~~**Retreat detail + listings**~~ — **Done (Track A0):** `retreats` table, seeds, RLS, [`queries.ts`](../../src/lib/retreats/queries.ts), listing + slug pages.
2. **Listings UX** — **Done (listings):** URL query params + filters; **trust** from DB columns (`trust_tier`, etc.); cache tags + `revalidateTag` on operator publish.
3. **Promotion workflow** — **Done (API):** `POST /api/operator/publish-retreat-submission` with `OPERATOR_SECRET`.
4. **For retreat owners** — Replace “coming soon” with owner value prop + CTAs (needs **your copy**).
5. **Facilitator matching** — Spec workflow; likely depends on `matches` table (Phase2).
6. **Creator / make-your-retreat** — Real enrollment + program steps (Phase2-heavy).
7. **About our story** — Content or redirect policy.

### Track B (marketing stubs)

**Status:** No code change in this slice — pages remain stubs until **you** supply headlines, body copy, and assets. Agent implements layout once copy is provided (see plan todo `track-b-stubs`).

Infrastructure follow-ups (not blocking MVP demos):

- Distributed rate limit (Redis / edge) when running multiple Node replicas.
- Security headers / CSP — [`docs/10_architecture/ADR-002-security-headers.md`](../10_architecture/ADR-002-security-headers.md).
- Observability: structured logs, correlation IDs (no PII in logs).

---

## Context7 library IDs (implementation / review)

| Topic | Library ID |
|-------|------------|
| Next.js App Router (v16.2.x) | `/vercel/next.js/v16.2.2` |
| Resend API | `/websites/resend` |
| Zod 4 | `/websites/zod_dev_v4` |

Re-query Context7 when upgrading major versions.
