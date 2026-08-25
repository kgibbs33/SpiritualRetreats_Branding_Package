import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeQuickCapture } from "@/components/home/HomeQuickCapture";
import { HomeRolePaths } from "@/components/home/HomeRolePaths";
import { RetreatCard } from "@/components/retreat/RetreatCard";
import { listPublishedRetreats } from "@/lib/retreats/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SPOTLIGHT_COUNT = 3;

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const retreatTypes = [
  {
    label: "Yoga",
    sub: "Movement & breath",
    href: "/retreat-listings?type=yoga",
    image: "/images/yoga-retreat.jpg",
  },
  {
    label: "Meditation",
    sub: "Stillness & clarity",
    href: "/retreat-listings?type=meditation",
    image: "/images/meditation-retreat-type.png",
  },
  {
    label: "Wellness",
    sub: "Restore & renew",
    href: "/retreat-listings?type=wellness",
    image: "/images/spa-wellness.jpg",
  },
  {
    label: "Nature",
    sub: "Wild & grounding",
    href: "/retreat-listings?type=nature",
    image: "/images/nature-retreat-type.png",
  },
];

const testimonials = [
  {
    quote: "Five days in Bali changed how I see everything.",
    name: "Mara S.",
    location: "New York",
    image: "/images/hero-meditation.jpg",
  },
  {
    quote: "From burnout to balance. I didn't know I needed this.",
    name: "James R.",
    location: "London",
    image: "/images/beach-wellness.jpg",
  },
  {
    quote: "Leadership clarity in the mountains of Peru.",
    name: "Lucia V.",
    location: "São Paulo",
    image: "/images/sacred-valley.jpg",
  },
];

