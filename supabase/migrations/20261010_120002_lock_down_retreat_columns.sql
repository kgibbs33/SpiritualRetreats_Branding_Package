-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  DO NOT APPLY until new code is on main                                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Revokes anon/authenticated SELECT on sensitive retreats columns and
-- forces public access through the retreats_public view (created in
-- Migration A).  Admin (service_role) continues to read/write via the
-- base table with no restrictions.
--
-- WHY THIS FILE MUST WAIT:
-- The CURRENT code on main (src/lib/retreats/queries.ts) queries
-- `public.retreats` directly, NOT `public.retreats_public`.  It uses an
-- explicit column list — the sensitive columns (internal_notes,
-- qualification_checks, commercial_status, operator_*) are NOT in that
-- list, so the old code never reads them.  However, the SELECT
-- privilege is granted at TABLE level — old code selects from
-- `public.retreats` and expects it to work.  Once we revoke table-level
-- SELECT and redirect to the view, the old code breaks because it
-- doesn't know about `retreats_public`.
--
-- Apply this AFTER deploying the new code that reads from
-- `retreats_public` instead of `retreats` for anon/authenticated queries.
--
-- Sensitive columns being locked down:
--   internal_notes, qualification_checks, commercial_status,
--   operator_name, operator_website

-- Revoke table-level SELECT from anon/authenticated
REVOKE SELECT ON public.retreats FROM anon;
REVOKE SELECT ON public.retreats FROM authenticated;

-- Grant SELECT on the view instead (excludes sensitive columns)
GRANT SELECT ON public.retreats_public TO anon;
GRANT SELECT ON public.retreats_public TO authenticated;