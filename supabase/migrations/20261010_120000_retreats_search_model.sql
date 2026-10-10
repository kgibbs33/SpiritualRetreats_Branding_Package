-- Migration: retreat search model (ADDITIVE — safe to run on live DB)
-- =============================================================================
-- Adds departures, enquiries, search_alerts, and new columns to retreats.
-- No DROPs, no renames, no policy/column/function alterations.
-- The old code on main reads retreats via select(*) — new columns are all
-- nullable or defaulted, so the old code sees no difference.
-- =============================================================================

-- ── New columns on retreats (all nullable or defaulted) ────────────────────

ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE public.retreats ADD COLUMN IF NOT EXISTS region text;
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

-- Full-text search (generated column, immutable only if using 'english' regconfig)
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

-- ── Backfill: currently published retreats → qualification_status = 'live' ──
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

-- Anon: read departures only when the retreat is published+live and departure is open/full.
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
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.retreat_enquiries (status);

ALTER TABLE public.retreat_enquiries ENABLE ROW LEVEL SECURITY;
-- No SELECT policy for anon/authenticated — written only via service_role.

-- ── search_alerts ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.search_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  criteria jsonb DEFAULT '{}',
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.search_alerts ENABLE ROW LEVEL SECURITY;
-- No SELECT policy for anon/authenticated — written only via service_role.

-- ── retreats_public view (excludes internal columns) ────────────────────────

CREATE OR REPLACE VIEW public.retreats_public AS
SELECT
  id, slug, title, type, categories, location, country, region,
  dates_display, price_display, price_from, price_currency, price_notes,
  image_path, gallery_paths,
  rating, review_count, badge, description,
  inclusions, exclusions, itinerary,
  operator_name, operator_website,
  min_age, max_age, age_notes,
  booking_url, commercial_status, qualification_status,
  status, trust_tier, verified_at, credibility_note,
  sort_order, created_at, updated_at,
  search_tsv
FROM public.retreats;

-- ═════════════════════════════════════════════════════════════════════════════
-- ROLLBACK (commented — run only if needed)
-- ═════════════════════════════════════════════════════════════════════════════
-- DROP VIEW IF EXISTS public.retreats_public;
-- DROP TABLE IF EXISTS public.search_alerts;
-- DROP TABLE IF EXISTS public.retreat_enquiries;
-- DROP TABLE IF EXISTS public.retreat_departures;
-- ALTER TABLE public.retreats
--   DROP COLUMN IF EXISTS search_tsv,
--   DROP COLUMN IF EXISTS internal_notes,
--   DROP COLUMN IF EXISTS qualification_checks,
--   DROP COLUMN IF EXISTS qualification_status,
--   DROP COLUMN IF EXISTS commercial_status,
--   DROP COLUMN IF EXISTS booking_url,
--   DROP COLUMN IF EXISTS age_notes,
--   DROP COLUMN IF EXISTS max_age,
--   DROP COLUMN IF EXISTS min_age,
--   DROP COLUMN IF EXISTS operator_website,
--   DROP COLUMN IF EXISTS operator_name,
--   DROP COLUMN IF EXISTS gallery_paths,
--   DROP COLUMN IF EXISTS itinerary,
--   DROP COLUMN IF EXISTS exclusions,
--   DROP COLUMN IF EXISTS inclusions,
--   DROP COLUMN IF EXISTS price_notes,
--   DROP COLUMN IF EXISTS price_currency,
--   DROP COLUMN IF EXISTS price_from,
--   DROP COLUMN IF EXISTS region,
--   DROP COLUMN IF EXISTS country;