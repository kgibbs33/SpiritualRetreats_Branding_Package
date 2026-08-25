# ADR-005: Facilitator published profiles (store-and-display SSOT)

**Status:** Accepted · **Date:** 2026-06-19 · **Scope:** SCOPE-038

## Context

Facilitator data lives in two private intake tables:

- `facilitator_onboarding_responses` — the **profile** (name, contact, photo,
  location, skills, links, CV, referees). RLS enabled, **no policies** →
  service-role only.
- `facilitator_matching_requests` — a facilitator's **matching preferences**
  (availability, rates, what they're looking for).

We need a "single source of truth for store and display" plus a review/publish
workflow and stable links for the upcoming public directory (SCOPE-035). The
raw intake tables hold sensitive and third-party data (email, phone, CV,
referee contacts + consent) that must never be publicly readable.

## Decision

Mirror the **retreats** architecture (`retreat_submissions → retreats`):

- `facilitator_onboarding_responses` stays the **canonical raw profile** and
  gains a `status` workflow (`new → reviewed → published / rejected`).
- A new **`facilitators`** table is the **display SSOT** — a *curated,
  public-safe subset* (display_name, headline, bio, coarse location,
  practice_areas, public links, photo_path, slug). It is populated by an
  operator/admin **publish** step and is the only facilitator data the public
  directory reads.
- `facilitators` has RLS allowing `anon`/`authenticated` to `SELECT` **only
  `status = 'published'`** rows.

### Why a separate published table (not a view or a merge)

- **Safe by construction.** The published table simply never contains
  email/phone/CV/referrals, so no column-level mistake or future query can leak
  them — stronger than a `security_definer` view over the raw table.
- **Consistent with retreats**, which already proves the pattern (status-gated
  anon RLS, slug, operator + admin publish paths, `revalidateTag`).
- **Promotion is explicit.** Nothing is public until an operator/admin
  publishes it; default `status` is `new` (intake) / `draft` (published table).

## Consequences

- Publishing copies only safe fields via
  `upsertPublishedFacilitatorFromOnboarding` (upsert on `source_onboarding_id`,
  so re-publish updates in place — idempotent).
- Two entry points share that lib: `POST /api/operator/publish-facilitator`
  (`OPERATOR_SECRET`) and `PATCH /api/admin/facilitator-responses/[id]`
  (admin session). Withdraw/reject sets the published row back to `draft`.
- The directory (SCOPE-035) reads `facilitators` (anon, published only); skill
  search (SCOPE-036) uses the GIN index on `practice_areas`; each row's `slug`
  is its stable directory link.
- `photo_path` is exposed in the published row but the bucket stays private —
  the directory serves headshots via short-lived signed URLs (service-role).
- Matching preferences (`facilitator_matching_requests`) are intentionally
  **not** merged here; they are an operational concern, not directory display.

## Verification (2026-06-19)

Publish → slug; onboarding `status=published`; `facilitators` row has safe
columns only; anon reads published, cannot read draft, and `select=email`
returns 400 (column absent); re-publish stays 1 row; wrong secret → 401.
