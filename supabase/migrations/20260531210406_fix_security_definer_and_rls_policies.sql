-- Migration: fix_security_definer_and_rls_policies
-- Resolves Supabase dashboard security advisories:
--
-- 1. SECURITY DEFINER function public.rls_auto_enable() [Frankfurt only]
--    Exists on fresh Supabase projects. Event trigger functions are invoked
--    by the PostgreSQL engine on DDL events only — anon/authenticated must
--    not execute them directly. Uses DO block to skip gracefully if absent.
--
-- 2. RLS Enabled No Policy (8 tables)
--    Explicit USING (false) RESTRICTIVE policies make deny-all intent clear.
--    service_role bypasses RLS so server-side API writes are unaffected.

-- FIX 1: Revoke execute on SECURITY DEFINER event trigger (idempotent)
DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
  REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
  REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
EXCEPTION WHEN undefined_function THEN
  NULL; -- Function absent on this project — no action needed
END;
$$;

-- FIX 2: Explicit deny-all on server-write-only tables (idempotent)

CREATE POLICY "deny_public_access" ON public.contact_inquiries
  AS RESTRICTIVE TO anon, authenticated USING (false);

CREATE POLICY "deny_public_access" ON public.events
  AS RESTRICTIVE TO anon, authenticated USING (false);

CREATE POLICY "deny_public_access" ON public.newsletter_subscriptions
  AS RESTRICTIVE TO anon, authenticated USING (false);

CREATE POLICY "deny_public_access" ON public.seeker_discovery_responses
  AS RESTRICTIVE TO anon, authenticated USING (false);

CREATE POLICY "deny_public_access" ON public.retreat_submissions
  AS RESTRICTIVE TO anon, authenticated USING (false);

CREATE POLICY "deny_public_access" ON public.facilitator_onboarding_responses
  AS RESTRICTIVE TO anon, authenticated USING (false);

CREATE POLICY "deny_public_access" ON public.facilitator_matching_requests
  AS RESTRICTIVE TO anon, authenticated USING (false);

CREATE POLICY "deny_public_access" ON public.matches
  AS RESTRICTIVE TO anon, authenticated USING (false);
