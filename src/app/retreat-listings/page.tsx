import type { Metadata } from "next";
import Link from "next/link";
import { RetreatCard } from "@/components/retreat/RetreatCard";
import { RetreatListingsToolbar } from "@/components/retreat/RetreatListingsToolbar";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";
import { BrandImage } from "@/components/ui/BrandImage";
import { IMAGES } from "@/config/images";
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

const DECOR = [IMAGES.typeYoga, IMAGES.typeMeditation, IMAGES.typeWellness, IMAGES.typeNature];

function chosenFilters(raw: Record<string, string | string[] | undefined>) {
  const rows: { label: string; value: string }[] = [];
  const get = (k: string) => {
    const v = raw[k];
    return Array.isArray(v) ? v[0] : v ?? "";
  };
  const map: [string, string][] = [
    ["destination", "Destination"], ["month", "When"], ["type", "Type"],
    ["intent", "Looking for"], ["budget", "Budget"], ["duration", "Duration"],
    ["q", "Search"],
  ];
  for (const [k, label] of map) {
    const v = get(k).trim();
    if (v) rows.push({ label, value: v });
  }
  return rows;
}

export default async function RetreatListingsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const { cards, total, error } = await listPublishedRetreats(raw);

  const hasFilters =
    raw.q || raw.destination || raw.month || raw.type || raw.intent || raw.budget || raw.duration;
  const filters = chosenFilters(raw);

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
        <NewsletterSignup variant="light" layout="stacked" />
      </div>
    );
  }

  // ── Empty: filters returned nothing ─────────────────────────────────────
  if (cards.length === 0 && hasFilters) {
    const { cards: others } = await listPublishedRetreats({ sort: "newest", page: "1" });
    const suggestions = others.slice(0, 3);

    return (
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <RetreatListingsToolbar />
        <div className="py-16 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">
            There are no retreats matching this search right now.
          </h2>
          {filters.length > 0 && (
            <p className="mx-auto mt-4 max-w-md text-sm text-stone-600">
              You searched for:{" "}
              {filters.map((f, i) => (
                <span key={f.label}>
                  {i > 0 && ", "}
                  <strong className="text-celestial-navy">{f.label}:</strong> {f.value}
                </span>
              ))}
            </p>
          )}

          {suggestions.length > 0 && (
            <div className="mt-12">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-celestial-navy">
                You might also like
              </h3>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((r) => (
                  <RetreatCard key={String(r.id)} {...r} />
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <Link
              href="/retreat-listings"
              className="inline-flex h-12 items-center rounded-xl bg-sacred-gold px-6 text-sm font-semibold text-celestial-navy"
            >
              Clear filters and see all retreats
            </Link>
          </div>

          <div className="mx-auto mt-14 max-w-md rounded-2xl border border-sage-mist bg-warm-cream/60 p-6">
            <p className="text-sm font-semibold text-forest-green">
              Want to hear when a retreat like this is added? Join our
              community. We only send relevant updates, never spam.
            </p>
            <div className="mt-4">
              <NewsletterSignup variant="light" layout="stacked" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal results (warm welcome band) ──────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="rounded-3xl border border-sage-mist bg-sage-mist/30 px-5 py-6 sm:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex -space-x-3" aria-hidden>
            {DECOR.map((slot, i) => (
              <div key={i} className="h-12 w-12 overflow-hidden rounded-full border-2 border-warm-cream">
                <BrandImage slot={{ ...slot, alt: "" }} fill sizes="48px" />
              </div>
            ))}
          </div>
          <p className="font-[family-name:var(--font-display)] text-xl italic text-forest-green sm:text-2xl">
            Find the retreat that fits your goals, budget and journey.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <RetreatListingsToolbar />
      </div>
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

      {total > cards.length && (
        <p className="mt-8 text-center text-sm text-stone-400">
          {total} retreats total. Pagination coming soon.
        </p>
      )}
    </div>
  );
}