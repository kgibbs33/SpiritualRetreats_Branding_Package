-- SCOPE-044: trust/verification on published facilitators (parity with retreats'
-- trust_tier/verified_at). `verified` is admin-set during review; drives the
-- "Verified" badge in the public directory. Default false.

ALTER TABLE public.facilitators
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

COMMENT ON COLUMN public.facilitators.verified IS
  'SCOPE-044: vetted by the RE:TREAT team (admin-set). Drives the Verified directory badge.';
COMMENT ON COLUMN public.facilitators.verified_at IS
  'SCOPE-044: when the facilitator was marked verified (nullable).';
