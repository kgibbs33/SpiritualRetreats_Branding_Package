-- SCOPE-031 (best-practice follow-up): GIN indexes on the practice_areas arrays.
-- The facilitator directory search (SCOPE-036) will filter by skill with array
-- containment/overlap (`practice_areas @> ARRAY['yoga']`, PostgREST `cs`/`ov`).
-- Per Postgres/Supabase guidance, those operators use a GIN index; without one
-- they fall back to a sequential scan. Additive and idempotent.

CREATE INDEX IF NOT EXISTS idx_facilitator_onboarding_practice_areas
  ON public.facilitator_onboarding_responses USING gin (practice_areas);

CREATE INDEX IF NOT EXISTS idx_fmr_practice_areas
  ON public.facilitator_matching_requests USING gin (practice_areas);
