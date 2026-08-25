-- SCOPE-036/037: availability flag on published facilitators.
-- Drives the directory's "open to work" filter (SCOPE-036) and the
-- open-to-work-first sort + admin toggle (SCOPE-037). Default true (a published
-- facilitator is assumed open to retreat collaborations until set otherwise).

ALTER TABLE public.facilitators
  ADD COLUMN IF NOT EXISTS open_to_work boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.facilitators.open_to_work IS
  'SCOPE-036/037: facilitator is open to retreat collaborations. Filterable + sorted-first in the public directory; admin-settable.';

CREATE INDEX IF NOT EXISTS idx_facilitators_open_to_work
  ON public.facilitators (open_to_work);
