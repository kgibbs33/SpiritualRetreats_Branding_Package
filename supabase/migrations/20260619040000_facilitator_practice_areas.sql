-- SCOPE-031: structured multi-select skills/practices on the facilitator profile.
-- Mirrors facilitator_matching_requests.practice_areas (text[]) so the two forms
-- store skills consistently. The existing free-text practice_focus is retained
-- for any additional detail.

ALTER TABLE public.facilitator_onboarding_responses
  ADD COLUMN IF NOT EXISTS practice_areas text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.facilitator_onboarding_responses.practice_areas IS
  'SCOPE-031: multi-select practice areas (shared taxonomy: yoga, meditation, breathwork, sound-healing, plant-medicine, somatic, coaching, creative, spiritual, other).';
