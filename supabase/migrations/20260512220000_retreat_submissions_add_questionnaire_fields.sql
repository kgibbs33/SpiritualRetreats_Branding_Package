-- Backfill missing questionnaire dimensions on retreat_submissions.
-- category, environment, and duration were collected by the intake form UI
-- but were never persisted (Zod schema + insert both omitted them).

ALTER TABLE public.retreat_submissions
  ADD COLUMN IF NOT EXISTS category    text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS environment text,
  ADD COLUMN IF NOT EXISTS duration    text;

COMMENT ON COLUMN public.retreat_submissions.category    IS 'Multi-select retreat type tiles: yoga, meditation, plant, sound, somatic, wellness, adventure, leadership, creative, spiritual';
COMMENT ON COLUMN public.retreat_submissions.environment IS 'Single-select landscape tile: mountains, ocean, jungle, desert, sacred, country, anywhere';
COMMENT ON COLUMN public.retreat_submissions.duration    IS 'Single-select length tile: weekend, week, twoweeks, month, flexible';
