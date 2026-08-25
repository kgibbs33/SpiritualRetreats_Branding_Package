-- Migration: enable_rls_server_write_tables
-- Resolves: supabase db advisors rls_disabled_in_public ERROR on 5 tables
--
-- These tables are written to exclusively via the SUPABASE_SECRET_KEY
-- (service_role), which bypasses RLS entirely. Enabling RLS with zero
-- policies produces deny-all for anon/authenticated — correct posture.
-- Reference: https://supabase.com/docs/guides/database/hardening-data-api

ALTER TABLE public.contact_inquiries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker_discovery_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retreat_submissions        ENABLE ROW LEVEL SECURITY;
