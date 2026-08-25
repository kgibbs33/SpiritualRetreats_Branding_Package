-- SCOPE-028: facilitator CV / credentials document (PDF) upload.
-- Reuses the existing private `facilitator-media` bucket (no new infra). The PDF
-- is admin-only: it lets the RE:TREAT team verify a facilitator's credentials
-- during manual matching / trust-tiering. Never shown publicly.

-- 1. Path column on the facilitator profile (nullable; the CV is optional).
ALTER TABLE public.facilitator_onboarding_responses
  ADD COLUMN IF NOT EXISTS cv_path text;

COMMENT ON COLUMN public.facilitator_onboarding_responses.cv_path IS
  'SCOPE-028: object path in the private facilitator-media bucket (facilitators/cv/<uuid>.pdf). Admin-only; serve via forced-download signed URL.';

-- 2. Allow PDFs in the existing private bucket alongside images. Space-lean:
--    keep the 5 MB cap (CVs are typically < 2 MB). Bucket stays private, so the
--    only access path remains the service-role API routes + signed URLs.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    file_size_limit = 5242880 -- 5 MB
WHERE id = 'facilitator-media';