const trustItems = [
  { value: "Vetted", label: "Retreat partners" },
  { value: "Human", label: "Every match reviewed" },
  { value: "Free", label: "For all seekers" },
  { value: "24 h", label: "Avg. reply time" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function Home() {
  const { cards: publishedCards, error: spotlightError } =
    await listPublishedRetreats();
  const spotlightCards = publishedCards.slice(0, SPOTLIGHT_COUNT);

  return (
    <div className="bg-white">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      {/* Full-bleed, minimal text, one strong CTA */}
      <section className="relative isolate min-h-[92vh] overflow-hidden">
        <Image
          src="/images/hero-yoga-outdoor.jpg"
          alt="Person in yoga pose overlooking a natural landscape"
          fill
          className="z-0 object-cover object-[center_45%] sm:object-center"
          priority
          sizes="100vw"
        />
        {/* Bottom-weighted scrim: bright top, readable copy zone (avoid stacking heavy full-bleed layers) */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-t from-black/80 from-0% via-black/45 via-[36%] to-transparent to-[68%] sm:via-[40%] sm:to-[74%]"
          aria-hidden
        />
        {/* Left anchor — only where copy sits, not full width */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-full max-w-xl bg-linear-to-r from-black/35 via-black/10 to-transparent sm:max-w-2xl sm:from-black/28 lg:max-w-3xl"
          aria-hidden
        />

        {/* Content anchored to bottom-left for editorial feel */}
        <div className="absolute inset-x-0 bottom-0 z-[2] px-5 pb-[max(3.5rem,env(safe-area-inset-bottom))] sm:px-12 sm:pb-20 lg:px-20">
          <div className="max-w-3xl rounded-2xl border border-white/15 bg-black/25 px-4 py-5 backdrop-blur-[3px] sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
            {/* Hero copy re-specified by the client, 2026-08-10 (SCOPE-011). Subline unchanged pending review — see STAKEHOLDER_DECISIONS_ANDREW.md §1. */}
            <p className="mb-3 text-eyebrow font-semibold uppercase tracking-[0.15em] text-white/95 sm:mb-4 sm:text-eyebrow-lg sm:tracking-[0.18em] [text-shadow:0_1px_10px_rgb(0_0_0_/_55%)]">
              For seekers, owners, facilitators
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl [text-shadow:0_2px_20px_rgb(0_0_0_/_60%)]">
              We support your<br />
              <span className="text-gold [text-shadow:0_2px_18px_rgb(0_0_0_/_65%)]">
                spiritual retreat.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-lg/7 leading-relaxed text-white/95 sm:text-xl/8 [text-shadow:0_1px_12px_rgb(0_0_0_/_50%)]">
              Tell us where you are in life. We match you to the retreat that fits.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/retreat-discovery-form"
                className="inline-flex h-14 w-full items-center justify-center rounded-xl bg-warm-brown px-9 text-base font-semibold text-white shadow-lg transition-all hover:bg-warm-brown/90 hover:scale-[1.02] active:scale-[0.99] sm:w-fit"
              >
                Find my retreat, free
              </Link>
              <Link
                href="/retreat-listings"
                className="inline-flex h-14 w-full items-center justify-center rounded-xl border border-white/40 bg-black/20 px-7 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/60 hover:bg-black/30 sm:w-fit"
              >
                Browse retreats
              </Link>
            </div>
            <p className="mt-4 text-sm/6 text-white/85 [text-shadow:0_1px_8px_rgb(0_0_0_/_45%)]">
              3 minutes · No account · Human reply within 24 hours
            </p>
          </div>
        </div>
      </section>

      <HomeRolePaths />

      {/* ── TRUST BAR ────────────────────────────────────────────────────── */}
      <section className="border-b border-beige bg-cream px-4 sm:px-6">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-beige sm:grid-cols-4">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex min-h-[5.5rem] flex-col items-center justify-center bg-cream px-3 py-5 text-center sm:min-h-0 sm:px-4"
            >
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-forest sm:text-xl">
                {item.value}
              </span>
              <span className="mt-1 max-w-[9.5rem] text-sm leading-snug text-pretty text-stone-500 sm:max-w-none">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── RETREAT TYPES — immersive photo grid ─────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
              Explore by type
            </h2>
            <Link
              href="/retreat-listings"
              className="text-sm font-medium text-warm-brown underline-offset-2 hover:underline"
            >
              View all →
            </Link>
          </div>

          {/* Uniform photo grid: 2×2 mobile, 4-across desktop — avoids row-span holes */}
          <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {retreatTypes.map(({ label, sub, href, image }) => (
              <Link
                key={label}
                href={href}
                className="group relative block w-full min-w-0 overflow-hidden rounded-2xl bg-stone-100"
              >
                <div className="relative isolate aspect-[4/5] w-full overflow-hidden">
                  <Image
                    src={image}
                    alt={label}
                    fill
                    loading="eager"
                    className="z-0 object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-t from-black/65 via-black/10 to-transparent"
                    aria-hidden
                  />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] p-4 sm:p-5">
                  <p className="text-lg font-semibold text-white drop-shadow-sm">{label}</p>
                  <p className="mt-0.5 text-sm font-medium text-white/75">{sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPOTLIGHT RETREATS ───────────────────────────────────────────── */}
      <section className="border-t border-beige bg-cream py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
                Curated for right now
              </h2>
              <p className="mt-1 text-base text-stone-500 sm:text-lg/7">
                Hand-picked by our team for May–August 2026
              </p>
            </div>
            <Link
              href="/retreat-listings"
              className="hidden text-sm font-medium text-warm-brown underline-offset-2 hover:underline sm:block"
            >
              All retreats →
            </Link>
          </div>

          {spotlightCards.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {spotlightCards.map((r) => (
                <RetreatCard key={String(r.id)} {...r} />
              ))}
            </div>
          ) : (
            <div
              className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-stone-800"
              role="status"
            >
              <p className="font-medium">
                Featured retreats will appear here once listings are live.
              </p>
              <p className="mt-2 text-sm text-stone-600">
                {spotlightError
                  ? spotlightError
                  : "No published retreats in the directory yet."}
              </p>
              <Link
                href="/retreat-listings"
                className="mt-4 inline-flex text-sm font-semibold text-warm-brown underline-offset-2 hover:underline"
              >
                Browse all retreats →
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/retreat-listings"
              className="text-sm font-medium text-warm-brown underline-offset-2 hover:underline"
            >
              View all retreats →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FULL-BLEED MATCHING CTA ───────────────────────────────────────── */}
      {/* A quiet full-bleed image break — editorial pause before testimonials */}
      <section className="relative h-[60vh] overflow-hidden">
        <Image
          src="/images/nature-immersion.jpg"
          alt="Person in nature immersion"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-20">
          <div className="max-w-md">
            <p className="mb-3 text-eyebrow font-semibold uppercase tracking-[0.15em] text-white/80 sm:text-eyebrow-lg sm:tracking-[0.18em]">
              Our approach
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Not a search engine.<br />A recommendation.
            </h2>
            <p className="mt-4 text-base/7 leading-relaxed text-white/80 sm:text-lg/7">
              Tell us about yourself. A real person reads your answers
              and replies within 24 hours with 2–4 retreats chosen for you.
            </p>
            <Link
              href="/find-your-retreat"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl border border-white/40 px-7 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/70"
            >
              How it works →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — photo-forward ─────────────────────────────────── */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="mb-8 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
            From people like you
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            {testimonials.map(({ quote, name, location, image }) => (
              <figure key={name} className="group relative overflow-hidden rounded-2xl">
                <div className="relative isolate aspect-[3/4] overflow-hidden">
                  <Image
                    src={image}
                    alt={`${name}'s retreat`}
                    width={600}
                    height={800}
                    loading="lazy"
                    className="z-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-t from-black/80 via-black/20 to-transparent"
                    aria-hidden
                  />
                </div>
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] p-5">
                  <blockquote className="text-sm font-medium italic leading-relaxed text-white/90">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                  <p className="mt-2 text-sm font-semibold text-white/70">
                    — {name}, {location}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR RETREAT OWNERS — quiet strip ─────────────────────────────── */}
      <section className="border-t border-beige bg-cream py-10">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.15em] text-stone-500 sm:text-eyebrow-lg sm:tracking-[0.18em]">
                Retreat owners & facilitators
              </p>
              <p className="mt-1 text-base font-semibold text-stone-800">
                List your retreat and reach the right seekers.
              </p>
            </div>
            <Link
              href="/for-retreat-owners"
              className="shrink-0 rounded-xl border border-stone-300 bg-white px-6 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition-all hover:border-forest hover:text-forest"
            >
              Learn about listing →
            </Link>
          </div>
        </div>
      </section>

      <HomeQuickCapture />

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest py-24 text-white">
        {/* Subtle organic texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.06)_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(215,159,79,0.12)_0%,_transparent_60%)]"
        />
        <div className="relative mx-auto max-w-2xl px-5 text-center sm:px-8">
          <p className="mb-4 text-eyebrow font-semibold uppercase tracking-[0.15em] text-white/70 sm:text-eyebrow-lg sm:tracking-[0.18em]">
            Ready when you are
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
            Find the retreat that&apos;s<br />right for you.
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-base/7 leading-relaxed text-white/75 sm:text-lg/7">
            3 minutes. A human reply. Retreats that actually fit.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/retreat-discovery-form"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-warm-brown px-10 text-base font-semibold text-white shadow-md transition-all hover:bg-warm-brown/90 hover:scale-[1.02] active:scale-[0.99]"
            >
              Start the questionnaire, free
            </Link>
            <Link
              href="/retreat-listings"
              className="text-sm font-medium text-white/50 underline-offset-2 hover:text-white/80 hover:underline transition-colors"
            >
              Browse retreats →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
