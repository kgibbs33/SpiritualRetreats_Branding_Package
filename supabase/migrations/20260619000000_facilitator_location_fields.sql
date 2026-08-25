-- SCOPE-027: structured location fields on the facilitator profile.
-- Coarse, GDPR-minimal location (city / region / country) — no street address,
-- so we avoid collecting precise personal location. All nullable (optional).
--
-- Privacy: facilitator_onboarding_responses has RLS enabled with NO policies,
-- so anon/authenticated clients cannot read these columns. Access is server-only
-- via the service-role API routes. A future public directory (SCOPE-035) decides
-- what (if anything) to surface; raw rows are never publicly exposed.

ALTER TABLE public.facilitator_onboarding_responses
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS country text;

COMMENT ON COLUMN public.facilitator_onboarding_responses.city IS
  'SCOPE-027: facilitator city/town (optional, coarse location). Private; server-only.';
COMMENT ON COLUMN public.facilitator_onboarding_responses.region IS
  'SCOPE-027: facilitator region/state/province (optional). Private; server-only.';
COMMENT ON COLUMN public.facilitator_onboarding_responses.country IS
  'SCOPE-027: facilitator country (optional). Private; server-only.';
