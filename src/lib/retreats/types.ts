/** Row shape for `public.retreats` (published directory). */
export type RetreatRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  /** Full category taxonomy (RetreatCategorySlug[]) — type is derived from this. */
  categories: string[];
  location: string | null;
  dates_display: string;
  price_display: string;
  image_path: string;
  rating: number | null;
  review_count: number | null;
  badge: string | null;
  description: string | null;
  status: string;
  sort_order: number;
  trust_tier: string | null;
  verified_at: string | null;
  credibility_note: string | null;
};
