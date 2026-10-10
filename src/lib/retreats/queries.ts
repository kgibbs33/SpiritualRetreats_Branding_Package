import { unstable_cache } from "next/cache";
import { createPublicSupabaseClient } from "@/lib/supabase/public-server";
import type { RetreatCardProps } from "@/components/retreat/RetreatCard";
import { retreatTrustVariant } from "@/components/ui/TrustBadge";
import { CACHE_TAG_RETREATS_LIST, retreatDetailCacheTag } from "@/lib/retreats/cache-tags";
import {
  parseRetreatListParams, budgetRange, PER_PAGE,
  type RetreatListParams,
} from "@/lib/retreats/retreat-filters";
import type { RetreatRow, DepartureRow } from "@/lib/retreats/types";

export type { RetreatRow } from "@/lib/retreats/types";

// ── Card mapping ──────────────────────────────────────────────────────────

function mapRowToCardProps(row: RetreatRow): RetreatCardProps {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    location: row.country ?? row.location ?? "",
    dates: row.dates_display,
    price: row.price_display,
    image: row.image_path,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count ?? undefined,
    badge: row.badge ?? undefined,
    trustVariant: retreatTrustVariant(row.trust_tier),
    href: `/retreat/${row.slug}`,
  };
}

// ── Detect if Migration A has been applied ────────────────────────────────
// We probe by trying to select the `country` column. If it fails with a
// "column not found" error, we fall back to the old query path.

let _migrationAApplied: boolean | null = null;

async function isMigrationAApplied(): Promise<boolean> {
  if (_migrationAApplied !== null) return _migrationAApplied;
  try {
    const supabase = createPublicSupabaseClient();
    const { error } = await supabase
      .from("retreats")
      .select("country")
      .limit(0);
    _migrationAApplied = error === null || !/column.*does not exist/i.test(error?.message ?? "");
    return _migrationAApplied;
  } catch {
    _migrationAApplied = false;
    return false;
  }
}

// ── Full select (new columns included; safe — all nullable/defaulted) ────

const FULL_SELECT = [
  "id", "slug", "title", "type", "categories", "location", "country", "region",
  "dates_display", "price_display", "price_from", "price_currency", "price_notes",
  "image_path", "gallery_paths",
  "rating", "review_count", "badge", "description",
  "inclusions", "exclusions", "itinerary",
  "operator_name", "operator_website",
  "min_age", "max_age", "age_notes",
  "booking_url", "commercial_status", "qualification_status",
  "status", "trust_tier", "verified_at", "credibility_note",
  "sort_order",
].join(",");

// ── Published retreat list (server-side SQL filtering) ────────────────────

async function searchPublishedRetreats(
  params: RetreatListParams,
  page: number,
): Promise<{ cards: RetreatCardProps[]; total: number; error: string | null }> {
  const supabase = createPublicSupabaseClient();

  // Build query — base: published + live
  let query = supabase
    .from("retreats")
    .select("*", { count: "exact", head: false })
    .eq("status", "published")
    .eq("qualification_status", "live");

  // Free-text search
  if (params.q) {
    query = query.textSearch("search_tsv", params.q, {
      type: "websearch",
      config: "english",
    });
  }

  // Country / region
  if (params.destination) {
    const d = params.destination.toLowerCase();
    query = query.or(`country.ilike.${d},region.eq.${d}`);
  }

  // Type
  if (params.type && params.type !== "All types") {
    query = query.eq("type", params.type.toLowerCase());
  }

  // Budget — price_from OR departure price_override
  const budget = params.budget ? budgetRange(params.budget) : null;
  if (budget) {
    query = query.gte("price_from", budget.min).lt("price_from", budget.max + 1);
  }

  // Duration — TODO: requires JOIN on departures. Skipped in MVP.
  // Month — TODO: requires JOIN on departures. Skipped in MVP.

  // Sort
  switch (params.sort ?? "soonest") {
    case "price_asc":  query = query.order("price_from", { ascending: true, nullsFirst: false }); break;
    case "price_desc": query = query.order("price_from", { ascending: false, nullsFirst: true }); break;
    default:           query = query.order("sort_order", { ascending: true });
  }

  // Pagination
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    console.error("retreats search:", error.message);
    return { cards: [], total: 0, error: error.message };
  }

  const rows = (data ?? []) as RetreatRow[];
  return { cards: rows.map(mapRowToCardProps), total: count ?? rows.length, error: null };
}

