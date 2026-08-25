# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Facilitator profile fields (SCOPE-026–030).** Extended the facilitator onboarding profile and the private `facilitator-media` storage:
  - **Photo upload (SCOPE-026)** — private bucket, signed-URL reads, client downscale + EXIF strip, magic-byte validation.
  - **Location (SCOPE-027)** — optional, GDPR-minimal `city` / `region` / `country` (no street address).
  - **CV / credentials PDF (SCOPE-028)** — admin-only upload to the same private bucket (`application/pdf`, 5 MB, `%PDF` magic-byte check); admin reads via a **forced-download** signed URL (`download: true`) so embedded JS can't run inline. `facilitatorCvDownloadName(name, id)` gives readable, collision-free filenames.
  - **Social links (SCOPE-029)** — optional `website` / `linkedin` / `instagram`, validated with **Zod 4 `z.url()`**: scheme coercion, protocol restricted to http(s) (blocks `javascript:`/`data:`), `$`-anchored host checks for LinkedIn/Instagram.
  - **Referee contacts (SCOPE-030)** — optional `referrals` (jsonb, ≤2 × name/email/relationship) of **third-party** data, gated behind a server-enforced consent (`referral_consent`); privacy policy updated. `z.email()` (Zod 4).
  - All fields are admin-only (RLS-no-policy table); documented in `docs/10_architecture/DATA_MODEL.md` and `docs/30_infrastructure/STORAGE.md`. Migrations `20260618000000`–`20260619030000`.
- **Owner advertising packages (SCOPE-057, gated).** Banner €22 / Feature €100 / Social €100 / Package €222 CTAs on `/for-retreat-owners`, hidden behind `NEXT_PUBLIC_OWNER_AD_PACKAGES_VISIBLE` pending price confirmation.
- **About-us scaffold (SCOPE-056, not deployed).** Live mission section + placeholder founder cards on `/why-work-with-us`, gated by a do-not-deploy note pending real founder details.
- **Seeker flow documentation (SCOPE-022).** Verified pain/outcome questions precede modalities; documented the `seeker_discovery_responses` table + `answers` JSON shape in `DATA_MODEL.md`.
- **Scope tooling.** `npm run scope:check` reconciles manifest / registry / audit report / live GitHub issue state (exits non-zero on drift). GitHub issue bodies now render acceptance criteria as task lists with an "N/M done" progress bar + a "Remaining" line for partial items.
- Contact form operator email: **Resend** (`RESEND_API_KEY`) or **SMTP** (Nodemailer), selectable via `MAIL_PROVIDER` (`auto` | `resend` | `smtp` | `none`). SMTP supports 587 + STARTTLS and 465 + implicit TLS via `SMTP_SECURE` / `SMTP_PORT`. See `docs/10_architecture/CONTACT_MAIL.md`. Dependencies: `resend`, `nodemailer`.
- Homepage hero copy (SCOPE-011). Eyebrow "For seekers, owners, facilitators"; headline "We support your" / "spiritual retreat." (re-specified 2026-08-10 for a three-audience framing; sub-line "Tell us where you are in life. We match you to the retreat that fits." unchanged pending review). Plain language, no em dashes. Cleaned the "Find my retreat, free" / "Start the questionnaire, free" CTAs to match.
- **Fixed: published retreats now keep their real category (SCOPE-109).** Both publish paths previously hardcoded `retreats.type = 'wellness'`, discarding the owner's actual category selection from intake. Added a real `categories` array (GIN-indexed, backfilled from existing submissions), and derived `type` from it instead of a constant. `/retreat-listings` type and intent filtering now read the full category set.

---

### 2026-06-18 — Milestone M1 (Infrastructure & ops) complete

**Milestone**

- **M1 — Infrastructure & ops complete**: all 6 scope items done (SCOPE-001, 002, 007, 008, 009, 019). Tag `m1-infrastructure-ops-complete`.

**Completed**

- SCOPE-002: `retreatyourself.network` set as the canonical domain (DNS + AutoSSL + cPanel app), with site-wide `canonical` / OpenGraph / Twitter metadata via `metadataBase`. See `docs/10_architecture/ADR-003-site-metadata-canonical.md`.
- SCOPE-003 / 004: host-based role redirects in `src/proxy.ts` (`.host` → `/for-retreat-owners`, `.expert` / `.exchange` → `/facilitators-portal`, 308). See `docs/10_architecture/ADR-004-host-based-role-redirects.md`.
- SCOPE-007: Supabase confirmed in **EU (Frankfurt)** for GDPR data residency; CLI re-linked.
- SCOPE-008: transactional email verified **end-to-end** (SMTP via cPanel mailbox `noreply@retreatyourself.network`); confirmation delivery confirmed by IMAP.
- SCOPE-009: contact routing clarified; support address `service@retreatyourself.community` → `service@retreatyourself.network` (privacy page wired to the constant); mailbox setup documented for the client (`HANDOVER_PACKAGE.md` §1b).
- SCOPE-019: legal pages (`/privacy`, `/terms`, `/cookies`) verified live in production.

**Added**

- `docs/30_infrastructure/` operations knowledge vault: domains, DNS, TLS, redirects, mail, CI/CD, and the cPanel/Passenger runbook (incl. the 2026-06-17 outage + recovery), plus live production screenshots.
- `CLAUDE.md` for Claude Code guidance.

**Fixed**

- Deploy env injection now passes values via a step `env:` block (quoting-safe) and keeps `MAIL_FROM` a bare address, after a quoted value broke the cPanel `.htaccess` generation.

---

### 2026-04-25 — High impact

**Added**

- Seeker discovery flow: multi-step questionnaire UI, `POST /api/seeker-discovery`, table `seeker_discovery_responses`, events `seeker_discovery_submitted`, optional n8n payload `form_type: seeker_discovery`.
- Newsletter signup in footer: `POST /api/newsletter`, table `newsletter_subscriptions`.
- Retreat owner intake: `POST /api/retreat-submission`, table `retreat_submissions` with status `pending` | `approved` | `rejected`.
- Global `not-found` page and internal `legal-pages-disabled` route for legal-page blocking.
- `docs/20_execution/internal/BNAT_ROADMAP.md` for phased BNAT work.

**Changed**

- Homepage, About, Find Your Retreat, retreat discovery, thank-you, and footer aligned with client PDF copy and structure where applicable.
- Next.js **16.2.4** with **`src/proxy.ts`** (replaces deprecated `middleware`) for conditional legal routes when `NEXT_PUBLIC_LEGAL_PAGES_VISIBLE` is not `true`.
- Dependencies: React **19.2.5**, `@supabase/ssr` **0.10.2**, `@supabase/supabase-js` **2.103.3**, `eslint-config-next` **16.2.4**.

**Affected paths (representative)**

- `src/proxy.ts`, `src/app/api/{seeker-discovery,newsletter,retreat-submission}/`, `src/components/{SeekerDiscoveryForm,NewsletterSignup,RetreatIntakeForm}.tsx`
- `src/app/{page,about,find-your-retreat,retreat-discovery-form,retreat-intake-form,thank-you,not-found,legal-pages-disabled}.tsx`
- `supabase/migrations/20260417000000_*.sql` … `20260417000002_*.sql`, `package.json`, `package-lock.json`
- `docs/20_execution/internal/BNAT_ROADMAP.md`
