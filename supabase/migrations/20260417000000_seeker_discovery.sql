-- Seeker questionnaire / discovery capture (M2 + PDF spec)
CREATE TABLE IF NOT EXISTS seeker_discovery_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone_whatsapp text,
  travel_dates text,
  travel_dates_flexible boolean NOT NULL DEFAULT false,
  destination_region text,
  budget_range text,
  purpose text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  reflection_intention text,
  reflection_great_retreat text,
  reflection_special_requests text,
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seeker_discovery_email ON seeker_discovery_responses (email);
CREATE INDEX IF NOT EXISTS idx_seeker_discovery_created ON seeker_discovery_responses (created_at);
