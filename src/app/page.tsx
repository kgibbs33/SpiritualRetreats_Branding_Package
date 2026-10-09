import type { Metadata } from "next";
import Link from "next/link";
import { RetreatSearchBar } from "@/components/home/RetreatSearchBar";
import { RetreatCard } from "@/components/retreat/RetreatCard";
import { listPublishedRetreats } from "@/lib/retreats/queries";
import {
  BRAND_POSITIONING,
  SEEKER_HERO_HEADING,
  SEEKER_HERO_TEXT,
  PILLARS,
  CTA,
} from "@/lib/brand";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SPOTLIGHT_COUNT = 3;

export default async function Home() {
  const { cards: publishedCards } = await listPublishedRetreats();
  const spotlightCards = publishedCards.slice(0, SPOTLIGHT_COUNT);

  return (
    <div className="bg-white">
      {/* ── HERO — warm cream, seeker-first ──────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-warm-cream">
        <div className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:px-10 lg:pb-36 lg:pt-32">
          <div className="max-w-2xl">
            <h1 className="font-[family-name:var(--font-display)] text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-celestial-navy sm:text-5xl lg:text-6xl">
              {SEEKER_HERO_HEADING}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600 sm:text-xl">
              {SEEKER_HERO_TEXT}
            </p>
          </div>

          <div className="mt-10">
            <RetreatSearchBar />
          </div>
        </div>

        {/* Subtle bottom fade hint */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white"
          aria-hidden
        />
      </section>

      {/* ── HOW IT WORKS — concise strip ─────────────────────────────────── */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy sm:text-3xl">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <div>
              <div className="flex size-12 items-center justify-center rounded-full bg-sage-mist text-forest-green">
                <span className="text-xl font-semibold">1</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-celestial-navy">
                Search or explore
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Browse retreats by destination, date, type or budget. Free to
                search, no account needed.
              </p>
            </div>
            <div>
              <div className="flex size-12 items-center justify-center rounded-full bg-sage-mist text-forest-green">
                <span className="text-xl font-semibold">2</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-celestial-navy">
                Compare and choose
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                See what each retreat offers — dates, pricing, photos, and
                descriptions — side by side.
              </p>
            </div>
            <div>
              <div className="flex size-12 items-center justify-center rounded-full bg-sage-mist text-forest-green">
                <span className="text-xl font-semibold">3</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-celestial-navy">
                Connect directly
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Reach out to the retreat organiser through the platform and
                start your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUR PILLARS ─────────────────────────────────────────────────── */}
      <section className="border-t border-sage-mist bg-warm-cream py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy sm:text-3xl">
            Everything in one place
          </h2>
          <p className="mt-3 max-w-lg text-base text-stone-600">
            {BRAND_POSITIONING}
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <div
                key={p.slug}
                className="rounded-2xl border border-sage-mist bg-white p-6"
              >
                <span
                  className="inline-block rounded-full bg-sage-mist px-3 py-1 text-xs font-semibold uppercase tracking-wider text-forest-green"
                >
                  {p.label}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-celestial-navy">
                  {p.audience}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED RETREATS — shows nothing when empty ──────────────────── */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy sm:text-3xl">
              Featured retreats
            </h2>
            <Link
              href="/retreat-listings"
              className="text-link text-sm font-medium"
            >
              View all →
            </Link>
          </div>

          {spotlightCards.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {spotlightCards.map((r) => (
                <RetreatCard key={String(r.id)} {...r} />
              ))}
            </div>
          ) : (
            /* Silently empty — no placeholder, no error, no text */
            null
          )}
        </div>
      </section>

      {/* ── JOIN OUR COMMUNITY — quiet band ──────────────────────────────── */}
      <section className="border-t border-sage-mist bg-forest-green py-16 text-warm-cream sm:py-20">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
            Be part of a growing retreat community
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-warm-cream/80">
            Whether you are searching for the right retreat, listing your own,
            offering a venue or sharing your skills as a facilitator — there is
            a place for you here.
          </p>
          <Link
            href="/join-our-community"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-sacred-gold px-8 text-base font-semibold text-celestial-navy shadow-sm transition-all hover:bg-sacred-gold/90 hover:scale-[1.02] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-cream/50 focus-visible:ring-offset-2 focus-visible:ring-offset-forest-green"
          >
            {CTA.JOIN_OUR_COMMUNITY}
          </Link>
        </div>
      </section>
    </div>
  );
}