-- Migration: retreat search model (ADDITIVE — safe to run on live DB)
-- =============================================================================
-- Adds departures, enquiries, search_alerts, new columns to retreats,
-- a public-safe view, and backfills existing published retreats.
-- No DROPs, renames, policy/column/function alterations.
--
-- The CURRENT code on origin/main queries public.retreats directly with an
-- anon client (explicit column list — does NOT include the sensitive columns
-- added here). The old code continues to work unchanged because all new
-- columns are nullable/defaulted and the old SELECT list never picks them up.
-- =============================================================================

-- ── New columns on retreats (all nullable or defaulted) ────────────────────

ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS region text CHECK (
  region IS NULL OR region IN (
    'europe','latin_america','asia','africa',
    'north_america','oceania','middle_east'
  )
);
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS price_from numeric;
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS price_currency text DEFAULT 'EUR';
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS price_notes text;
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS inclusions text[];
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS exclusions text[];
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS itinerary jsonb DEFAULT '[]';
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS gallery_paths text[];
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS operator_name text;
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS operator_website text;
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS min_age int;
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS max_age int;
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS age_notes text;
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS booking_url text;
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS commercial_status text CHECK (commercial_status IN ('free_listing','promotion','commission','partnership','other'));
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS qualification_status text DEFAULT 'submitted' CHECK (qualification_status IN ('submitted','reviewed','approved','live','inactive','archived'));
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS qualification_checks jsonb DEFAULT '{}';
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS internal_notes text;

ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(location, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(country, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_retreats_search_tsv ON public.retreats USING GIN (search_tsv);
CREATE INDEX IF NOT EXISTS idx_retreats_country ON public.retreats (country);
CREATE INDEX IF NOT EXISTS idx_retreats_region ON public.retreats (region);
CREATE INDEX IF NOT EXISTS idx_retreats_price_from ON public.retreats (price_from);
CREATE INDEX IF NOT EXISTS idx_retreats_qualification_status ON public.retreats (qualification_status);

-- ── Backfill: published retreats → qualification_status = 'live' ────────────
UPDATE public.retreats SET qualification_status = 'live' WHERE status = 'published';

-- ── retreat_departures ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.retreat_departures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retreat_id uuid NOT NULL REFERENCES public.retreats(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  capacity int,
  spots_left int,
  price_override numeric,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','full','cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_departures_retreat_id ON public.retreat_departures (retreat_id);
CREATE INDEX IF NOT EXISTS idx_departures_start_date ON public.retreat_departures (start_date);

ALTER TABLE public.retreat_departures ENABLE ROW LEVEL SECURITY;

CREATE POLICY retreat_departures_anon_select ON public.retreat_departures
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.retreats r
      WHERE r.id = retreat_id
        AND r.status = 'published'
        AND r.qualification_status = 'live'
    )
    AND status IN ('open', 'full')
  );

-- ── retreat_enquiries / booking requests ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.retreat_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retreat_id uuid REFERENCES public.retreats(id),
  departure_id uuid REFERENCES public.retreat_departures(id),
  kind text NOT NULL CHECK (kind IN ('enquiry','booking_request')),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  participants int,
  message text,
  consent boolean NOT NULL DEFAULT false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_retreat_id ON public.retreat_enquiries (retreat_id);
ALTER TABLE public.retreat_enquiries ENABLE ROW LEVEL SECURITY;

-- ── search_alerts ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.search_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  criteria jsonb DEFAULT '{}',
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;

-- ── retreats_public view (excludes internal columns, filters by status) ─────
-- Uses security_invoker = true so callers see only their own RLS grants.
-- Migration C will grant SELECT on this view; until then, nothing is exposed.

CREATE OR REPLACE VIEW public.retreats_public
WITH (security_invoker = true)
AS
SELECT
  id, slug, title, type, categories, location, country, region,
  dates_display, price_display, price_from, price_currency, price_notes,
  image_path, gallery_paths,
  rating, review_count, badge, description,
  inclusions, exclusions, itinerary,
  operator_name, operator_website,
  min_age, max_age, age_notes,
  booking_url,
  -- EXCLUDED: commercial_status, qualification_status, qualification_checks,
  -- internal_notes, operator contact details not meant for public
  status, trust_tier, verified_at, credibility_note,
  sort_order, created_at, updated_at,
  search_tsv
FROM public.retreats
WHERE status = 'published' AND qualification_status = 'live';

REVOKE ALL ON public.retreats_public FROM anon, authenticated;

-- ═════════════════════════════════════════════════════════════════════════════
-- VERIFICATION (commented — run manually after applying)
-- ═════════════════════════════════════════════════════════════════════════════
-- set role anon;
-- -- Should return 0 — view is REVOKE ALL until Migration C
-- select count(*) from retreats_public;
-- -- Should also return 0 — anon can't read base table for non-published rows
-- select count(*) from retreats where status <> 'published';
-- reset role;
--
-- EXPECTED: both SELECTs return 0 rows OR "permission denied"
-- =============================================================================

-- ═════════════════════════════════════════════════════════════════════════════
-- ROLLBACK (commented)
-- ═════════════════════════════════════════════════════════════════════════════
-- DROP VIEW IF EXISTS public.retreats_public;
-- DROP TABLE IF EXISTS public.search_alerts;
-- DROP TABLE IF EXISTS public.retreat_enquiries;
-- DROP TABLE IF EXISTS public.retreat_departures;
-- (column-level rollback not listed — non-destructive, keep columns)