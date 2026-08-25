-- M3: facilitator matching requests — facilitators express availability and collaboration intent.
-- Distinct from facilitator_onboarding_responses (identity/profile) which already exists.

CREATE TABLE IF NOT EXISTS public.facilitator_matching_requests (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name               text        NOT NULL,
  email                   text        NOT NULL,
  phone                   text,

  -- What they offer
  practice_areas          text[]      NOT NULL DEFAULT '{}',   -- multi-select: yoga, meditation, breathwork, etc.
  session_format          text,                                -- group | one-to-one | both
  experience_years        text,                                -- lt2 | 2to5 | 5to10 | gt10

  -- What they're looking for
  retreat_duration_pref   text[]      NOT NULL DEFAULT '{}',   -- multi: day | weekend | week | twoweeks | flexible
  setting_preference      text[]      NOT NULL DEFAULT '{}',   -- multi: jungle | ocean | mountains | desert | countryside | any
  group_size_preference   text,                                -- intimate | small | medium | large
  region_preference       text,                                -- free text

  -- Availability & terms
  availability_notes      text,                                -- free text ("available from June", "3 months notice", etc.)
  compensation_preference text,                                -- revenue-share | day-rate | volunteer | open

  -- Bio / extra context
  bio                     text,                                -- facilitator's pitch to retreat owners
  special_requests        text,

  status                  text        NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewed', 'matched', 'closed')),

  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fmr_email   ON public.facilitator_matching_requests (email);
CREATE INDEX IF NOT EXISTS idx_fmr_created ON public.facilitator_matching_requests (created_at);
CREATE INDEX IF NOT EXISTS idx_fmr_status  ON public.facilitator_matching_requests (status);

COMMENT ON TABLE public.facilitator_matching_requests IS
  'M3: facilitators expressing availability & collaboration intent; admin-only reads via service role';

ALTER TABLE public.facilitator_matching_requests ENABLE ROW LEVEL SECURITY;
