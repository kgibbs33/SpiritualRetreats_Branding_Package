-- =============================================================================
-- SEED: Re:Treat Yourself — mock data for admin panel & full site exercise
-- Run this in the Supabase SQL editor for project tzmnvbuhnugaiefpdfhp
-- Safe to re-run: all inserts use ON CONFLICT DO NOTHING where possible.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. newsletter_subscriptions
-- -----------------------------------------------------------------------------
INSERT INTO public.newsletter_subscriptions (email, created_at) VALUES
  ('maya.thornton@gmail.com',        now() - interval '14 days'),
  ('liam.adeyemi@icloud.com',        now() - interval '12 days'),
  ('sofia.reyes@protonmail.com',     now() - interval '10 days'),
  ('noah.bergström@outlook.com',     now() - interval '9 days'),
  ('aiko.tanaka@gmail.com',          now() - interval '8 days'),
  ('priya.menon@gmail.com',          now() - interval '7 days'),
  ('christoph.huber@icloud.com',     now() - interval '6 days'),
  ('amara.osei@gmail.com',           now() - interval '5 days'),
  ('lucas.ferreira@gmail.com',       now() - interval '4 days'),
  ('eva.lindqvist@hotmail.com',      now() - interval '3 days')
ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. contact_inquiries
-- -----------------------------------------------------------------------------
INSERT INTO public.contact_inquiries (name, email, subject, message, created_at) VALUES
  (
    'James Whitfield',
    'james.whitfield@gmail.com',
    'Partnership enquiry — yoga studio',
    'Hi, I run a small yoga studio in Lisbon and I am interested in listing our upcoming 5-day retreat. Could you tell me more about the onboarding process and any fees involved?',
    now() - interval '11 days'
  ),
  (
    'Natalie Cruz',
    'natalie.cruz@outlook.com',
    'Question about the matching process',
    'Hello! I filled in the discovery form last week and was wondering how long the matching process typically takes. Very excited about this platform.',
    now() - interval '8 days'
  ),
  (
    'Tomás Almeida',
    'tomas.almeida@gmail.com',
    'Press & media',
    'I write for a Portuguese wellness publication and would love to feature Re:Treat Yourself in an upcoming piece on conscious travel. Who should I contact?',
    now() - interval '6 days'
  ),
  (
    'Sarah O''Brien',
    'sarah.obrien@icloud.com',
    'Accessibility question',
    'Do any of the retreats you list cater for people with limited mobility? I have been searching for something gentle and restorative.',
    now() - interval '4 days'
  ),
  (
    'Marc Dupont',
    'marc.dupont@protonmail.com',
    'Technical issue — form submission',
    'I tried to submit the retreat discovery form but got an error at step 3. Could you look into this? Happy to share a screenshot.',
    now() - interval '2 days'
  );

