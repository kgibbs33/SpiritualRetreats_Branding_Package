import type { RetreatRow } from "@/lib/retreats/types";

/** Normalized query for /retreat-listings (URL searchParams). */
export type RetreatListQuery = {
  type: string | undefined;
  /** Seeker need/intent facet (rest, healing, …) mapped to retreat categories. */
  intent: string | undefined;
  budget: string | undefined;
  region: string | undefined;
  sort: string | undefined;
  /** ISO date yyyy-mm-dd — matches month + year in `dates_display` when possible. */
  from: string | undefined;
  chip: string | undefined;
};

/**
 * Need/intent facet (SCOPE-055). The retreats table has no intent column, so
 * the seeker-side vocabulary is derived from the existing `type` category
 * taxonomy — "align the facet with retreat categories" rather than store it.
 * Each intent maps to the category slugs (`RetreatCategorySlug`) that serve it;
 * a retreat matches an intent when its `type` is in the mapped set.
 */
export const RETREAT_INTENT_TO_CATEGORIES: Record<string, readonly string[]> = {
  rest: ["yoga", "wellness", "silent", "nature", "sound"],
  healing: ["wellness", "reiki", "somatic", "plant", "breathwork", "sound"],
  growth: ["creative", "manifestation", "breathwork", "somatic"],
  clarity: ["meditation", "silent", "breathwork"],
  leadership: ["leadership", "manifestation"],
  connection: ["creative", "sound", "nature"],
  adventure: ["adventure", "nature"],
  spiritual: ["spiritual", "meditation", "plant", "reiki", "yoga"],
  health_wellbeing: ["wellness", "detox_renewal", "somatic", "yoga"],
};

/** Intent facet options for the listings toolbar (slug + human label). */
export const RETREAT_INTENT_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: "rest", label: "Rest & recharge" },
  { value: "healing", label: "Healing" },
  { value: "growth", label: "Personal growth" },
  { value: "clarity", label: "Clarity & focus" },
  { value: "leadership", label: "Leadership" },
  { value: "connection", label: "Connection" },
  { value: "adventure", label: "Adventure" },
  { value: "spiritual", label: "Spiritual" },
  { value: "health_wellbeing", label: "Health & Wellbeing" },
];

const INTENT_VALUES = new Set(Object.keys(RETREAT_INTENT_TO_CATEGORIES));

const TYPE_VALUES = new Set(["yoga", "meditation", "wellness", "nature"]);
const BUDGET_VALUES = new Set(["under_1k", "1k_2k", "2k_plus", "under_2k"]);
const REGION_VALUES = new Set(["europe", "latin_america", "asia"]);
const SORT_VALUES = new Set([
  "relevance",
  "price_asc",
  "price_desc",
  "date",
  "rating",
]);
const CHIP_VALUES = new Set([
  "upcoming",
  "affordable",
  "deluxe",
  "top_rated",
  "weekend",
]);

function isTruthyParam(
  v: string | string[] | undefined
): boolean {
  const s = first(v);
  return s === "1" || s === "true" || s === "yes";
}

function first(
  v: string | string[] | undefined
): string | undefined {
  if (v === undefined) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  if (s === undefined || s === "") return undefined;
  return s;
}

function normalizeType(raw: string | undefined): string | undefined {
  if (!raw || raw === "all") return undefined;
  const v = raw.trim().toLowerCase();
  return TYPE_VALUES.has(v) ? v : undefined;
}

function normalizeIntent(raw: string | undefined): string | undefined {
  if (!raw || raw === "all") return undefined;
  const v = raw.trim().toLowerCase();
  return INTENT_VALUES.has(v) ? v : undefined;
}

function normalizeBudget(raw: string | undefined): string | undefined {
  if (!raw || raw === "all") return undefined;
  const v = raw.trim().toLowerCase().replace(/-/g, "_");
  return BUDGET_VALUES.has(v) ? v : undefined;
}

function normalizeRegion(raw: string | undefined): string | undefined {
  if (!raw || raw === "all") return undefined;
  const v = raw.trim().toLowerCase();
  return REGION_VALUES.has(v) ? v : undefined;
}

function normalizeSort(raw: string | undefined): string | undefined {
  if (!raw || raw === "all") return undefined;
  const v = raw.trim().toLowerCase();
  return SORT_VALUES.has(v) ? v : undefined;
}

function normalizeChip(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const v = raw.trim().toLowerCase();
  return CHIP_VALUES.has(v) ? v : undefined;
}

/**
 * Parse Next.js page searchParams into a safe filter object.
 * Quick chips can imply budget / rating; explicit dropdowns win when both set — chip applied first then overridden by explicit param if we want — here: explicit `budget` from URL overrides chip-derived budget unless chip-only. Simpler: chip expands into effective filters below.
 */
export function parseRetreatListQuery(
  raw: Record<string, string | string[] | undefined>
): RetreatListQuery {
  const type = normalizeType(first(raw.type));
  const intent = normalizeIntent(first(raw.intent));
  let budget = normalizeBudget(first(raw.budget));
  const region = normalizeRegion(first(raw.region));
  let sort = normalizeSort(first(raw.sort)) ?? "relevance";
  const from = first(raw.from);
  let chip = normalizeChip(first(raw.chip));
  if (!chip) {
    if (isTruthyParam(raw.upcoming)) chip = "upcoming";
    else if (isTruthyParam(raw.affordable)) chip = "affordable";
    else if (isTruthyParam(raw.deluxe)) chip = "deluxe";
    else if (isTruthyParam(raw.top_rated)) chip = "top_rated";
    else if (isTruthyParam(raw.weekend)) chip = "weekend";
  }

  if (chip === "affordable") {
    if (!budget) budget = "under_2k";
  } else if (chip === "deluxe") {
    if (!budget) budget = "2k_plus";
  } else if (chip === "top_rated") {
    /* handled in applyRetreatFilters via minRating */
  } else if (chip === "upcoming") {
    if (!sort || sort === "relevance") sort = "date";
  }

  return { type, intent, budget, region, sort, from, chip };
}

