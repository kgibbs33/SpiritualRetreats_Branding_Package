import type { Metadata } from "next";
import Link from "next/link";
import { RetreatCard } from "@/components/retreat/RetreatCard";
import { RetreatListingsToolbar } from "@/components/retreat/RetreatListingsToolbar";
import { listPublishedRetreats } from "@/lib/retreats/queries";

export const metadata: Metadata = {
  title: "Discover Retreats",
  description: "Browse spiritual retreats by destination, date, type and budget.",
  alternates: { canonical: "/retreat-listings" },
};

export const revalidate = 60;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RetreatListingsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const { cards, total, error } = await listPublishedRetreats(raw);

  const hasFilters =
    raw.q || raw.destination || raw.month || raw.type || raw.budget || raw.duration;

  // ── Empty: no published retreats at all ────────────────────────────────
  if (cards.length === 0 && !hasFilters && !error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl">
          Our first retreats are being added.
        </h1>
        <p className="mt-4 text-stone-600">
          The directory will be live soon. Leave your email and we will let you
          know when the first retreats are published.
        </p>

        {/* Simple email capture — writes to search_alerts once Migration A applied */}
        <form
          action="/api/newsletter"
          method="POST"
          className="mx-auto mt-8 max-w-sm"
        >
          <input type="hidden" name="company" value="" />
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              className="flex-1 rounded-xl border-2 border-sage-mist px-4 py-3 text-sm"
            />
            <button
              type="submit"
              className="rounded-xl bg-sacred-gold px-6 py-3 text-sm font-semibold text-celestial-navy"
            >
              Tell me when retreats are live
            </button>
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-stone-500">
            <input type="checkbox" required className="accent-river-teal" />
            I agree to be contacted about retreat updates
          </label>
        </form>

        <p className="mt-6 text-sm text-stone-400">
          Not sure what you are looking for?{" "}
          <Link href="/find-your-retreat" className="text-link">
            Tell us about your path
          </Link>
        </p>
      </div>
    );
  }

  // ── Empty: filters returned nothing ─────────────────────────────────────
  if (cards.length === 0 && hasFilters) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <RetreatListingsToolbar />
        <div className="py-20 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">
            No retreats match these filters yet.
          </h2>
          <p className="mt-3 text-stone-600">
            Try removing some filters or browse all available retreats.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/retreat-listings" className="inline-flex h-12 items-center rounded-xl bg-sacred-gold px-6 text-sm font-semibold text-celestial-navy">
              See all retreats
            </Link>
            <Link href="/find-your-retreat" className="text-link text-sm">
              Get notified when a match is added
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal results ──────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <RetreatListingsToolbar />
      <p className="mt-4 text-sm text-stone-500">{total} retreat{total !== 1 ? "s" : ""} found</p>

      {error && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((r) => (
          <RetreatCard key={String(r.id)} {...r} />
        ))}
      </div>

      {/* TODO(owner): pagination — use total and page param */}
      {total > cards.length && (
        <p className="mt-8 text-center text-sm text-stone-400">
          {total} retreats total. Pagination coming soon.
        </p>
      )}
    </div>
  );
}