-- -----------------------------------------------------------------------------
-- 3. seeker_discovery_responses  (5 seekers across different intentions)
-- -----------------------------------------------------------------------------
INSERT INTO public.seeker_discovery_responses (
  full_name, email, phone_whatsapp,
  travel_dates, travel_dates_flexible,
  destination_region, budget_range,
  purpose, answers,
  reflection_intention, reflection_great_retreat, reflection_special_requests,
  idempotency_key, created_at
) VALUES
  (
    'Maya Thornton',
    'maya.thornton@gmail.com',
    '+44 7700 900001',
    'September 2026',
    true,
    'Europe',
    '€1,500 – €2,500',
    'burnout',
    '{"retreat_style": "silent", "depth": "deep", "group_size": "small", "accommodation": "private"}',
    'I have been running on empty for two years. I need to stop, breathe, and reconnect with what actually matters to me.',
    'A retreat where the schedule is spacious enough to just be — not every moment filled with activities.',
    'I am vegetarian and would love access to a nature walk or forest area.',
    'maya-thornton-001',
    now() - interval '9 days'
  ),
  (
    'Priya Menon',
    'priya.menon@gmail.com',
    '+91 98765 43210',
    'October 2026',
    false,
    'Asia',
    '€1,000 – €2,000',
    'spiritual_growth',
    '{"retreat_style": "active", "depth": "moderate", "group_size": "medium", "accommodation": "shared"}',
    'I have been practicing yoga for three years and want to go deeper — ideally with an experienced teacher in an authentic setting.',
    'A structured daily practice with some free time for journaling and personal reflection.',
    'I am interested in Ayurveda and would love any integration of that into the programme.',
    'priya-menon-001',
    now() - interval '7 days'
  ),
  (
    'Liam Adeyemi',
    'liam.adeyemi@icloud.com',
    '+353 87 900 1234',
    'November 2026',
    true,
    'Latin America',
    '€2,500 – €4,000',
    'grief',
    '{"retreat_style": "gentle", "depth": "deep", "group_size": "small", "accommodation": "private"}',
    'I lost my father six months ago. I want somewhere I can process this grief with support — not therapy exactly, but a held space.',
    'Trauma-informed facilitation, good food, and ideally somewhere beautiful and remote.',
    null,
    'liam-adeyemi-001',
    now() - interval '6 days'
  ),
  (
    'Sofia Reyes',
    'sofia.reyes@protonmail.com',
    '+34 612 345 678',
    'August 2026',
    true,
    'Europe',
    '€800 – €1,500',
    'rest',
    '{"retreat_style": "relaxed", "depth": "light", "group_size": "medium", "accommodation": "shared"}',
    'I just want to properly rest and be in nature. No digital devices, no pressure. A genuine switch-off.',
    'Yoga, good food, a pool or the sea nearby. That is honestly all I need.',
    'Gluten-free diet please.',
    'sofia-reyes-001',
    now() - interval '5 days'
  ),
  (
    'Noah Bergström',
    'noah.bergstrom@outlook.com',
    '+46 70 123 4567',
    'January 2027',
    false,
    'Africa or Middle East',
    '€3,000 – €6,000',
    'leadership_reset',
    '{"retreat_style": "transformational", "depth": "deep", "group_size": "small", "accommodation": "private"}',
    'I am a founder going through a major inflection point in my company. I want to work on vision, values, and what kind of leader I want to be.',
    'A retreat that blends personal transformation with strategic thinking. I am open to plant medicine if it is done professionally.',
    'Ideally in the desert or by the ocean — somewhere visually powerful.',
    'noah-bergstrom-001',
    now() - interval '3 days'
  );

