-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  DO NOT APPLY until new code is on main                                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Revokes anon/authenticated SELECT on sensitive retreats columns and
-- grants public access through retreats_public (created in Migration A).
-- Admin (service_role) continues to read/write the base table.
--
-- CURRENT STATE (2026-10-10):
--   - origin/main code: queries public.retreats directly with anon client.
--     It uses an explicit column list that does NOT include the new
--     sensitive columns, so it never reads them.  However, the SELECT
--     privilege is at TABLE level — revoking it breaks the old code
--     because it doesn't know about retreats_public.
--   - milestone-3-retreats code: the anon query paths in
--     src/lib/retreats/queries.ts now use retreats_public instead of
--     retreats.  This migration will work ONLY when that code is deployed
--     to production (merged to main).
--
-- Apply AFTER merging milestone-3 to main and verifying the Vercel deploy.
-- =============================================================================

-- Public pages read through server-only code using the service-role key;
-- the anon key is not used for retreats after Migration C.
REVOKE SELECT ON public.retreats FROM anon;
REVOKE SELECT ON public.retreats FROM authenticated;