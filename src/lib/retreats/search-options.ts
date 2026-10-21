/**
 * Shared search option constants — used by the homepage search bar, the
 * listings toolbar, admin forms and the type tiles. ONE source of truth.
 */

export const RETREAT_TYPES = [
  "yoga",
  "meditation",
  "wellness",
  "nature",
  "breathwork",
  "sound healing",
  "somatic",
  "mindfulness",
] as const;

/** "What are you looking for?" intent values (brief H-02). Stored in the
 *  existing retreats.categories text[] column — no DB change required. */
export const RETREAT_INTENTS = [
  "rest and recharge",
  "healing",
  "personal growth",
  "clarity and focus",
  "leadership",
  "connection",
  "adventure",
  "spiritual",
  "health and wellbeing",
] as const;

export const BUDGET_BANDS = [
  { slug: "under_1000", label: "Under €1,000", min: 0, max: 999 },
  { slug: "1000_2000", label: "€1,000–2,000", min: 1000, max: 2000 },
  { slug: "2000_3500", label: "€2,000–3,500", min: 2000, max: 3500 },
  { slug: "3500_5000", label: "€3,500–5,000", min: 3500, max: 5000 },
  { slug: "5000_plus", label: "€5,000+", min: 5000, max: 999999 },
] as const;

export type BudgetSlug = (typeof BUDGET_BANDS)[number]["slug"];

/** @deprecated legacy URL value — kept mapped so old links keep working */
export const LEGACY_BUDGET_ALIASES: Record<string, BudgetSlug> = {
  "3500_plus": "3500_5000",
};

export function resolveBudgetSlug(raw: string): BudgetSlug | null {
  const alias = LEGACY_BUDGET_ALIASES[raw];
  const slug = alias ?? raw;
  const band = (BUDGET_BANDS as readonly { slug: string }[]).find(
    (b) => b.slug === slug
  );
  return (band?.slug as BudgetSlug) ?? null;
}

export function budgetRange(slug: BudgetSlug): { min: number; max: number } {
  const band = BUDGET_BANDS.find((b) => b.slug === slug);
  return band ? { min: band.min, max: band.max } : { min: 0, max: 999999 };
}