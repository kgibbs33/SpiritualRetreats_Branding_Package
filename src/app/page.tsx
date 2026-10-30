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
      {/* H-01 HERO — full-bleed photo header in the lightpathcollective.com look */}
      <section className="relative isolate overflow-hidden min-h-[34rem] lg:min-h-[80vh]">
        {/* Background photo — decorative; woman kept visible via object-position */}
        <BrandImage
          slot={IMAGES.homeHero}
          fill
          priority
          sizes="100vw"
          className="object-[70%_center] md:object-right"
        />

        {/* Readability overlays */}
        <div aria-hidden className="absolute inset-0 bg-warm-cream/80 sm:hidden" />
        <div aria-hidden className="hidden sm:block absolute inset-0 bg-[linear-gradient(90deg,#F8F2E7_0%,rgba(248,242,231,0.96)_38%,rgba(248,242,231,0)_60%)]" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent sm:hidden" />

        {/* Content */}
        <div className="relative mx-auto flex min-h-[34rem] max-w-7xl items-center px-5 py-16 sm:px-8 lg:min-h-[80vh] lg:px-10">
          <div className="max-w-[36rem] text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8B5E1A]">
              Transformational retreats worldwide
            </p>

            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-tight text-forest-green sm:text-5xl lg:text-7xl">
              Leave the noise behind.
              <br />
              <span className="italic text-[#8B5E1A]">Return to what matters.</span>
            </h1>

            {/* Thin gold divider with sun mark */}
            <div className="mt-6 flex items-center gap-3" aria-hidden>
              <span className="h-px w-16 bg-[#8B5E1A]/70" />
              <svg className="h-4 w-4 text-[#8B5E1A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" strokeLinecap="round" />
              </svg>
              <span className="h-px w-44 bg-[#8B5E1A]/70" />
            </div>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-700 sm:text-xl">
              Retreats designed to help you reconnect, restore and rediscover
              yourself — from sacred landscapes to soul-led experiences around
              the world.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#search"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-forest-green px-8 text-sm font-semibold text-white shadow-md transition-all hover:bg-forest-green/90 hover:scale-[1.02]"
              >
                Find my retreat
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" />
                </svg>
              </a>
              <Link
                href="/retreat-planners"
                className="inline-flex h-12 items-center rounded-full border-2 border-forest-green px-8 text-sm font-semibold text-forest-green transition-colors hover:bg-forest-green hover:text-white"
              >
                Plan a retreat
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* H-02 search (id="search") — unchanged, right below the header */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 pt-10 pb-6 sm:px-8 lg:px-10">
          <div id="search" className="scroll-mt-24">
            <RetreatSearchBar />
          </div>
        </div>
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