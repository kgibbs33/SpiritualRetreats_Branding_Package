import "server-only";

import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { RetreatCardProps } from "@/components/retreat/RetreatCard";
import { retreatTrustVariant } from "@/components/ui/TrustBadge";
import { CACHE_TAG_RETREATS_LIST, retreatDetailCacheTag } from "@/lib/retreats/cache-tags";
import {
  parseRetreatListParams, budgetRange, PER_PAGE,
  type RetreatListParams,
} from "@/lib/retreats/retreat-filters";
import type { RetreatRow, DepartureRow } from "@/lib/retreats/types";

export type { RetreatRow } from "@/lib/retreats/types";

// ── Column lists (server-only — never expose internal/sensitive cols to client) ──

/** Public-safe column list: excludes internal_notes, qualification_checks,
 *  commercial_status, operator_name, operator_website. */
const PUBLIC_SELECT = [
  "id", "slug", "title", "type", "categories", "location", "country", "region",
  "dates_display", "price_display", "price_from", "price_currency", "price_notes",
  "image_path", "gallery_paths",
  "rating", "review_count", "badge", "description",
  "inclusions", "exclusions", "itinerary",
  "min_age", "max_age", "age_notes",
  "booking_url", "qualification_status",
  "status", "trust_tier", "verified_at", "credibility_note",
  "sort_order",
].join(",");

/** Full column list for admin-only reads (includes operator + sensitive). */
const ADMIN_SELECT = [
  "id", "slug", "title", "type", "categories", "location", "country", "region",
  "dates_display", "price_display", "price_from", "price_currency", "price_notes",
  "image_path", "gallery_paths",
  "rating", "review_count", "badge", "description",
  "inclusions", "exclusions", "itinerary",
  "operator_name", "operator_website",
  "min_age", "max_age", "age_notes",
  "booking_url", "commercial_status", "qualification_status", "qualification_checks",
  "status", "trust_tier", "verified_at", "credibility_note",
  "sort_order",
].join(",");

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
    trustVariant: retreatTrustVariant(),
    href: `/retreat/${row.slug}`,
  };
}

// ── Detect if Migration A has been applied (use admin client) ─────────────

let _migrationAApplied: boolean | null = null;

async function isMigrationAApplied(): Promise<boolean> {
  if (_migrationAApplied !== null) return _migrationAApplied;
  try {
    const supabase = createAdminClient();
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

// ── Published retreat list (server-side SQL filtering, service-role) ──────

async function searchPublishedRetreats(
  params: RetreatListParams,
  page: number,
): Promise<{ cards: RetreatCardProps[]; total: number; error: string | null }> {
  const supabase = createAdminClient();

  let query = supabase
    .from("retreats")
    .select(PUBLIC_SELECT, { count: "exact", head: false })
    .eq("status", "published")
    .eq("qualification_status", "live");

  if (params.q) {
    query = query.textSearch("search_tsv", params.q, {
      type: "websearch",
      config: "english",
    });
  }

  if (params.destination) {
    const d = params.destination.toLowerCase();
    query = query.or(`country.ilike.${d},region.eq.${d}`);
  }

  if (params.type && params.type !== "All types") {
    query = query.eq("type", params.type.toLowerCase());
  }

  // Intent ("What are you looking for?") — stored in the categories text[] column
  if (params.intent) {
    query = query.contains("categories", [params.intent]);
  }

  const budget = params.budget ? budgetRange(params.budget) : null;
  if (budget) {
    query = query.gte("price_from", budget.min).lt("price_from", budget.max + 1);
  }

  switch (params.sort ?? "soonest") {
    case "price_asc":  query = query.order("price_from", { ascending: true, nullsFirst: false }); break;
    case "price_desc": query = query.order("price_from", { ascending: false, nullsFirst: true }); break;
    default:           query = query.order("sort_order", { ascending: true });
  }

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) {
    console.error("retreats search:", error.message);
    return { cards: [], total: 0, error: error.message };
  }

  const rows = (data ?? []) as unknown as RetreatRow[];
  return { cards: rows.map(mapRowToCardProps), total: count ?? rows.length, error: null };
}

// ── Legacy fallback (before Migration A) ──────────────────────────────────

const LEGACY_SELECT = "id, slug, title, type, categories, location, dates_display, price_display, image_path, rating, review_count, badge, description, status, sort_order, trust_tier, verified_at, credibility_note";

async function listPublishedRetreatsLegacy(): Promise<{ cards: RetreatCardProps[]; error: string | null }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("retreats")
    .select(LEGACY_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) return { cards: [], error: error.message };
  const rows = (data ?? []) as unknown as RetreatRow[];
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
  } catch { /* fall back */ }
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
      ["retreats-search", "v2", JSON.stringify(params), String(page)],
      { tags: [CACHE_TAG_RETREATS_LIST], revalidate: 60 }
    )();
    return { ...result, page };
  } catch (e) {
    return { cards: [], total: 0, page: 1, error: String(e) };
  }
}

// ── Retreat by slug (public, service-role) ────────────────────────────────

async function getRetreatBySlugUncached(
  slug: string
): Promise<{ row: RetreatRow | null; departures: DepartureRow[]; error: string | null }> {
  const supabase = createAdminClient();

  const { data: rawRow, error: slugError } = await supabase
    .from("retreats")
    .select(PUBLIC_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("qualification_status", "live")
    .maybeSingle();

  const row = rawRow as unknown as RetreatRow | null;
  if (slugError || !row) {
    return { row: null, departures: [], error: slugError?.message ?? "Not found" };
  }

  let departures: DepartureRow[] = [];
  try {
    const { data: deps } = await supabase
      .from("retreat_departures")
      .select("id, start_date, end_date, capacity, spots_left, price_override, status")
      .eq("retreat_id", row.id)
      .in("status", ["open", "full"])
      .order("start_date", { ascending: true });
    departures = (deps ?? []) as DepartureRow[];
  } catch { /* before Migration A */ }

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
      ["retreat-by-slug", "v4", trimmed],
      { tags: [CACHE_TAG_RETREATS_LIST, retreatDetailCacheTag(trimmed)], revalidate: 60 }
    )();
  } catch (e) {
    return { row: null, departures: [], error: String(e) };
  }
}

// ── Admin: get retreat by slug (no status filter, all columns) ────────────

export async function getRetreatBySlugAdmin(slug: string): Promise<{ row: RetreatRow | null; departures: DepartureRow[]; error: string | null }> {
  const supabase = createAdminClient();

  const { data: rawRow, error } = await supabase
    .from("retreats")
    .select(ADMIN_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  const row = rawRow as unknown as RetreatRow | null;
  if (error || !row) return { row: null, departures: [], error: error?.message ?? "Not found" };

  let departures: DepartureRow[] = [];
  try {
    const { data: deps } = await supabase
      .from("retreat_departures")
      .select("id, start_date, end_date, capacity, spots_left, price_override, status")
      .eq("retreat_id", row.id)
      .order("start_date", { ascending: true });
    departures = (deps ?? []) as DepartureRow[];
  } catch {}

  return { row, departures, error: null };
}