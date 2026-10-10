import { z } from "zod";

/** Budget filter values from URL params. */
export const BUDGET_SLUGS = ["under_1000", "1000_2000", "2000_3500", "3500_plus"] as const;

/** Duration filter values. */
export const DURATION_SLUGS = ["weekend", "week", "two_weeks", "month", "flexible"] as const;

/** Region values matching the DB CHECK constraint. */
export const REGION_SLUGS = [
  "europe", "latin_america", "asia", "africa",
  "north_america", "oceania", "middle_east",
] as const;

/** Sort options. */
export const SORT_OPTIONS = ["soonest", "price_asc", "price_desc"] as const;

export const PER_PAGE = 12;

/** Zod schema for validated URL searchParams. Invalid values → ignored, not errored. */
export const retreatListParamsSchema = z.object({
  q: z.string().optional(),
  destination: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, "YYYY-MM").optional(),
  type: z.string().optional(),
  budget: z.enum(BUDGET_SLUGS).optional(),
  duration: z.enum(DURATION_SLUGS).optional(),
  sort: z.enum(SORT_OPTIONS).optional(),
  page: z.coerce.number().int().positive().max(500).optional(),
});

export type RetreatListParams = z.infer<typeof retreatListParamsSchema>;

/** Parsed from URL searchParams, unknown keys silently dropped. */
export function parseRetreatListParams(
  raw: Record<string, string | string[] | undefined>
): RetreatListParams {
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(raw)) {
    flat[k] = Array.isArray(v) ? v[0] : v ?? undefined;
  }
  const parsed = retreatListParamsSchema.safeParse(flat);
  return parsed.success ? parsed.data : {};
}

/** Duration slug → min/max nights. */
export function durationRange(
  slug: string
): { minDays: number; maxDays: number } | null {
  switch (slug) {
    case "weekend":   return { minDays: 1, maxDays: 4 };
    case "week":      return { minDays: 4, maxDays: 9 };
    case "two_weeks": return { minDays: 10, maxDays: 17 };
    case "month":     return { minDays: 17, maxDays: 999 };
    default:          return null;
  }
}

/** Budget slug → price range in EUR (for price_from / departure price_override). */
export function budgetRange(
  slug: string
): { min: number; max: number } | null {
  switch (slug) {
    case "under_1000":  return { min: 0, max: 999 };
    case "1000_2000":   return { min: 1000, max: 2000 };
    case "2000_3500":   return { min: 2000, max: 3500 };
    case "3500_plus":   return { min: 3500, max: 999999 };
    default:            return null;
  }
}