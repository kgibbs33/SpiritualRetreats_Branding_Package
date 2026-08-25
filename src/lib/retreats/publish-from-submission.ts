import type { SupabaseClient } from "@supabase/supabase-js";

import { slugifyTitle } from "@/lib/strings/slug";

export type RetreatSubmissionRow = {
  id: string;
  retreat_title: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  price_range: string | null;
  status: string;
  category: string[] | null;
};

/**
 * The public directory's explicit type filter still understands only this
 * legacy four-value set. Derive it from the owner's full category selection
 * (first match wins) instead of hardcoding a constant — SCOPE-109.
 */
const LEGACY_TYPE_VALUES = new Set(["yoga", "meditation", "wellness", "nature"]);
const LEGACY_TYPE_FALLBACK = "wellness";

export function deriveLegacyType(categories: string[] | null | undefined): string {
  return categories?.find((c) => LEGACY_TYPE_VALUES.has(c)) ?? LEGACY_TYPE_FALLBACK;
}

export function datesDisplayFromSubmission(row: RetreatSubmissionRow): string {
  const { start_date: s, end_date: e } = row;
  if (s && e) return `${s} – ${e}`;
  if (s) return s;
  if (e) return e;
  return "Dates TBD";
}

export function buildSlugFromSubmission(row: RetreatSubmissionRow): string {
  const segment = row.id.replace(/-/g, "").slice(0, 10);
  const base = slugifyTitle(row.retreat_title, "retreat");
  return `${base}-${segment}`.toLowerCase();
}

const DEFAULT_IMAGE = "/images/yoga-retreat.jpg";

/**
 * Upserts a published `retreats` row from an approved intake submission.
 * Caller must use admin client and verify operator auth first.
 */
export async function upsertPublishedRetreatFromSubmission(
  admin: SupabaseClient,
  submission: RetreatSubmissionRow
): Promise<{ slug: string }> {
  const slug = buildSlugFromSubmission(submission);
  const payload = {
    slug,
    title: submission.retreat_title.trim(),
    type: deriveLegacyType(submission.category),
    categories: submission.category ?? [],
    location: submission.location?.trim() ?? null,
    dates_display: datesDisplayFromSubmission(submission),
    price_display: submission.price_range?.trim() || "Inquire",
    image_path: DEFAULT_IMAGE,
    rating: null,
    review_count: null,
    badge: "New listing",
    description: submission.description?.trim() ?? null,
    status: "published" as const,
    sort_order: 100,
    trust_tier: "listed",
    verified_at: new Date().toISOString(),
    credibility_note: null,
    source_submission_id: submission.id,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await admin
    .from("retreats")
    .select("id")
    .eq("source_submission_id", submission.id)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await admin
      .from("retreats")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
    return { slug };
  }

  const { error: insertErr } = await admin.from("retreats").insert(payload);
  if (insertErr) throw insertErr;
  return { slug };
}
