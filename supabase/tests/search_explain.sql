-- EXECUTION PLAN: retreat search queries
-- =============================================================================
-- Run in Supabase SQL Editor AFTER Migration A has been applied.
-- Shows EXPLAIN ANALYZE output for the main search query patterns so the
-- owner can verify index usage, join performance, and scan costs.
-- =============================================================================

-- 1. Full-text search via search_tsv
EXPLAIN ANALYZE
SELECT id, title, ts_rank(search_tsv, websearch_to_tsquery('english', 'yoga meditation')) AS rank
FROM retreats
WHERE status = 'published' AND qualification_status = 'live'
  AND search_tsv @@ websearch_to_tsquery('english', 'yoga meditation')
ORDER BY rank DESC
LIMIT 12;

-- 2. Budget filter (price_from range) + sort
EXPLAIN ANALYZE
SELECT id, title, price_from
FROM retreats
WHERE status = 'published' AND qualification_status = 'live'
  AND price_from >= 1000 AND price_from < 2000
ORDER BY price_from ASC
LIMIT 12;

-- 3. Country filter
EXPLAIN ANALYZE
SELECT id, title, country
FROM retreats
WHERE status = 'published' AND qualification_status = 'live'
  AND country ILIKE 'spain'
ORDER BY sort_order ASC
LIMIT 12;

-- 4. Region filter
EXPLAIN ANALYZE
SELECT id, title, region
FROM retreats
WHERE status = 'published' AND qualification_status = 'live'
  AND region = 'europe'
ORDER BY sort_order ASC
LIMIT 12;

-- 5. Combined: type + budget + region
EXPLAIN ANALYZE
SELECT id, title, price_from, region
FROM retreats
WHERE status = 'published' AND qualification_status = 'live'
  AND type = 'yoga'
  AND price_from >= 0 AND price_from < 2000
  AND region = 'europe'
ORDER BY price_from ASC
LIMIT 12;

-- 6. Departure availability (JOIN)
EXPLAIN ANALYZE
SELECT r.id, r.title, d.start_date, d.end_date
FROM retreats r
JOIN retreat_departures d ON d.retreat_id = r.id
WHERE r.status = 'published' AND r.qualification_status = 'live'
  AND d.status IN ('open','full')
  AND d.start_date >= '2026-06-01' AND d.start_date < '2026-07-01'
ORDER BY d.start_date ASC
LIMIT 12;

-- 7. Facets: distinct countries with counts
EXPLAIN ANALYZE
SELECT country, count(*) AS cnt
FROM retreats
WHERE status = 'published' AND qualification_status = 'live'
GROUP BY country
ORDER BY cnt DESC;

-- 8. Facets: price range (min/max)
EXPLAIN ANALYZE
SELECT min(price_from) AS price_min, max(price_from) AS price_max
FROM retreats
WHERE status = 'published' AND qualification_status = 'live';