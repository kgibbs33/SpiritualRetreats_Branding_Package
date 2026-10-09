-- RLS verification: anonymous + authenticated users can only read
-- published retreats/facilitators, and cannot read any submission table.
--
-- HOW TO RUN: Paste this entire file into the Supabase SQL Editor
-- and run it.  Read the result messages.
--
-- EXPECTED RESULTS (see annotations on each SELECT):
--   - Every submission/events table: 0 rows OR "permission denied" = SAFE
--   - retreats / facilitators: only rows with status = 'published' returned
--
-- This script is READ-ONLY (SELECT only).  Safe to run on the live database.

-- ═══════════════════════════════════════════════════════════════════════
-- SECTION 1 — anon role (public, unauthenticated visitors)
-- ═══════════════════════════════════════════════════════════════════════

set role anon;

-- ── Submission tables (expected: 0 rows OR permission denied) ─────────

select 'contact_inquiries'       as table_name, count(*) as rows_found from contact_inquiries;
select 'retreat_submissions'     as table_name, count(*) as rows_found from retreat_submissions;
select 'venue_submissions'       as table_name, count(*) as rows_found from venue_submissions;
select 'seeker_discovery'        as table_name, count(*) as rows_found from seeker_discovery_responses;
select 'newsletter_subscriptions' as table_name, count(*) as rows_found from newsletter_subscriptions;
select 'facilitator_onboarding'  as table_name, count(*) as rows_found from facilitator_onboarding_responses;
select 'facilitator_matching'    as table_name, count(*) as rows_found from facilitator_matching_requests;
select 'events'                  as table_name, count(*) as rows_found from events;
select 'matches'                 as table_name, count(*) as rows_found from matches;

-- ── Published directories (expected: only status = 'published') ───────

select status, count(*) as cnt from retreats    group by status;
select status, count(*) as cnt from facilitators group by status;

reset role;

-- ═══════════════════════════════════════════════════════════════════════
-- SECTION 2 — authenticated role (logged-in users, no admin session)
-- ═══════════════════════════════════════════════════════════════════════

set role authenticated;

select 'contact_inquiries'       as table_name, count(*) as rows_found from contact_inquiries;
select 'retreat_submissions'     as table_name, count(*) as rows_found from retreat_submissions;
select 'venue_submissions'       as table_name, count(*) as rows_found from venue_submissions;
select 'seeker_discovery'        as table_name, count(*) as rows_found from seeker_discovery_responses;
select 'newsletter_subscriptions' as table_name, count(*) as rows_found from newsletter_subscriptions;
select 'facilitator_onboarding'  as table_name, count(*) as rows_found from facilitator_onboarding_responses;
select 'facilitator_matching'    as table_name, count(*) as rows_found from facilitator_matching_requests;
select 'events'                  as table_name, count(*) as rows_found from events;
select 'matches'                 as table_name, count(*) as rows_found from matches;

reset role;

-- ═══════════════════════════════════════════════════════════════════════
-- INTERPRETATION
-- ═══════════════════════════════════════════════════════════════════════
-- If any submission/events/match row has rows_found > 0, RLS is broken.
-- For retreats/facilitators: if rows with status <> 'published' appear,
-- the RLS policy is too permissive.