/** True when URL implies anything other than default relevance listing. */
export function hasActiveRetreatFilters(q: RetreatListQuery): boolean {
  return Boolean(
    q.type ||
      q.intent ||
      q.budget ||
      q.region ||
      q.from ||
      q.chip ||
      (q.sort && q.sort !== "relevance")
  );
}

/** Lowest dollar amount mentioned in marketing copy (e.g. "From $2,300"). */
export function minPriceUsd(priceDisplay: string): number {
  const matches = [...priceDisplay.matchAll(/\$[\d,]+/g)];
  if (matches.length === 0) return Number.NaN;
  return Math.min(
    ...matches.map((m) => Number(String(m[0]).replace(/[$,]/g, "")))
  );
}

const LATIN_KEYWORDS = [
  "mexico",
  "peru",
  "costa rica",
  "navidad",
  "písac",
  "pisac",
  "sacred valley",
];
const ASIA_KEYWORDS = ["bali", "india", "kerala"];
const EUROPE_KEYWORDS = [
  "germany",
  "spain",
  "portugal",
  "uk",
  "united kingdom",
  "england",
  "london",
  "algarve",
  "granada",
  "sierra nevada",
  "black forest",
  "titisee-neustadt",
  "sagres",
];

function locationMatchesRegion(
  location: string | null,
  region: string | undefined
): boolean {
  if (!region) return true;
  const loc = (location ?? "").toLowerCase();
  if (!loc) return false;
  const keywords =
    region === "latin_america"
      ? LATIN_KEYWORDS
      : region === "asia"
        ? ASIA_KEYWORDS
        : region === "europe"
          ? EUROPE_KEYWORDS
          : [];
  return keywords.some((k) => loc.includes(k));
}

function budgetMatches(row: RetreatRow, budget: string | undefined): boolean {
  if (!budget) return true;
  const n = minPriceUsd(row.price_display);
  if (Number.isNaN(n)) return true;
  if (budget === "under_1k") return n < 1000;
  if (budget === "1k_2k") return n >= 1000 && n < 2000;
  if (budget === "2k_plus") return n >= 2000;
  if (budget === "under_2k") return n < 2000;
  return true;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function fromDateMatchesDisplay(
  fromIso: string | undefined,
  datesDisplay: string
): boolean {
  if (!fromIso) return true;
  const d = new Date(fromIso + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return true;
  const month = MONTH_NAMES[d.getUTCMonth()];
  const year = String(d.getUTCFullYear());
  const text = datesDisplay;
  return text.includes(month) && text.includes(year);
}

function weekendish(row: RetreatRow): boolean {
  const t = `${row.dates_display} ${row.title}`.toLowerCase();
  return (
    t.includes("weekend") ||
    /\b[34]\s*day/.test(t) ||
    t.includes("3-day") ||
    t.includes("4-day")
  );
}

function chipRowMatches(row: RetreatRow, chip: string | undefined): boolean {
  if (!chip) return true;
  if (chip === "top_rated") {
    const r = row.rating ?? 0;
    return r >= 4.5;
  }
  if (chip === "weekend") return weekendish(row);
  if (chip === "affordable" || chip === "deluxe" || chip === "upcoming")
    return true;
  return true;
}

function compareMinPrice(a: RetreatRow, b: RetreatRow, desc: boolean): number {
  const na = minPriceUsd(a.price_display);
  const nb = minPriceUsd(b.price_display);
  const aBad = Number.isNaN(na);
  const bBad = Number.isNaN(nb);
  if (aBad && bBad) return 0;
  if (aBad) return 1;
  if (bBad) return -1;
  const cmp = na - nb;
  return desc ? -cmp : cmp;
}

function sortRows(rows: RetreatRow[], sort: string): RetreatRow[] {
  const out = [...rows];
  switch (sort) {
    case "price_asc":
      return out.sort((a, b) => compareMinPrice(a, b, false));
    case "price_desc":
      return out.sort((a, b) => compareMinPrice(a, b, true));
    case "date":
      return out.sort((a, b) => a.sort_order - b.sort_order);
    case "rating":
      return out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "relevance":
    default:
      return out.sort((a, b) => a.sort_order - b.sort_order);
  }
}

/** Apply URL-driven filters client of Supabase (type/region in DB when possible). */
export function applyRetreatFilters(
  rows: RetreatRow[],
  q: RetreatListQuery
): RetreatRow[] {
  let list = rows.filter((row) => locationMatchesRegion(row.location, q.region));
  list = list.filter((row) => budgetMatches(row, q.budget));
  list = list.filter((row) => fromDateMatchesDisplay(q.from, row.dates_display));
  list = list.filter((row) => chipRowMatches(row, q.chip));
  if (q.type) {
    list = list.filter((row) => row.type === q.type);
  }
  if (q.intent) {
    const cats = RETREAT_INTENT_TO_CATEGORIES[q.intent] ?? [];
    list = list.filter((row) => {
      const rowCats = row.categories.length ? row.categories : [row.type];
      return cats.some((c) => rowCats.includes(c));
    });
  }
  return sortRows(list, q.sort ?? "relevance");
}
