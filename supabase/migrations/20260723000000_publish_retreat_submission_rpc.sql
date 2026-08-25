-- H3: Atomic publish of a retreat submission into the public directory.
--
-- Previously the admin approve route performed three separate writes in
-- sequence (upsert the public `retreats` row, flip the submission to
-- 'approved', insert an audit event). If any later write failed, the system
-- was left inconsistent: a published listing with the submission still
-- 'pending', or a published listing with no audit event. This function does
-- all of it inside a single transaction (one RPC == one transaction over
-- PostgREST), so a failure at any step rolls the whole thing back.
--
-- Slug generation stays in TypeScript (buildSlugFromSubmission); the caller
-- passes the finished slug in as `target_slug` so the SQL never reimplements
-- slug logic and the two can never drift.
--
-- Mirrors src/lib/retreats/publish-from-submission.ts field-for-field:
--   title         := trim(retreat_title)          (NOT NULL upstream)
--   type          := 'wellness'                   (constant, as in TS)
--   location      := trim(location)               (NULL stays NULL)
--   price_display := trim(price_range) or 'Inquire'
--   image_path    := '/images/yoga-retreat.jpg'   (DEFAULT_IMAGE)
--   badge         := 'New listing'
--   trust_tier    := 'listed'
--   dates_display := CASE (both / start / end / 'Dates TBD')
--
-- Security: SECURITY DEFINER with a pinned search_path so it always resolves
-- objects in `public` regardless of caller settings. EXECUTE is revoked from
-- PUBLIC/anon/authenticated and granted only to service_role — the
-- server-side secret key the API routes use. Without that GRANT the app
-- (which calls this via the service_role key) cannot invoke it at all.

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
BEGIN
  -- Lock the submission for the length of the transaction so concurrent
  -- approve calls serialize instead of racing.
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

  -- Human-readable date range, mirroring datesDisplayFromSubmission().
  v_dates_display := CASE
    WHEN sub.start_date IS NOT NULL AND sub.end_date IS NOT NULL
      THEN sub.start_date::text || ' – ' || sub.end_date::text
    WHEN sub.start_date IS NOT NULL THEN sub.start_date::text
    WHEN sub.end_date IS NOT NULL THEN sub.end_date::text
    ELSE 'Dates TBD'
  END;

  -- Idempotent promotion: update the row already promoted from this
  -- submission, otherwise insert a fresh one. source_submission_id is UNIQUE.
  SELECT id INTO existing_id
  FROM public.retreats
  WHERE source_submission_id = submission_id;

  IF existing_id IS NOT NULL THEN
    UPDATE public.retreats
    SET
      slug             = target_slug,
      title            = trim(sub.retreat_title),
      type             = 'wellness',
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
      'wellness',
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

  -- Flip the submission to approved.
  UPDATE public.retreat_submissions
  SET status = 'approved'
  WHERE id = submission_id;

  -- Append-only audit event, same shape the route inserted before.
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

-- Least privilege: only the server-side service_role may call this.
REVOKE ALL ON FUNCTION public.publish_retreat_submission(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_retreat_submission(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.publish_retreat_submission(uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.publish_retreat_submission(uuid, text) TO service_role;
