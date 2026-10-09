-- Venue application intake (Milestone 1) with approval workflow.
-- Mirrors retreat_submissions: written only via service_role (RLS deny-all
-- for anon/authenticated), status pending → approved/rejected.
CREATE TABLE IF NOT EXISTS venue_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  venue_name text NOT NULL,
  relationship text CHECK (relationship IN ('owner', 'manager', 'other')),
  website text,
  country text,
  location text,
  capacity integer,
  bedrooms integer,
  practice_space boolean,
  practice_space_details text,
  catering text,
  exclusive_use boolean,
  facilities text,
  suitable_retreat_types text,
  access_notes text,
  price_range text,
  minimum_stay text,
  description text,
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venue_submissions_status ON venue_submissions (status);
CREATE INDEX IF NOT EXISTS idx_venue_submissions_created ON venue_submissions (created_at);

-- RLS: deny-all for anon/authenticated; app writes via service_role only.
ALTER TABLE public.venue_submissions ENABLE ROW LEVEL SECURITY;