import type { Metadata } from "next";
import Link from "next/link";
import { RetreatSearchBar } from "@/components/home/RetreatSearchBar";
import { NewsletterSignup } from "@/components/ui/NewsletterSignup";
import { canonicalUrl } from "@/lib/metadata";
import { BrandImage } from "@/components/ui/BrandImage";
import { IMAGES } from "@/config/images";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl("/") },
};

const TYPE_TILES = [
  { label: "Yoga", href: "/retreat-listings?type=yoga", slot: "typeYoga" as const },
  { label: "Meditation", href: "/retreat-listings?type=meditation", slot: "typeMeditation" as const },
  { label: "Wellness", href: "/retreat-listings?type=wellness", slot: "typeWellness" as const },
  { label: "Nature", href: "/retreat-listings?type=nature", slot: "typeNature" as const },
  { label: "Breathwork", href: "/retreat-listings?type=breathwork", slot: "typeBreathwork" as const },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* H-01 HERO + H-02 search (id="search") */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-warm-cream via-warm-cream/70 to-white">
        <div className="mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28 lg:px-10 lg:pb-40 lg:pt-36">
          <div className="max-w-2xl text-center mx-auto">
            <h1 className="font-[family-name:var(--font-display)] text-[2.75rem] font-bold leading-[1.06] tracking-tight text-celestial-navy sm:text-5xl lg:text-7xl">
              Leave the noise behind.
              <br />
              Return to what matters.
            </h1>
            <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-sacred-gold" aria-hidden />
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-stone-600 sm:text-xl">
              Find your retreat, or plan your own, with a trusted home for
              transformational retreats.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#search"
                className="inline-flex h-12 items-center rounded-full bg-sacred-gold px-8 text-sm font-semibold text-celestial-navy"
              >
                Find my retreat
              </a>
              <Link
                href="/retreat-planners"
                className="inline-flex h-12 items-center rounded-full bg-forest-green px-8 text-sm font-semibold text-white"
              >
                Plan a retreat
              </Link>
            </div>
          </div>

          <div id="search" className="mt-12 scroll-mt-24">
            <RetreatSearchBar />
          </div>
          {/* H-02 empty-state copy lives on /retreat-listings; search bar always renders */}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white"
          aria-hidden
        />
      </section>

      {/* H-03 — Where do you fit? two tiles for Retreat Planners */}
      <section className="bg-warm-cream/40 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy sm:text-3xl">
            Looking for a venue or facilitator?
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <Link
              href="/find-a-venue"
              className="group rounded-2xl border border-sage-mist bg-sage-mist/30 p-8 transition-all hover:border-river-teal/50 hover:shadow-md"
            >
              <h3 className="text-xl font-semibold text-celestial-navy">
                I&apos;m looking for a venue
              </h3>
              <p className="mt-2 text-stone-600">
                Browse approved venues and find the right space for your retreat.
              </p>
              <span className="mt-4 inline-block text-link text-sm font-medium">
                Find a venue →
              </span>
            </Link>
            <Link
              href="/find-a-facilitator"
              className="group rounded-2xl border border-sage-mist bg-sage-mist/30 p-8 transition-all hover:border-river-teal/50 hover:shadow-md"
            >
              <h3 className="text-xl font-semibold text-celestial-navy">
                I&apos;m looking for a facilitator
              </h3>
              <p className="mt-2 text-stone-600">
                Connect with facilitators who match your retreat programme.
              </p>
              <span className="mt-4 inline-block text-link text-sm font-medium">
                Find a facilitator →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* H-05 — Explore by type */}
      <section className="border-t border-sage-mist bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy sm:text-3xl">
            Explore by type
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {TYPE_TILES.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className="group overflow-hidden rounded-3xl border border-sage-mist bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative h-36 w-full">
                  <BrandImage slot={IMAGES[t.slot]} fill className="group-hover:scale-105 transition-transform duration-300" />
                </div>
                <span className="block p-4 text-center text-lg font-semibold text-celestial-navy">
                  {t.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* H-09 — Want to be found by retreat planners? */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="rounded-2xl border border-sage-mist bg-sage-mist/40 px-6 py-10 text-center sm:px-10">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy sm:text-3xl">
              Want to be found by retreat planners?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Link
                href="/find-a-venue#list"
                className="rounded-2xl border border-sage-mist bg-white p-6 transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-celestial-navy">Venues</h3>
                <p className="mt-2 text-sm text-stone-600">
                  List your space so planners can find it.
                </p>
                <span className="mt-3 inline-block text-link text-sm">Learn more →</span>
              </Link>
              <Link
                href="/find-a-facilitator#membership"
                className="rounded-2xl border border-sage-mist bg-white p-6 transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-celestial-navy">
                  Facilitators
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                  Create a profile and be found by planners.
                </p>
                <span className="mt-3 inline-block text-link text-sm">Learn more →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* H-11 — Closing CTA */}
      <section className="border-t border-sage-mist bg-forest-green py-16 text-warm-cream sm:py-20">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
            Ready to begin?
          </h2>
          <p className="mt-4 text-warm-cream/80">Find your retreat.</p>
          <a
            href="#search"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-sacred-gold px-10 text-base font-semibold text-celestial-navy shadow-md transition-all hover:bg-sacred-gold/90 hover:scale-[1.02]"
          >
            Find my retreat
          </a>
        </div>
      </section>

      {/* H-12 — Newsletter */}
      <section className="border-t border-sage-mist bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-xl px-5 sm:px-8">
          <NewsletterSignup variant="light" layout="stacked" />
        </div>
      </section>
    </div>
  );
}