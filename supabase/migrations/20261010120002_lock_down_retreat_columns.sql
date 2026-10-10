-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  DO NOT APPLY until new code is on main                                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Revokes anon/authenticated SELECT on public.retreats.
-- Admin (service_role) continues to read/write the base table.
--
-- Public pages read through server-only code using the service-role key;
-- the anon key is not used for retreats after Migration C.
--
-- CURRENT STATE (2026-10-10):
--   - origin/main code: queries public.retreats directly with anon client.
--     Explicit column list, so it never reads new sensitive columns.
--     Revoking SELECT breaks the old code — it doesn't use the service-role
--     client yet.
--   - milestone-3-retreats code: src/lib/retreats/queries.ts uses
--     createAdminClient() (service-role) for all reads.  Safe to apply
--     this migration only AFTER that code is deployed to production.
--
-- Apply AFTER merging milestone-3 to main and verifying the Vercel deploy.
-- =============================================================================

REVOKE SELECT ON public.retreats FROM anon;
REVOKE SELECT ON public.retreats FROM authenticated;