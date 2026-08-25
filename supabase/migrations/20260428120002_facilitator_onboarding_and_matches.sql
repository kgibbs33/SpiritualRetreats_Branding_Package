-- Facilitator onboarding capture; manual matches (service-role API only).

CREATE TABLE IF NOT EXISTS public.facilitator_onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  practice_focus text,
  credentials text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now ()
);

CREATE INDEX IF NOT EXISTS idx_facilitator_onboarding_email ON public.facilitator_onboarding_responses (email);
CREATE INDEX IF NOT EXISTS idx_facilitator_onboarding_created ON public.facilitator_onboarding_responses (created_at);

COMMENT ON TABLE public.facilitator_onboarding_responses IS 'M3 facilitator intake; admin client in API routes only';

ALTER TABLE public.facilitator_onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  seeker_discovery_response_id uuid REFERENCES seeker_discovery_responses (id) ON DELETE SET NULL,
  retreat_id uuid NOT NULL REFERENCES retreats (id) ON DELETE CASCADE,
  seeker_email text NOT NULL,
  facilitator_email text NOT NULL,
  seeker_name text,
  facilitator_name text,
  status text NOT NULL DEFAULT 'recorded' CHECK (
    status IN ('recorded', 'notified', 'closed')
  ),
  operator_notes text,
  created_at timestamptz NOT NULL DEFAULT now ()
);

CREATE INDEX IF NOT EXISTS idx_matches_retreat ON public.matches (retreat_id);
CREATE INDEX IF NOT EXISTS idx_matches_seeker_resp ON public.matches (seeker_discovery_response_id);
CREATE INDEX IF NOT EXISTS idx_matches_created ON public.matches (created_at);

COMMENT ON TABLE public.matches IS 'Operator-created matches; no public policies — secret API + service role';

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
