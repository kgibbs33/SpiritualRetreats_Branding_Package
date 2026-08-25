-- SCOPE-038: facilitator "store and display" — define the single source of truth
-- for published facilitator profiles + the review/publish workflow.
--
-- Mirrors the retreats architecture (retreat_submissions -> retreats):
--   facilitator_onboarding_responses (private raw intake, RLS no-policy)
--     --operator/admin publish-->  facilitators (curated, public, status-gated)
--
-- The `facilitators` table holds ONLY public-safe, curated columns. It never
-- contains email / phone / CV / referrals / credentials, so even with anon
-- read access (published rows only) no sensitive or third-party data leaks.

-- 1. Review workflow status on the raw intake table.
ALTER TABLE public.facilitator_onboarding_responses
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewed', 'published', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_facilitator_onboarding_status
  ON public.facilitator_onboarding_responses (status);

-- 2. Published directory table (the display SSOT).
CREATE TABLE IF NOT EXISTS public.facilitators (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_onboarding_id uuid UNIQUE REFERENCES public.facilitator_onboarding_responses (id) ON DELETE SET NULL,
  slug                 text UNIQUE NOT NULL,
  display_name         text NOT NULL,
  headline             text,
  bio                  text,
  city                 text,
  region               text,
  country              text,
  practice_areas       text[] NOT NULL DEFAULT '{}',
  website_url          text,
  linkedin_url         text,
  instagram_url        text,
  photo_path           text,  -- private bucket path; the directory serves it via a signed URL
  status               text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  published_at         timestamptz
);

COMMENT ON TABLE public.facilitators IS
  'Published facilitator directory rows (display SSOT). Curated public-safe subset promoted from facilitator_onboarding_responses; anon may SELECT only status=published (RLS).';

CREATE INDEX IF NOT EXISTS idx_facilitators_status ON public.facilitators (status);
CREATE INDEX IF NOT EXISTS idx_facilitators_practice_areas
  ON public.facilitators USING gin (practice_areas);

-- 3. Public read access: anon/authenticated may read ONLY published rows.
ALTER TABLE public.facilitators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "facilitators_select_published_anon" ON public.facilitators;
CREATE POLICY "facilitators_select_published_anon"
  ON public.facilitators FOR SELECT
  TO anon
  USING (status = 'published');

DROP POLICY IF EXISTS "facilitators_select_published_authenticated" ON public.facilitators;
CREATE POLICY "facilitators_select_published_authenticated"
  ON public.facilitators FOR SELECT
  TO authenticated
  USING (status = 'published');

GRANT SELECT ON public.facilitators TO anon;
