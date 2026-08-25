import { unstable_cache } from "next/cache";

import { createPublicSupabaseClient } from "@/lib/supabase/public-server";
import type { RetreatCardProps } from "@/components/retreat/RetreatCard";
import { retreatTrustVariant } from "@/components/ui/TrustBadge";
import {
  CACHE_TAG_RETREATS_LIST,
  retreatDetailCacheTag,
} from "@/lib/retreats/cache-tags";
import {
  applyRetreatFilters,
  parseRetreatListQuery,
  RETREAT_INTENT_TO_CATEGORIES,
  type RetreatListQuery,
} from "@/lib/retreats/retreat-filters";
import type { RetreatRow } from "@/lib/retreats/types";

export type { RetreatRow } from "@/lib/retreats/types";

function withSupabaseNetworkHint(message: string): string {
  if (
    /fetch failed/i.test(message) ||
    /ENOTFOUND|getaddrinfo|Could not resolve host/i.test(message)
  ) {
    return `${message} Check NEXT_PUBLIC_SUPABASE_URL: the hostname must resolve (Supabase → Settings → API → Project URL). If you use \`.env.local\`, it overrides \`.env.public\` — remove stale Singapore (\`tzmnvbuhnugaiefpdfhp\`) values and use the Frankfurt project or omit the lines to inherit committed defaults. URL and publishable key must be from the same project.`;
  }
  return message;
}

function mapRowToCardProps(row: RetreatRow): RetreatCardProps {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    location: row.location ?? "",
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

const RETREAT_SELECT =
  "id, slug, title, type, categories, location, dates_display, price_display, image_path, rating, review_count, badge, description, status, sort_order, trust_tier, verified_at, credibility_note";

async function listPublishedRetreatsUncached(
  listQuery?: RetreatListQuery
): Promise<{
  cards: RetreatCardProps[];
  error: string | null;
}> {
  const q = listQuery ?? parseRetreatListQuery({});

  const supabase = createPublicSupabaseClient();
  let builder = supabase
    .from("retreats")
    .select(RETREAT_SELECT)
    .eq("status", "published");

  if (q.type) {
    builder = builder.eq("type", q.type);
  } else if (q.intent) {
    // Need/intent is derived from the category taxonomy (SCOPE-055): narrow at
    // the DB to retreats whose full category array overlaps the categories
    // that serve the chosen intent (SCOPE-109 — `type` alone missed retreats
    // tagged with a matching category that wasn't their single legacy type).
    // `type` (a single explicit category) wins when both are set;
    // applyRetreatFilters re-checks with a `type`-only fallback for rows an
    // older client cached before `categories` existed.
    const cats = RETREAT_INTENT_TO_CATEGORIES[q.intent] ?? [];
    builder = builder.overlaps("categories", cats.length ? cats : ["__none__"]);
  }
  if (q.region === "latin_america") {
    builder = builder.or(LATIN_LOCATION_OR);
  } else if (q.region === "asia") {
    builder = builder.or(ASIA_LOCATION_OR);
  } else if (q.region === "europe") {
    builder = builder.or(EUROPE_LOCATION_OR);
  }

  const { data, error } = await builder.order("sort_order", {
    ascending: true,
  });

  if (error) {
    console.error("retreats list:", error.message);
    return { cards: [], error: withSupabaseNetworkHint(error.message) };
  }

  const rows = (data ?? []) as RetreatRow[];
  const filtered = applyRetreatFilters(rows, q);
  return { cards: filtered.map(mapRowToCardProps), error: null };
}

export async function listPublishedRetreats(
  listQuery?: RetreatListQuery
): Promise<{
  cards: RetreatCardProps[];
  error: string | null;
}> {
  const q = listQuery ?? parseRetreatListQuery({});
  try {
    return await unstable_cache(
      async () => {
        const result = await listPublishedRetreatsUncached(q);
        if (result.error) {
          throw new Error(result.error);
        }
        return result;
      },
      ["list-published-retreats", "v2", JSON.stringify(q)],
      { tags: [CACHE_TAG_RETREATS_LIST], revalidate: 60 }
    )();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { cards: [], error: message };
  }
}

/** PostgREST `or` filter: location ILIKE any region keyword. */
const LATIN_LOCATION_OR = [
  "location.ilike.%Mexico%",
  "location.ilike.%Peru%",
  "location.ilike.%Costa Rica%",
  "location.ilike.%Navidad%",
  "location.ilike.%Písac%",
  "location.ilike.%Sacred Valley%",
].join(",");

const ASIA_LOCATION_OR = [
  "location.ilike.%Bali%",
  "location.ilike.%India%",
  "location.ilike.%Kerala%",
].join(",");

const EUROPE_LOCATION_OR = [
  "location.ilike.%Germany%",
  "location.ilike.%Spain%",
  "location.ilike.%Portugal%",
  "location.ilike.%UK%",
  "location.ilike.%London%",
  "location.ilike.%Algarve%",
  "location.ilike.%Granada%",
  "location.ilike.%Black Forest%",
].join(",");

async function getRetreatBySlugUncached(
  trimmed: string
): Promise<{ row: RetreatRow | null; error: string | null }> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("retreats")
    .select(RETREAT_SELECT)
    .eq("slug", trimmed)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("retreat by slug:", error.message);
    return { row: null, error: withSupabaseNetworkHint(error.message) };
  }

  return { row: (data as RetreatRow | null) ?? null, error: null };
}

export async function getRetreatBySlug(
  slug: string
): Promise<{ row: RetreatRow | null; error: string | null }> {
  const trimmed = slug.trim();
  if (!trimmed) {
    return { row: null, error: null };
  }

  try {
    return await unstable_cache(
      async () => {
        const result = await getRetreatBySlugUncached(trimmed);
        if (result.error) {
          throw new Error(result.error);
        }
        return result;
      },
      ["retreat-by-slug", "v2", trimmed],
      {
        tags: [CACHE_TAG_RETREATS_LIST, retreatDetailCacheTag(trimmed)],
        revalidate: 60,
      }
    )();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { row: null, error: message };
  }
}