-- -----------------------------------------------------------------------------
-- 4. retreat_submissions  (3 pending, 1 approved, 1 rejected)
-- -----------------------------------------------------------------------------
INSERT INTO public.retreat_submissions (
  contact_name, email, retreat_title, location,
  start_date, end_date, description, capacity, price_range,
  facilitator_notes, status, created_at
) VALUES
  (
    'Helena Voss',
    'helena.voss@waldretreat.de',
    'Forest Bathing & Mindfulness — Black Forest, Germany',
    'Titisee-Neustadt, Black Forest, Germany',
    '2026-09-12',
    '2026-09-19',
    'A 7-day immersion in the ancient Black Forest combining Shinrin-yoku (forest bathing), morning meditation, breathwork, and integration circles. Small group of 8 participants. Hosted at a renovated farmhouse with organic meals.',
    8,
    '€1,650 / 7 days',
    'I have been leading forest retreats for 6 years. I work with a trauma-informed approach and partner with a licensed psychotherapist for deeper containers.',
    'pending',
    now() - interval '5 days'
  ),
  (
    'Ricardo Fonseca',
    'ricardo@somaamsterdam.nl',
    'Somatic Healing Intensive — Algarve, Portugal',
    'Sagres, Algarve, Portugal',
    '2026-10-03',
    '2026-10-10',
    'A week-long somatic healing retreat on Portugal''s wild southwest coast. We work with body-based trauma release (TRE), conscious movement, and ocean therapy. Daily yoga and cold ocean plunges. Vegan food, private rooms.',
    12,
    '€2,200 / 7 days',
    'I am a certified somatic therapist (UKCP) and have been running similar retreats in the Netherlands for 4 years. This will be our first Portugal edition.',
    'pending',
    now() - interval '4 days'
  ),
  (
    'Amara Diallo',
    'amara@sunriseyoga.co.ke',
    'Sunrise Yoga & Safari Spirit — Laikipia, Kenya',
    'Laikipia Plateau, Kenya',
    '2026-11-14',
    '2026-11-21',
    'Combine authentic Kenyan safari experience with a daily yoga practice set against the African savanna. Morning asana and pranayama, afternoon wildlife drives, evening fire circles and storytelling. Traditional Maasai cultural exchange.',
    10,
    '€3,800 / 7 days',
    'I founded Sunrise Yoga Kenya in 2020. We have 4.9-star reviews across 3 previous international group retreats. Our camp is solar-powered and fully off-grid.',
    'pending',
    now() - interval '2 days'
  ),
  (
    'Elena Marchetti',
    'elena@silencioretiro.es',
    'Silent Vipassana — Sierra Nevada, Spain',
    'Sierra Nevada, Granada, Spain',
    '2026-09-01',
    '2026-09-10',
    'A 10-day Vipassana-style silent meditation retreat in the mountains above Granada. Noble silence from day 1. Experienced teacher with 20 years practice. Vegetarian meals included.',
    16,
    '€900 / 10 days',
    'We have been running silent retreats in Spain since 2018. This is our 14th edition.',
    'approved',
    now() - interval '10 days'
  ),
  (
    'Brad Thompson',
    'brad@fastgains.io',
    'High-Performance Biohacking Weekend',
    'London, UK',
    '2026-08-29',
    '2026-08-31',
    'Optimise your performance with cold plunge protocols, red light therapy, peptide stacks, and nootropic sessions. Includes access to our private London facility.',
    30,
    '€595 / 2 days',
    'I run a biohacking community of 15,000 members.',
    'rejected',
    now() - interval '8 days'
  );

