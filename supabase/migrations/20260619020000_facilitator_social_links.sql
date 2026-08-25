-- SCOPE-029: social media + LinkedIn links on the facilitator profile.
-- Optional outbound profile links. Validated as http(s) URLs at the app layer
-- (Zod), with LinkedIn/Instagram host-checked. Stored privately; a future public
-- directory (SCOPE-035) decides what to surface per privacy rules.

ALTER TABLE public.facilitator_onboarding_responses
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text;

COMMENT ON COLUMN public.facilitator_onboarding_responses.website_url IS
  'SCOPE-029: facilitator website (optional, http(s)). Private; server-only.';
COMMENT ON COLUMN public.facilitator_onboarding_responses.linkedin_url IS
  'SCOPE-029: facilitator LinkedIn URL (optional, linkedin.com). Private; server-only.';
COMMENT ON COLUMN public.facilitator_onboarding_responses.instagram_url IS
  'SCOPE-029: facilitator Instagram URL (optional, instagram.com). Private; server-only.';
