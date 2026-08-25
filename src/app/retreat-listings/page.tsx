import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RetreatCard } from "@/components/retreat/RetreatCard";
import { RetreatListingsToolbar } from "@/components/retreat/RetreatListingsToolbar";
import { listPublishedRetreats } from "@/lib/retreats/queries";
import {
  hasActiveRetreatFilters,
  parseRetreatListQuery,
} from "@/lib/retreats/retreat-filters";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/retreat-listings" },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function ToolbarFallback() {
  return (
    <div className="border-b border-beige bg-white lg:sticky lg:top-[var(--site-header-height)] lg:z-40 lg:bg-white/95 lg:backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8 sm:py-4">
        <div className="h-3 w-20 animate-pulse rounded bg-stone-100" />
        <div className="mt-3 flex gap-2 overflow-hidden">
          {[72, 88, 64, 96, 76].map((w) => (
            <div
              key={w}
              className="h-9 shrink-0 animate-pulse rounded-full bg-stone-100"
              style={{ width: w }}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-beige pt-4 sm:gap-3 md:grid-cols-3 lg:grid-cols-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-xl bg-stone-100" />
          ))}
          <div className="col-span-2 h-11 animate-pulse rounded-xl bg-stone-100 md:col-span-1" />
        </div>
      </div>
    </div>
  );
}

export default async function RetreatListingsPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const q = parseRetreatListQuery(raw);
  const filtered = hasActiveRetreatFilters(q);
  const { cards, error } = await listPublishedRetreats(q);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-beige bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-stone-900">
            Retreat Listings Directory
          </h1>
          <p className="mt-2 text-stone-600">
            Curated transformative experiences worldwide. Find the retreat that
            fits you.
          </p>
        </div>
      </div>

      <Suspense fallback={<ToolbarFallback />}>
        <RetreatListingsToolbar />
      </Suspense>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {error ? (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-stone-800"
            role="alert"
          >
            <p className="font-medium">Retreats could not be loaded</p>
            <p className="mt-2 text-sm text-stone-600">
              Check Supabase connection and that the{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs">
                retreats
              </code>{" "}
              migration has been applied. ({error})
            </p>
          </div>
        ) : cards.length === 0 ? (
          <p className="text-center text-stone-600">
            {filtered
              ? "No retreats match these filters. Try clearing a filter or choose a different region."
              : "No published retreats yet. Add rows in Supabase or run migrations."}
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((r) => (
              <RetreatCard key={String(r.id)} {...r} />
            ))}
          </div>
        )}

        <div className="mt-16 flex flex-col items-center gap-6 border-t border-beige pt-16">
          <p className="text-center text-stone-600">
            Prefer a personalized match? Tell us what you are looking for.
          </p>
          <Link
            href="/retreat-discovery-form"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-forest px-8 font-semibold text-white transition-all hover:bg-[#345834]"
          >
            Get matched — Find Your Retreat
          </Link>
        </div>
      </div>
    </div>
  );
}
