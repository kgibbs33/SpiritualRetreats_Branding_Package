-- SCOPE-032 / SCOPE-034: facilitator looking-for, rates, promotion consent, profile links

ALTER TABLE public.facilitator_matching_requests
  ADD COLUMN IF NOT EXISTS looking_for text,
  ADD COLUMN IF NOT EXISTS hourly_rate_cents integer,
  ADD COLUMN IF NOT EXISTS daily_rate_cents integer,
  ADD COLUMN IF NOT EXISTS promotion_consent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS open_to_work boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS social_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS referral_name text,
  ADD COLUMN IF NOT EXISTS referral_email text,
  ADD COLUMN IF NOT EXISTS referral_relationship text,
  ADD COLUMN IF NOT EXISTS address_line text,
  ADD COLUMN IF NOT EXISTS address_city text,
  ADD COLUMN IF NOT EXISTS address_country text;

COMMENT ON COLUMN public.facilitator_matching_requests.looking_for IS 'What the facilitator is seeking from retreat owners (SCOPE Q8)';
COMMENT ON COLUMN public.facilitator_matching_requests.hourly_rate_cents IS 'Optional hourly rate in cents (SCOPE Q9)';
COMMENT ON COLUMN public.facilitator_matching_requests.daily_rate_cents IS 'Optional day rate in cents (SCOPE Q9)';
