import { unstable_cache } from "next/cache";

import {
  CACHE_TAG_FACILITATORS_LIST,
  facilitatorDetailCacheTag,
} from "@/lib/facilitators/cache-tags";
import { PRACTICE_AREAS } from "@/lib/facilitators/practice-areas";
import { createPublicSupabaseClient } from "@/lib/supabase/public-server";

/**
 * Public facilitator directory reads (SCOPE-035). Uses the anonymous client, so
 * RLS on `facilitators` enforces "published rows only". The table holds only the
 * curated, public-safe subset (no email / phone / CV / referrals), so privacy is
 * guaranteed by construction (see ADR-005). Cached + tagged for revalidation by
 * the publish flow (`CACHE_TAG_FACILITATORS_LIST`).
 */

const FACILITATOR_SELECT =
  "slug, display_name, headline, bio, city, region, country, practice_areas, open_to_work, verified, website_url, linkedin_url, instagram_url, photo_path";

export type FacilitatorDirectoryRow = {
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  practice_areas: string[] | null;
  open_to_work: boolean;
  verified: boolean;
  website_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  photo_path: string | null;
};

/** SCOPE-036: directory filters parsed from URL searchParams (shareable). */
export type FacilitatorDirectoryFilters = {
  skills: string[];
  openToWork: boolean;
};

export function parseFacilitatorFilters(
  searchParams: Record<string, string | string[] | undefined>
): FacilitatorDirectoryFilters {
  const rawSkills = searchParams.skills;
  const skillsStr = Array.isArray(rawSkills) ? rawSkills.join(",") : rawSkills ?? "";
  const allowed = new Set<string>(PRACTICE_AREAS);
  const skills = [
    ...new Set(
      skillsStr
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter((s) => allowed.has(s))
    ),
  ];
  const open = searchParams.open;
  const openToWork = open === "1" || open === "true";
  return { skills, openToWork };
}

export function hasActiveFacilitatorFilters(f: FacilitatorDirectoryFilters): boolean {
  return f.skills.length > 0 || f.openToWork;
}

async function listUncached(filters: FacilitatorDirectoryFilters): Promise<{
  rows: FacilitatorDirectoryRow[];
  error: string | null;
}> {
  const supabase = createPublicSupabaseClient();
  let query = supabase
    .from("facilitators")
    .select(FACILITATOR_SELECT)
    .eq("status", "published");

  // Skills: match facilitators with ANY of the selected practice areas
  // (array overlap, GIN-indexed). Availability: only open-to-work.
  if (filters.skills.length > 0) {
    query = query.overlaps("practice_areas", filters.skills);
  }
  if (filters.openToWork) {
    query = query.eq("open_to_work", true);
  }

  const { data, error } = await query
    .order("open_to_work", { ascending: false })
    .order("display_name", { ascending: true });

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as FacilitatorDirectoryRow[], error: null };
}

export const listPublishedFacilitators = unstable_cache(
  listUncached,
  ["facilitators-directory-list"],
  { revalidate: 60, tags: [CACHE_TAG_FACILITATORS_LIST] }
);

async function getBySlugUncached(slug: string): Promise<{
  row: FacilitatorDirectoryRow | null;
  error: string | null;
}> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("facilitators")
    .select(FACILITATOR_SELECT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) return { row: null, error: error.message };
  return { row: (data as FacilitatorDirectoryRow | null) ?? null, error: null };
}

export function getPublishedFacilitatorBySlug(slug: string) {
  return unstable_cache(() => getBySlugUncached(slug), ["facilitators-directory-detail", slug], {
    revalidate: 60,
    tags: [facilitatorDetailCacheTag(slug), CACHE_TAG_FACILITATORS_LIST],
  })();
}

/** Coarse "City, Region, Country" string from the parts present. */
export function facilitatorLocation(row: {
  city: string | null;
  region: string | null;
  country: string | null;
}): string {
  return [row.city, row.region, row.country]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(", ");
}