// ── Legacy fallback (before Migration A) ──────────────────────────────────

const LEGACY_SELECT = "id, slug, title, type, categories, location, dates_display, price_display, image_path, rating, review_count, badge, description, status, sort_order, trust_tier, verified_at, credibility_note";

async function listPublishedRetreatsLegacy(): Promise<{ cards: RetreatCardProps[]; error: string | null }> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("retreats")
    .select(LEGACY_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) return { cards: [], error: error.message };
  const rows = (data ?? []) as RetreatRow[];
  return { cards: rows.map(mapRowToCardProps), error: null };
}

// ── Public API ────────────────────────────────────────────────────────────

export async function listPublishedRetreats(
  searchParams?: Record<string, string | string[] | undefined>
): Promise<{ cards: RetreatCardProps[]; total: number; page: number; error: string | null }> {
  const params = parseRetreatListParams(searchParams ?? {});
  const page = Math.max(1, params.page ?? 1);

  let useNew = false;
  try {
    useNew = await isMigrationAApplied();
  } catch {
    // Missing env vars or network error — fall back to legacy
  }
  if (!useNew) {
    try {
      const { cards, error } = await listPublishedRetreatsLegacy();
      return { cards, total: cards.length, page: 1, error };
    } catch (e) {
      return { cards: [], total: 0, page: 1, error: String(e) };
    }
  }

  try {
    const result = await unstable_cache(
      async () => searchPublishedRetreats(params, page),
      ["retreats-search", "v1", JSON.stringify(params), String(page)],
      { tags: [CACHE_TAG_RETREATS_LIST], revalidate: 60 }
    )();
    return { ...result, page };
  } catch (e) {
    return { cards: [], total: 0, page: 1, error: String(e) };
  }
}

// ── Retreat by slug ───────────────────────────────────────────────────────

async function getRetreatBySlugUncached(
  slug: string
): Promise<{ row: RetreatRow | null; departures: DepartureRow[]; error: string | null }> {
  const supabase = createPublicSupabaseClient();

  const { data: rawRow, error: slugError } = await supabase
    .from("retreats")
    .select(FULL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  const row = rawRow as unknown as RetreatRow | null;
  if (slugError || !row) {
    return { row: null, departures: [], error: slugError?.message ?? "Not found" };
  }

  // Fetch departures (graceful if table doesn't exist)
  let departures: DepartureRow[] = [];
  try {
    const { data: deps } = await supabase
      .from("retreat_departures")
      .select("id, start_date, end_date, capacity, spots_left, price_override, status")
      .eq("retreat_id", row.id)
      .in("status", ["open", "full"])
      .order("start_date", { ascending: true });
    departures = (deps ?? []) as DepartureRow[];
  } catch {
    // Table doesn't exist yet — fine
  }

  return { row, departures, error: null };
}

export async function getRetreatBySlug(
  slug: string
): Promise<{ row: RetreatRow | null; departures: DepartureRow[]; error: string | null }> {
  const trimmed = slug.trim();
  if (!trimmed) return { row: null, departures: [], error: null };

  try {
    return await unstable_cache(
      async () => getRetreatBySlugUncached(trimmed),
      ["retreat-by-slug", "v3", trimmed],
      { tags: [CACHE_TAG_RETREATS_LIST, retreatDetailCacheTag(trimmed)], revalidate: 60 }
    )();
  } catch (e) {
    return { row: null, departures: [], error: String(e) };
  }
}