-- -----------------------------------------------------------------------------
-- 5. retreats  (extra listings beyond the 6 seeded in migrations)
-- Note: the 6 original rows already exist from the prior migration.
-- We add 4 more covering nature + new types, and use images from the project.
-- -----------------------------------------------------------------------------
INSERT INTO public.retreats (
  slug, title, type, location,
  dates_display, price_display,
  image_path, rating, review_count, badge, description,
  status, sort_order,
  trust_tier, verified_at, credibility_note
) VALUES
  (
    'black-forest-mindfulness-germany',
    'Forest Bathing & Mindfulness Retreat',
    'nature',
    'Black Forest, Germany',
    'September 12 – 19, 2026',
    '€1,650 / 7 days',
    '/images/nature-retreat-type.png',
    4.8,
    9,
    'New',
    'A 7-day immersion in the ancient Black Forest combining Shinrin-yoku (forest bathing), morning meditation, and breathwork. Small group of 8, organic farmhouse meals.',
    'published',
    7,
    'partner',
    now() - interval '10 days',
    'Verified retreat host, trauma-informed facilitation'
  ),
  (
    'somatic-healing-algarve-portugal',
    'Somatic Healing Intensive — Algarve',
    'wellness',
    'Sagres, Portugal',
    'October 3 – 10, 2026',
    '€2,200 / 7 days',
    '/images/beach-wellness.jpg',
    null,
    null,
    'Spotlight',
    'Somatic trauma release, conscious movement, and ocean therapy on Portugal''s wild southwest coast. Vegan, private rooms.',
    'published',
    8,
    'listed',
    now() - interval '4 days',
    null
  ),
  (
    'sunrise-yoga-safari-kenya',
    'Sunrise Yoga & Safari Spirit',
    'yoga',
    'Laikipia Plateau, Kenya',
    'November 14 – 21, 2026',
    '€3,800 / 7 days',
    '/images/yoga-retreat.jpg',
    4.9,
    3,
    'Featured',
    'Authentic Kenyan safari meets daily yoga asana and pranayama. Morning practice, afternoon wildlife drives, evening fire circles. Off-grid solar camp.',
    'published',
    9,
    'partner',
    now() - interval '2 days',
    'Host verified, 4.9★ across 3 international retreats'
  ),
  (
    'silent-vipassana-sierra-nevada',
    'Silent Vipassana — Sierra Nevada',
    'meditation',
    'Granada, Spain',
    'September 1 – 10, 2026',
    '€900 / 10 days',
    '/images/meditation-retreat-type.png',
    5.0,
    14,
    null,
    '10-day Vipassana-style silent retreat in the mountains above Granada. Noble silence, experienced teacher with 20 years practice. Vegetarian meals.',
    'published',
    10,
    'verified_partner',
    now() - interval '10 days',
    '14th edition — established since 2018'
  )
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. facilitator_onboarding_responses  (4 facilitators)
-- -----------------------------------------------------------------------------
INSERT INTO public.facilitator_onboarding_responses (
  full_name, email, phone,
  practice_focus, credentials, message,
  created_at
) VALUES
  (
    'Helena Voss',
    'helena.voss@waldretreat.de',
    '+49 761 1234567',
    'Forest therapy, mindfulness, breathwork',
    'Certified Nature & Forest Therapy Guide (ANFT), 6 years experience, trauma-informed approach, partnership with licensed psychotherapist',
    'I am looking to connect with seekers who need deep rest and nature immersion. My retreats are small and intimate — never more than 8 people.',
    now() - interval '5 days'
  ),
  (
    'Ricardo Fonseca',
    'ricardo@somaamsterdam.nl',
    '+31 6 12345678',
    'Somatic therapy, TRE, conscious movement',
    'UKCP Certified Somatic Therapist, 4 years running residential retreats in the Netherlands and Portugal',
    'I specialise in nervous-system regulation and body-based trauma release. I am particularly interested in matching with seekers recovering from burnout or complex stress.',
    now() - interval '4 days'
  ),
  (
    'Amara Diallo',
    'amara@sunriseyoga.co.ke',
    '+254 700 123456',
    'Yoga, pranayama, safari & nature immersion',
    'RYT-500 certified, Founder of Sunrise Yoga Kenya, 3 international group retreats with 4.9★ reviews, solar-powered off-grid camp',
    'My retreats blend an authentic African experience with a grounded yoga practice. I would love to be matched with adventurous seekers open to cross-cultural transformation.',
    now() - interval '2 days'
  ),
  (
    'Elena Marchetti',
    'elena@silencioretiro.es',
    '+34 958 123456',
    'Vipassana meditation, silent retreat facilitation',
    '20 years personal Vipassana practice, trained in the tradition of S.N. Goenka, 14 retreat editions since 2018',
    'I facilitate Noble Silence retreats in the mountains above Granada. Interested in seekers seeking deep inner transformation through meditation.',
    now() - interval '10 days'
  );

-- -----------------------------------------------------------------------------
-- 7. matches  (2 recorded matches linking seekers → retreats → facilitators)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  seeker_maya_id  uuid;
  seeker_priya_id uuid;
  retreat_forest_id  uuid;
  retreat_yoga_id    uuid;
