-- RLS verification: anonymous users can read only published retreats and
-- published facilitators, and cannot read any submission table.
--
-- Run this in the Supabase SQL editor (do NOT run via migration tool).
-- Expected result: every SELECT below returns 0 rows (empty set), proving
-- anonymous access is denied.  Only retreats/facilitators with published
-- status should return rows (those tests are true-positive — data-dependent).

-- ── Submission tables (must return 0 rows for anon) ─────────────────────

-- Attempt to read contact_inquiries as anon (must fail)
SELECT 'contact_inquiries' AS table_name, count(*) AS rows_found
  FROM contact_inquiries
  LIMIT 1;

-- Attempt to read retreat_submissions as anon
SELECT 'retreat_submissions' AS table_name, count(*) AS rows_found
  FROM retreat_submissions
  LIMIT 1;

-- Attempt to read venue_submissions as anon
SELECT 'venue_submissions' AS table_name, count(*) AS rows_found
  FROM venue_submissions
  LIMIT 1;

-- Attempt to read seeker_discovery_responses as anon
SELECT 'seeker_discovery_responses' AS table_name, count(*) AS rows_found
  FROM seeker_discovery_responses
  LIMIT 1;

-- Attempt to read newsletter_subscriptions as anon
SELECT 'newsletter_subscriptions' AS table_name, count(*) AS rows_found
  FROM newsletter_subscriptions
  LIMIT 1;

-- Attempt to read facilitator_onboarding_responses as anon
SELECT 'facilitator_onboarding_responses' AS table_name, count(*) AS rows_found
  FROM facilitator_onboarding_responses
  LIMIT 1;

-- Attempt to read facilitator_matching_requests as anon
SELECT 'facilitator_matching_requests' AS table_name, count(*) AS rows_found
  FROM facilitator_matching_requests
  LIMIT 1;

-- ── Published retreats (may return rows if data exists) ────────────────

-- Read retreats as anon — should return only rows where published = true
SELECT 'retreats (anon)' AS table_name, count(*) AS rows_found
  FROM retreats;

-- Read facilitators as anon — should return only rows where published = true
SELECT 'facilitators (anon)' AS table_name, count(*) AS rows_found
  FROM facilitators;

-- ── Events table (RLS enabled, should be deny-all) ─────────────────────
SELECT 'events' AS table_name, count(*) AS rows_found
  FROM events
  LIMIT 1;

-- ── Interpretation ─────────────────────────────────────────────────────
-- If any submission/events row has rows_found > 0, RLS is misconfigured.
-- If retreats rows_found > 0 but those rows are NOT published, RLS is
-- misconfigured (anon should only see published = true).