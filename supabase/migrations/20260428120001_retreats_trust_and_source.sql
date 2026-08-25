-- Trust signals + optional link back to intake submission (promotion idempotency).

ALTER TABLE public.retreats
  ADD COLUMN IF NOT EXISTS trust_tier text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS credibility_note text,
  ADD COLUMN IF NOT EXISTS source_submission_id uuid UNIQUE REFERENCES retreat_submissions (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.retreats.trust_tier IS 'e.g. verified_partner, listed, emerging — drives directory trust UI';
COMMENT ON COLUMN public.retreats.verified_at IS 'When listing was verified by ops (nullable)';
COMMENT ON COLUMN public.retreats.credibility_note IS 'Optional short credibility snippet';
COMMENT ON COLUMN public.retreats.source_submission_id IS 'If published from intake, links back for idempotent promotion';

UPDATE public.retreats
SET
  trust_tier = COALESCE(trust_tier, 'partner'),
  verified_at = COALESCE(verified_at, created_at)
WHERE status = 'published';
