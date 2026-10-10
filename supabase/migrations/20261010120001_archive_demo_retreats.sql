-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  DO NOT APPLY until the owner says                                     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Archives the six demo retreats seeded by 20260428000000_retreats_public_listings.
-- Sets them to status='draft', qualification_status='archived', nulls out the
-- fake rating and review_count.  No rows are deleted — the retreats remain in
-- the DB but are no longer visible to the public.
--
-- Demo retreat slugs:
--   1. mindful-journey-yoga-meditation-nature-mexico
--   2. inner-calm-silent-meditation-peru
--   3. spa-renewal-wellness-detox-bali
--   4. ocean-wellness-beachfront-yoga-breathwork-costa-rica
--   5. sacred-valley-plant-medicine-integration-peru
--   6. restorative-yoga-ayurveda-kerala-india

UPDATE public.retreats
SET
  status = 'draft',
  qualification_status = 'archived',
  rating = NULL,
  review_count = NULL
WHERE slug IN (
  'mindful-journey-yoga-meditation-nature-mexico',
  'inner-calm-silent-meditation-peru',
  'spa-renewal-wellness-detox-bali',
  'ocean-wellness-beachfront-yoga-breathwork-costa-rica',
  'sacred-valley-plant-medicine-integration-peru',
  'restorative-yoga-ayurveda-kerala-india'
);