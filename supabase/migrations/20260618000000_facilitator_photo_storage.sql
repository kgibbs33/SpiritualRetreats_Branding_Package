-- SCOPE-026: facilitator profile photo upload.
-- Private Supabase Storage bucket + a path column on the facilitator profile.
-- Access is server-only: uploads/reads go through Next.js API routes using the
-- service-role key (bypasses RLS) and short-lived signed URLs. Anon and
-- authenticated clients have NO access (privacy-safe).

-- 1. Path column on the facilitator profile (nullable; photo is optional).
ALTER TABLE public.facilitator_onboarding_responses
  ADD COLUMN IF NOT EXISTS photo_path text;

COMMENT ON COLUMN public.facilitator_onboarding_responses.photo_path IS
  'Object path in the private facilitator-media bucket (e.g. facilitators/<uuid>.jpg). Serve via signed URL.';

-- 2. Private bucket with hard MIME + size limits enforced by Storage itself
--    (defense in depth, on top of the API route validation).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'facilitator-media',
  'facilitator-media',
  false,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. No RLS policies are added for this bucket on purpose: with none present,
--    RLS denies all anon/authenticated access, and only the service-role key
--    (used by the API routes) can read or write. This keeps headshots private.
