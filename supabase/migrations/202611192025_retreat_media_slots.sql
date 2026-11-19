-- Owner approved 2026-11-19. Additive only. No existing retreat/submission rows touched.
BEGIN;
CREATE TABLE public.retreat_media_slots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 retreat_id uuid REFERENCES public.retreats(id) ON DELETE RESTRICT,
 preview_key text CHECK (preview_key IN ('preview-madeira','preview-brazil','preview-tulum','preview-peru')),
 slot_key text NOT NULL CHECK (slot_key IN ('hero','gallery-1','gallery-2','gallery-3','gallery-4')),
 storage_path text NOT NULL UNIQUE,
 alt_text text NOT NULL CHECK (length(alt_text) BETWEEN 1 AND 300),
 credit text NOT NULL CHECK (length(credit) BETWEEN 1 AND 1000),
 source_url text NOT NULL DEFAULT '' CHECK (length(source_url)<=2000),
 license_note text NOT NULL CHECK (length(license_note) BETWEEN 1 AND 1000),
 rights_confirmed boolean NOT NULL CHECK (rights_confirmed),
 illustrative boolean NOT NULL DEFAULT false,
 review_state text NOT NULL DEFAULT 'pending' CHECK (review_state IN ('pending','approved','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),
 approved_at timestamptz,
 CHECK ((retreat_id IS NOT NULL)::int + (preview_key IS NOT NULL)::int = 1),
 CHECK ((review_state='approved') = (approved_at IS NOT NULL))
);
CREATE INDEX retreat_media_slots_retreat ON public.retreat_media_slots(retreat_id,slot_key,approved_at DESC);
CREATE INDEX retreat_media_slots_preview ON public.retreat_media_slots(preview_key,slot_key,approved_at DESC);
ALTER TABLE public.retreat_media_slots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.retreat_media_slots FROM anon,authenticated;
GRANT ALL ON public.retreat_media_slots TO service_role;
-- Revisions are append-only on upload. Approval picks the newest approved revision.
-- This avoids destroying an approved image when a replacement upload fails.
COMMIT;
