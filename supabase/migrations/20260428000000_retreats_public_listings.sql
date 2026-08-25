-- Public retreat directory (published listings). Former hardcoded demo data from retreat-listings page.
-- Slugs are stable URLs for /retreat/[slug].

CREATE TABLE IF NOT EXISTS public.retreats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  type text NOT NULL,
  location text,
  dates_display text NOT NULL,
  price_display text NOT NULL,
  image_path text NOT NULL,
  rating numeric(2, 1),
  review_count integer,
  badge text,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retreats_status ON public.retreats (status);
CREATE INDEX IF NOT EXISTS idx_retreats_sort ON public.retreats (sort_order);

COMMENT ON TABLE public.retreats IS 'Published retreat directory rows; anon may SELECT only status=published (RLS).';

-- Seed: six demo retreats (previously hardcoded in src/app/retreat-listings/page.tsx)
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
  sort_order
)
VALUES
  (
    'mindful-journey-yoga-meditation-nature-mexico',
    'Mindful Journey: Yoga & Meditation in Nature',
    'yoga',
    'Barra de Navidad, Mexico',
    'March 14 – 21, 2026',
    'From $2,300 / 8 days',
    '/images/yoga-retreat.jpg',
    5,
    12,
    'Staff Pick',
    NULL,
    'published',
    1
  ),
  (
    'inner-calm-silent-meditation-peru',
    'Inner Calm: Silent Meditation Retreat',
    'meditation',
    'Písac, Peru',
    'April 24 – May 5, 2026',
    '$2,750 / 13 days',
    '/images/meditation-retreat-type.png',
    5,
    8,
    NULL,
    NULL,
    'published',
    2
  ),
  (
    'spa-renewal-wellness-detox-bali',
    'Spa Renewal: Wellness & Detox Immersion',
    'wellness',
    'Bali, Indonesia',
    'May 1 – 8, 2026',
    'From $1,850 / 7 days',
    '/images/spa-wellness.jpg',
    4.9,
    24,
    NULL,
    NULL,
    'published',
    3
  ),
  (
    'ocean-wellness-beachfront-yoga-breathwork-costa-rica',
    'Ocean Wellness: Beachfront Yoga & Breathwork',
    'wellness',
    'Costa Rica',
    'June 10 – 17, 2026',
    'From $1,950 / 7 days',
    '/images/beach-wellness.jpg',
    4.8,
    15,
    NULL,
    NULL,
    'published',
    4
  ),
  (
    'sacred-valley-plant-medicine-integration-peru',
    'Sacred Valley Plant Medicine & Integration',
    'meditation',
    'Sacred Valley, Peru',
    'July 15 – 25, 2026',
    '$3,200 / 10 days',
    '/images/sacred-valley.jpg',
    5,
    6,
    'New',
    NULL,
    'published',
    5
  ),
  (
    'restorative-yoga-ayurveda-kerala-india',
    'Restorative Yoga & Ayurveda Retreat',
    'yoga',
    'Kerala, India',
    'August 1 – 10, 2026',
    'From $1,650 / 9 days',
    '/images/mindfulness-retreat.jpg',
    4.9,
    18,
    NULL,
    NULL,
    'published',
    6
  )
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.retreats ENABLE ROW LEVEL SECURITY;

-- Authenticated and anonymous clients use the publishable key; only published rows are readable.
DROP POLICY IF EXISTS "retreats_select_published_anon" ON public.retreats;
CREATE POLICY "retreats_select_published_anon"
  ON public.retreats
  FOR SELECT
  TO anon
  USING (status = 'published');

DROP POLICY IF EXISTS "retreats_select_published_authenticated" ON public.retreats;
CREATE POLICY "retreats_select_published_authenticated"
  ON public.retreats
  FOR SELECT
  TO authenticated
  USING (status = 'published');

GRANT SELECT ON public.retreats TO anon;
GRANT SELECT ON public.retreats TO authenticated;
