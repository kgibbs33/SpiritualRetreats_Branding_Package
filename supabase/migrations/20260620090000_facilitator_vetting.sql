-- SCOPE-058: Admin facilitator vetting workflow.
--
-- Adds an auditable vetting record to facilitator onboarding submissions so the
-- admin must complete a checklist (CV/documents, referral contacts, promotion
-- consent) before a facilitator can be vetted, and a facilitator must be vetted
-- before it can be published to the public directory.
--
-- Lifecycle (status text column, already present):
--   new (pending) -> vetted -> published   (or -> rejected at any point)
--
-- The checklist itself is stored as flexible jsonb (the Supabase audit pattern:
-- `record jsonb` + `ts timestamptz`) rather than discrete boolean columns — it
-- is append-only audit data, not queryable filter state. The publish gate is
-- enforced in the API route (returns a clear 400) so it can give the admin an
-- actionable message instead of an opaque constraint violation.

alter table public.facilitator_onboarding_responses
  add column if not exists vetting jsonb,
  add column if not exists vetted_at timestamptz;

comment on column public.facilitator_onboarding_responses.vetting is
  'SCOPE-058 vetting checklist + attestation: { cvReviewed, referralsChecked, promotionConsent, notes, at }. Set when status transitions to "vetted".';
comment on column public.facilitator_onboarding_responses.vetted_at is
  'SCOPE-058 timestamp the submission was vetted (cleared on reset to pending).';
