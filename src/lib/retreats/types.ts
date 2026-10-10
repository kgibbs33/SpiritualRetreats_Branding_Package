/** Row shape for public.retreats (with Migration A columns — all nullable until applied). */
export type RetreatRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  categories: string[];
  location: string | null;
  country: string | null;
  region: string | null;
  dates_display: string;
  price_display: string;
  price_from: number | null;
  price_currency: string | null;
  price_notes: string | null;
  image_path: string;
  gallery_paths: string[] | null;
  rating: number | null;
  review_count: number | null;
  badge: string | null;
  description: string | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  itinerary: Record<string, unknown>[] | null;
  operator_name: string | null;
  operator_website: string | null;
  min_age: number | null;
  max_age: number | null;
  age_notes: string | null;
  booking_url: string | null;
  status: string;
  sort_order: number;
  trust_tier: string | null;
  verified_at: string | null;
  credibility_note: string | null;
  commercial_status: string | null;
  qualification_status: string | null;
};

export type DepartureRow = {
  id: string;
  retreat_id: string;
  start_date: string;
  end_date: string;
  capacity: number | null;
  spots_left: number | null;
  price_override: number | null;
  status: string;
  notes: string | null;
};

/** Search result with facets. */
export type RetreatSearchResult = {
  retreats: RetreatRow[];
  departuresMap: Record<string, DepartureRow[]>;
  total: number;
  page: number;
  perPage: number;
  facets: {
    countries: { value: string; count: number }[];
    categories: { value: string; count: number }[];
    months: { value: string; count: number }[];
    priceMin: number | null;
    priceMax: number | null;
  };
};