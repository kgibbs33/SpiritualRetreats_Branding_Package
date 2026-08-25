-- Use the new meditation retreat category hero image (JD Mason / Unsplash).
UPDATE public.retreats
SET image_path = '/images/meditation-retreat-type.png', updated_at = now ()
WHERE slug = 'inner-calm-silent-meditation-peru';
