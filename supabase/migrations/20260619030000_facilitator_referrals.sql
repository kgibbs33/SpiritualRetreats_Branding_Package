-- SCOPE-030: facilitator referral / recommendation contacts.
-- These are THIRD-PARTY personal data (a referee's name/email) supplied by the
-- facilitator, so GDPR needs a lawful basis: the facilitator must confirm they
-- have the referee's permission to share their details. We record that consent
-- flag for accountability (GDPR Art. 5(2)). Admin-only; never shown publicly.

ALTER TABLE public.facilitator_onboarding_responses
  ADD COLUMN IF NOT EXISTS referrals jsonb,
  ADD COLUMN IF NOT EXISTS referral_consent boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.facilitator_onboarding_responses.referrals IS
  'SCOPE-030: array of {name,email,relationship} referee contacts (third-party data). Admin-only; server-only access.';
COMMENT ON COLUMN public.facilitator_onboarding_responses.referral_consent IS
  'SCOPE-030: facilitator affirmed they have the referees'' permission to share contact details (GDPR accountability). created_at is the consent timestamp.';
