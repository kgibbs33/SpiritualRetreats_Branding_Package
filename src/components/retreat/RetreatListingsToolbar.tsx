"use client";

import {
  useCallback,
  useMemo,
  useTransition,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  parseRetreatListQuery,
  RETREAT_INTENT_OPTIONS,
} from "@/lib/retreats/retreat-filters";

const CHIP_ITEMS = [
  { id: "upcoming" as const, label: "Upcoming" },
  { id: "affordable" as const, label: "Affordable" },
  { id: "deluxe" as const, label: "Deluxe" },
  { id: "top_rated" as const, label: "Top Rated" },
  { id: "weekend" as const, label: "Weekend" },
];

const chipBase =
  "inline-flex shrink-0 items-center rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-150 motion-reduce:transition-none sm:px-4 sm:py-2.5 sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2";

const chipInactive =
  "border-beige bg-cream/90 text-stone-600 hover:border-warm-brown/35 hover:bg-cream hover:text-stone-800";

const chipActive =
  "border-forest bg-forest text-white shadow-[0_2px_8px_rgba(61,95,61,0.22)]";

const fieldBase =
  "h-11 w-full min-w-0 rounded-xl border border-beige bg-white text-sm font-medium text-stone-700 focus:border-warm-brown/50 focus:outline-none focus:ring-2 focus:ring-forest/15";

const dateFieldClass = [
  fieldBase,
  "px-3.5",
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
  "[&::-webkit-calendar-picker-indicator]:opacity-55",
  "[&::-webkit-calendar-picker-indicator]:hover:opacity-100",
].join(" ");

function SelectChevron() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-warm-brown"
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function FilterSelect({
  id,
  value,
  onChange,
  className,
  children,
}: {
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative min-w-0 ${className ?? ""}`}>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`${fieldBase} appearance-none py-0 pr-10 pl-3.5`}
      >
        {children}
      </select>
      <SelectChevron />
    </div>
  );
}

function stripLegacyBooleanParams(sp: URLSearchParams) {
  for (const k of [
    "upcoming",
    "affordable",
    "deluxe",
    "top_rated",
    "weekend",
  ]) {
    sp.delete(k);
  }
}

/** Clear quick-chip params (canonical + legacy) when refining via dropdowns. */
function stripChipParams(sp: URLSearchParams) {
  sp.delete("chip");
  stripLegacyBooleanParams(sp);
}

export function RetreatListingsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const query = useMemo(
    () =>
      parseRetreatListQuery(
        Object.fromEntries(searchParams.entries()) as Record<
          string,
          string | string[] | undefined
        >
      ),
    [searchParams]
  );

  const replaceQuery = useCallback(
    (mutate: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(searchParams.toString());
      mutate(sp);
      const qs = sp.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const onSelectChange =
    (key: "type" | "intent" | "budget" | "region" | "sort") =>
    (e: ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      replaceQuery((sp) => {
        stripChipParams(sp);
        if (!v || v === "all") sp.delete(key);
        else sp.set(key, v);
      });
    };

  const onDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    replaceQuery((sp) => {
      stripChipParams(sp);
      if (!v) sp.delete("from");
      else sp.set("from", v);
    });
  };

  const onChipClick = (id: (typeof CHIP_ITEMS)[number]["id"]) => {
    replaceQuery((sp) => {
      const current = parseRetreatListQuery(
        Object.fromEntries(sp.entries()) as Record<
          string,
          string | string[] | undefined
        >
      );
      stripLegacyBooleanParams(sp);
      if (current.chip === id) {
        sp.delete("chip");
        return;
      }
      sp.set("chip", id);
    });
  };

  const clearChip = () => {
    replaceQuery((sp) => {
      sp.delete("chip");
      stripLegacyBooleanParams(sp);
    });
  };

  return (
    <div className="border-b border-beige bg-white lg:sticky lg:top-[var(--site-header-height)] lg:z-40 lg:bg-white/95 lg:backdrop-blur-md lg:supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8 sm:py-4">
        {/* Quick picks — horizontal scroll on mobile, wrap on sm+ */}
        <div className="flex items-center justify-between gap-3">
          <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            Quick picks
          </p>
          {query.chip ? (
            <button
              type="button"
              onClick={clearChip}
              className="shrink-0 text-xs font-medium text-warm-brown underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="mt-2.5 min-w-0 sm:mt-3" aria-busy={pending}>
          <div
            role="toolbar"
            aria-label="Quick filters"
            className="flex min-w-0 touch-pan-x gap-2 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:overscroll-auto [&::-webkit-scrollbar]:hidden"
          >
            {CHIP_ITEMS.map(({ id, label }) => {
              const active = query.chip === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChipClick(id)}
                  className={`${chipBase} ${active ? chipActive : chipInactive}`}
                >
                  {label}
                </button>
              );
            })}
            {/* Trailing spacer so the last chip can scroll fully into view */}
            <span className="h-px w-2 shrink-0 sm:hidden" aria-hidden="true" />
          </div>
        </div>

        {/* Refine row — equal-width grid, shared control height */}
        <form
          role="search"
          aria-label="Refine retreat listings"
          className="mt-4 grid grid-cols-2 gap-2.5 border-t border-beige pt-4 sm:gap-3 md:grid-cols-3 lg:grid-cols-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="sr-only" htmlFor="retreat-filter-type">
            Type
          </label>
          <FilterSelect
            id="retreat-filter-type"
            value={query.type ?? ""}
            onChange={onSelectChange("type")}
          >
            <option value="">Type</option>
            <option value="yoga">Yoga</option>
            <option value="meditation">Meditation</option>
            <option value="wellness">Wellness</option>
            <option value="nature">Nature</option>
          </FilterSelect>

          <label className="sr-only" htmlFor="retreat-filter-intent">
            Need or intent
          </label>
          <FilterSelect
            id="retreat-filter-intent"
            value={query.intent ?? ""}
            onChange={onSelectChange("intent")}
          >
            <option value="">Need / intent</option>
            {RETREAT_INTENT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FilterSelect>

          <label className="sr-only" htmlFor="retreat-filter-from">
            Start date
          </label>
          <input
            id="retreat-filter-from"
            type="date"
            className={dateFieldClass}
            value={query.from ?? ""}
            onChange={onDateChange}
          />

          <label className="sr-only" htmlFor="retreat-filter-budget">
            Budget
          </label>
          <FilterSelect
            id="retreat-filter-budget"
            value={query.budget ?? ""}
            onChange={onSelectChange("budget")}
          >
            <option value="">Budget</option>
            <option value="under_1k">Under $1K</option>
            <option value="1k_2k">$1K – $2K</option>
            <option value="2k_plus">$2K+</option>
          </FilterSelect>

          <label className="sr-only" htmlFor="retreat-filter-region">
            Location
          </label>
          <FilterSelect
            id="retreat-filter-region"
            value={query.region ?? ""}
            onChange={onSelectChange("region")}
          >
            <option value="">Location</option>
            <option value="europe">Europe</option>
            <option value="latin_america">Latin America</option>
            <option value="asia">Asia</option>
          </FilterSelect>

          <label className="sr-only" htmlFor="retreat-filter-sort">
            Sort
          </label>
          <FilterSelect
            id="retreat-filter-sort"
            className="col-span-2 md:col-span-1"
            value={query.sort ?? "relevance"}
            onChange={onSelectChange("sort")}
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="date">Date</option>
            <option value="rating">Rating</option>
          </FilterSelect>
        </form>
      </div>
    </div>
  );
}