BEGIN
  SELECT id INTO seeker_maya_id
    FROM public.seeker_discovery_responses WHERE email = 'maya.thornton@gmail.com' LIMIT 1;

  SELECT id INTO seeker_priya_id
    FROM public.seeker_discovery_responses WHERE email = 'priya.menon@gmail.com' LIMIT 1;

  SELECT id INTO retreat_forest_id
    FROM public.retreats WHERE slug = 'black-forest-mindfulness-germany' LIMIT 1;

  SELECT id INTO retreat_yoga_id
    FROM public.retreats WHERE slug = 'restorative-yoga-ayurveda-kerala-india' LIMIT 1;

  IF seeker_maya_id IS NOT NULL AND retreat_forest_id IS NOT NULL THEN
    INSERT INTO public.matches (
      seeker_discovery_response_id, retreat_id,
      seeker_email, seeker_name,
      facilitator_email, facilitator_name,
      status, operator_notes, created_at
    ) VALUES (
      seeker_maya_id, retreat_forest_id,
      'maya.thornton@gmail.com', 'Maya Thornton',
      'helena.voss@waldretreat.de', 'Helena Voss',
      'notified',
      'Strong intention–retreat alignment. Maya needs burnout recovery; Helena runs small, trauma-informed nature immersions. Sent intro email to both.',
      now() - interval '3 days'
    );
  END IF;

  IF seeker_priya_id IS NOT NULL AND retreat_yoga_id IS NOT NULL THEN
    INSERT INTO public.matches (
      seeker_discovery_response_id, retreat_id,
      seeker_email, seeker_name,
      facilitator_email, facilitator_name,
      status, operator_notes, created_at
    ) VALUES (
      seeker_priya_id, retreat_yoga_id,
      'priya.menon@gmail.com', 'Priya Menon',
      'elena@silencioretiro.es', 'Elena Marchetti',
      'recorded',
      'Priya is interested in deepening yoga practice with Ayurveda. Kerala retreat is ideal. Awaiting facilitator confirmation.',
      now() - interval '1 day'
    );
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 8. events  (audit trail for the above activity)
-- -----------------------------------------------------------------------------
INSERT INTO public.events (event_type, entity_type, payload, created_at) VALUES
  ('seeker_discovery_submitted', 'seeker_discovery_response', '{"email": "maya.thornton@gmail.com", "purpose": "burnout"}', now() - interval '9 days'),
  ('seeker_discovery_submitted', 'seeker_discovery_response', '{"email": "priya.menon@gmail.com", "purpose": "spiritual_growth"}', now() - interval '7 days'),
  ('seeker_discovery_submitted', 'seeker_discovery_response', '{"email": "liam.adeyemi@icloud.com", "purpose": "grief"}', now() - interval '6 days'),
  ('seeker_discovery_submitted', 'seeker_discovery_response', '{"email": "sofia.reyes@protonmail.com", "purpose": "rest"}', now() - interval '5 days'),
  ('seeker_discovery_submitted', 'seeker_discovery_response', '{"email": "noah.bergstrom@outlook.com", "purpose": "leadership_reset"}', now() - interval '3 days'),
  ('retreat_submission_received', 'retreat_submission', '{"retreat_title": "Forest Bathing & Mindfulness", "contact": "helena.voss@waldretreat.de"}', now() - interval '5 days'),
  ('retreat_submission_received', 'retreat_submission', '{"retreat_title": "Somatic Healing Intensive", "contact": "ricardo@somaamsterdam.nl"}', now() - interval '4 days'),
  ('retreat_submission_received', 'retreat_submission', '{"retreat_title": "Sunrise Yoga & Safari Spirit", "contact": "amara@sunriseyoga.co.ke"}', now() - interval '2 days'),
  ('retreat_published_from_submission', 'retreat_submission', '{"slug": "silent-vipassana-sierra-nevada"}', now() - interval '10 days'),
  ('manual_match_created', 'match', '{"seeker": "maya.thornton@gmail.com", "facilitator": "helena.voss@waldretreat.de", "retreat": "black-forest-mindfulness-germany"}', now() - interval '3 days'),
  ('manual_match_created', 'match', '{"seeker": "priya.menon@gmail.com", "facilitator": "elena@silencioretiro.es", "retreat": "restorative-yoga-ayurveda-kerala-india"}', now() - interval '1 day'),
  ('contact_inquiry_received', 'contact_inquiry', '{"name": "James Whitfield", "subject": "Partnership enquiry"}', now() - interval '11 days'),
  ('newsletter_signup', 'newsletter_subscription', '{"email": "maya.thornton@gmail.com"}', now() - interval '14 days');
