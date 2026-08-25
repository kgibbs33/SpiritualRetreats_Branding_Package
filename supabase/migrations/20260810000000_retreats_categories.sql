-- SCOPE-109: published retreats discarded the owner's selected categories.
-- Both publish paths (the operator route's upsertPublishedRetreatFromSubmission
-- and the admin dashboard's publish_retreat_submission RPC) hardcoded
-- retreats.type = 'wellness' regardless of what the owner picked on intake.
-- retreat_submissions.category (text[]) was written correctly and simply
-- never read again. This adds a real categories array to retreats, backfills
-- it from the submission that produced each row, and fixes both write paths
-- (this migration fixes the RPC; publish-from-submission.ts is fixed in the
-- same commit for the TS path). `type` is kept as-is for backward
-- compatibility with existing single-value filters/UI — it is now derived
-- from `categories` instead of being a hardcoded constant.

ALTER TABLE public.retreats
  ADD COLUMN IF NOT EXISTS categories text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.retreats.categories IS 'Full category taxonomy (RetreatCategorySlug[]) selected by the owner at intake. type is derived from this for backward-compat single-value filters.';

-- Follows the precedent in 20260619050000_facilitator_practice_areas_gin.sql:
-- array containment/overlap filters need a GIN index or they fall back to a
-- sequential scan.
CREATE INDEX IF NOT EXISTS idx_retreats_categories
  ON public.retreats USING gin (categories);

-- Backfill from the submission that produced each row (the common case).
UPDATE public.retreats r
SET categories = s.category
FROM public.retreat_submissions s
WHERE r.source_submission_id = s.id
  AND cardinality(r.categories) = 0
  AND s.category IS NOT NULL
  AND cardinality(s.category) > 0;

-- Rows with no source submission (seeded/demo data) or an empty submission
-- category: fall back to their existing single `type` value so nothing ends
-- up with an empty categories array.
UPDATE public.retreats
SET categories = ARRAY[type]
WHERE cardinality(categories) = 0;

-- Fix the RPC write path: derive `type` from `categories` instead of a
-- hardcoded 'wellness' constant, and persist the full `categories` array.
CREATE OR REPLACE FUNCTION public.publish_retreat_submission(
  submission_id uuid,
  target_slug text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub public.retreat_submissions%ROWTYPE;
  existing_id uuid;
  v_dates_display text;
  v_type text;
BEGIN
  SELECT * INTO sub
  FROM public.retreat_submissions
  WHERE id = submission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'retreat submission % not found', submission_id;
  END IF;

  IF sub.status = 'rejected' THEN
    RAISE EXCEPTION 'cannot publish rejected submission %', submission_id;
  END IF;

  v_dates_display := CASE
    WHEN sub.start_date IS NOT NULL AND sub.end_date IS NOT NULL
      THEN sub.start_date::text || ' – ' || sub.end_date::text
    WHEN sub.start_date IS NOT NULL THEN sub.start_date::text
    WHEN sub.end_date IS NOT NULL THEN sub.end_date::text
    ELSE 'Dates TBD'
  END;

  -- Legacy single-value `type` mirrors the four-value set the directory's
  -- explicit type filter still understands (yoga/meditation/wellness/nature):
  -- first matching category from the owner's selection, else 'wellness'.
  SELECT c INTO v_type
  FROM unnest(sub.category) AS c
  WHERE c = ANY (ARRAY['yoga', 'meditation', 'wellness', 'nature'])
  LIMIT 1;
  v_type := COALESCE(v_type, 'wellness');

  SELECT id INTO existing_id
  FROM public.retreats
  WHERE source_submission_id = submission_id;

  IF existing_id IS NOT NULL THEN
    UPDATE public.retreats
    SET
      slug             = target_slug,
      title            = trim(sub.retreat_title),
      type             = v_type,
      categories       = COALESCE(sub.category, '{}'),
      location         = trim(sub.location),
      dates_display    = v_dates_display,
      price_display    = COALESCE(NULLIF(trim(sub.price_range), ''), 'Inquire'),
      image_path       = '/images/yoga-retreat.jpg',
      rating           = NULL,
      review_count     = NULL,
      badge            = 'New listing',
      description      = trim(sub.description),
      status           = 'published',
      sort_order       = 100,
      trust_tier       = 'listed',
      verified_at      = now(),
      credibility_note = NULL,
      updated_at       = now()
    WHERE id = existing_id;
  ELSE
    INSERT INTO public.retreats (
      slug,
      title,
      type,
      categories,
      location,
      dates_display,
      price_display,
      image_path,
      rating,
      review_count,
      badge,
      description,
      status,
      sort_order,
      trust_tier,
      verified_at,
      credibility_note,
      source_submission_id,
      updated_at
    )
    VALUES (
      target_slug,
      trim(sub.retreat_title),
      v_type,
      COALESCE(sub.category, '{}'),
      trim(sub.location),
      v_dates_display,
      COALESCE(NULLIF(trim(sub.price_range), ''), 'Inquire'),
      '/images/yoga-retreat.jpg',
      NULL,
      NULL,
      'New listing',
      trim(sub.description),
      'published',
      100,
      'listed',
      now(),
      NULL,
      submission_id,
      now()
    );
  END IF;

  UPDATE public.retreat_submissions
  SET status = 'approved'
  WHERE id = submission_id;

  INSERT INTO public.events (event_type, entity_type, entity_id, payload)
  VALUES (
    'retreat_published_from_submission',
    'retreat_submission',
    submission_id,
    jsonb_build_object('slug', target_slug)
  );

  RETURN target_slug;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_retreat_submission(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_retreat_submission(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.publish_retreat_submission(uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.publish_retreat_submission(uuid, text) TO service_role;
