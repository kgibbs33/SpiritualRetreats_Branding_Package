import type { SupabaseClient } from "@supabase/supabase-js";

import { slugifyTitle } from "@/lib/strings/slug";

/**
 * The curated, public-safe subset of a facilitator onboarding row used to build
 * a published directory profile. Deliberately omits email / phone / cv_path /
 * referrals / referral_consent so those never reach the public `facilitators`
 * table.
 */
export type FacilitatorOnboardingRow = {
  id: string;
  full_name: string;
  city: string | null;
  region: string | null;
  country: string | null;
  practice_areas: string[] | null;
  website_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  photo_path: string | null;
  credentials: string | null;
  status: string;
};

export function buildFacilitatorSlug(row: FacilitatorOnboardingRow): string {
  const segment = row.id.replace(/-/g, "").slice(0, 10);
  const base = slugifyTitle(row.full_name, "facilitator");
  return `${base}-${segment}`.toLowerCase();
}

/**
 * Upserts a published `facilitators` row from a reviewed onboarding profile.
 * Caller MUST use the admin client and verify operator/admin auth first.
 * Only public-safe fields are copied; `headline`/`bio` are operator-curated
 * (bio falls back to a trimmed credentials snippet).
 */
export async function upsertPublishedFacilitatorFromOnboarding(
  admin: SupabaseClient,
  row: FacilitatorOnboardingRow,
  opts: { headline?: string | null; bio?: string | null } = {}
): Promise<{ slug: string }> {
  const slug = buildFacilitatorSlug(row);
  const bio =
    opts.bio?.trim() ||
    (row.credentials ? row.credentials.trim().slice(0, 2000) : null);

  const { error } = await admin
    .from("facilitators")
    .upsert(
      {
        source_onboarding_id: row.id,
        slug,
        display_name: row.full_name.trim(),
        headline: opts.headline?.trim() || null,
        bio,
        city: row.city,
        region: row.region,
        country: row.country,
        practice_areas: row.practice_areas ?? [],
        website_url: row.website_url,
        linkedin_url: row.linkedin_url,
        instagram_url: row.instagram_url,
        photo_path: row.photo_path,
        status: "published",
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      },
      { onConflict: "source_onboarding_id" }
    );

  if (error) throw new Error(`facilitators upsert failed: ${error.message}`);
  return { slug };
}
