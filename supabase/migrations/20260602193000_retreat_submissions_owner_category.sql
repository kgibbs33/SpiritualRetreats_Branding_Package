-- SCOPE-023 / SCOPE-020: owner operating model and category other text

ALTER TABLE public.retreat_submissions
  ADD COLUMN IF NOT EXISTS owner_type text
    CHECK (owner_type IS NULL OR owner_type IN ('venue_only', 'program_operator')),
  ADD COLUMN IF NOT EXISTS category_other text;

COMMENT ON COLUMN public.retreat_submissions.owner_type IS 'venue_only | program_operator — retreat owner operating model';
COMMENT ON COLUMN public.retreat_submissions.category_other IS 'Free text when category includes other';
