import Image from "next/image";
import Link from "next/link";
import {
  IconMoon,
  IconLeaf,
  IconBolt,
  IconSprout,
  IconHandshake,
  IconCompass,
  IconSparkles,
  IconHeart,
} from "@/components/ui/icons/retreat-icons";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const whoThisIsFor = [
  {
    icon: <IconMoon className="h-6 w-6" />,
    label: "Burned out",
    desc: "Running on empty and needing deep rest.",
  },
  {
    icon: <IconLeaf className="h-6 w-6" />,
    label: "Healing",
    desc: "Processing something difficult — physically or emotionally.",
  },
  {
    icon: <IconBolt className="h-6 w-6" />,
    label: "At a crossroads",
    desc: "Craving clarity and a reset before the next chapter.",
  },
  {
    icon: <IconSprout className="h-6 w-6" />,
    label: "Growing",
    desc: "Ready to invest in yourself with intention.",
  },
  {
    icon: <IconHandshake className="h-6 w-6" />,
    label: "Seeking connection",
    desc: "Wanting community, shared experience, belonging.",
  },
  {
    icon: <IconCompass className="h-6 w-6" />,
    label: "Curious",
    desc: "Open to something new — just not sure what yet.",
  },
];

const howSteps = [
  {
    step: "1",
    heading: "You tell us about yourself",
    body: "A short 3-minute questionnaire — answered by tapping cards, not filling forms. No wrong answers.",
    accent: "3 min",
  },
  {
    step: "2",
    heading: "We read your answers carefully",
    body: "A real person reviews your responses. We look at intention, energy, budget, and timing — not just keywords.",
    accent: "Human review",
  },
  {
    step: "3",
    heading: "You receive curated matches",
    body: "Within 24 hours, we send you 2–4 retreats that genuinely fit — with a short note on why each one.",
    accent: "24 h reply",
  },
];

const whatYouGet = [
  {
    icon: <IconHeart className="h-5 w-5" />,
    heading: "Retreat options built for you",
    body: "Not a search results page. A small, considered selection matched to your exact situation.",
  },
  {
    icon: <IconSparkles className="h-5 w-5" />,
    heading: "A human recommendation, not an algorithm",
    body: "We read between the lines. Someone who has done this work reviews your answers personally.",
  },
  {
    icon: <IconLeaf className="h-5 w-5" />,
    heading: "Freedom to ask questions",
    body: "Once you have your matches, you can ask anything. We stay with you until you feel ready to book.",
  },
];

const trustStats = [
  { value: "Free", label: "Always free for seekers" },
  { value: "24 h", label: "Average reply time" },
  { value: "Vetted", label: "Every retreat partner" },
];

// ---------------------------------------------------------------------------
// Small components
// ---------------------------------------------------------------------------

function Checkmark() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-forest"
      aria-hidden
    >
      <path d="M3 8l3 3 7-7" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FindYourRetreatPage() {
  return (
    <div className="relative bg-cream">
      {/* Organic background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(61,95,61,0.07)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(139,101,77,0.05)_0%,_transparent_55%)]"
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
        {/* Hero image */}
        <div className="mx-auto mb-12 max-w-3xl overflow-hidden rounded-3xl">
          <div className="relative h-64 w-full sm:h-80">
            <Image
              src="/images/hero-yoga-outdoor.jpg"
              alt="Person doing yoga in a peaceful outdoor setting"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-warm-brown">
            Retreat matching · Free · Human
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-6xl">
            The retreat that&apos;s<br />
            <em className="not-italic text-forest">right for you</em>
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-stone-500">
            Not the most popular one. Not the top-rated one.
            The one that fits where you are <em>right now</em>.
          </p>
          <div className="mt-10">
            <Link
              href="/retreat-discovery-form"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-warm-brown px-10 text-base font-semibold text-white shadow-md transition-all hover:bg-warm-brown/90 hover:shadow-lg active:scale-[0.99]"
            >
              Find my retreat — 3 minutes, free
            </Link>
            <p className="mt-3 text-xs text-stone-400">
              No account · No spam · Reply within 24 hours
            </p>
          </div>
        </div>
      </section>

      {/* ── WHO THIS IS FOR ───────────────────────────────────────────────── */}
      <section className="relative border-y border-beige bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Who this is for
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
            You don&apos;t need to have it figured out
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-stone-500">
            The only requirement is that something inside you is ready for a change.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {whoThisIsFor.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-3 rounded-2xl border border-beige bg-cream p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-warm-brown shadow-[0_2px_6px_rgba(139,101,77,0.1)]">
                  {item.icon}
                </span>
                <div>
                  <p className="font-semibold text-stone-800">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="relative px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            The process
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
            Simple, and then we do the work
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {howSteps.map((s) => (
              <div key={s.step} className="relative flex flex-col gap-4">
                {/* Number + accent pill */}
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-forest bg-white text-sm font-bold text-forest">
                    {s.step}
                  </span>
                  <span className="rounded-full bg-forest/8 px-2.5 py-0.5 text-xs font-semibold text-forest">
                    {s.accent}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-stone-800">{s.heading}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO STRIP ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 pb-4 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="grid grid-cols-3 gap-3">
            {[
              { src: "/images/meditation-nature.jpg", alt: "Meditation in nature" },
              { src: "/images/sacred-valley.jpg", alt: "Sacred valley retreat" },
              { src: "/images/spa-wellness.jpg", alt: "Spa and wellness" },
            ].map((img) => (
              <div key={img.src} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) 33vw, 256px" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU RECEIVE ─────────────────────────────────────────────── */}
      <section className="relative border-y border-beige bg-white px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            What you receive
          </p>
          <h2 className="mt-3 text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
            Not a list. A recommendation.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-stone-500">
            Most booking platforms return hundreds of results. We send you 2–4,
            carefully chosen, with a reason for each.
          </p>

          <div className="mt-10 space-y-4">
            {whatYouGet.map((item) => (
              <div
                key={item.heading}
                className="flex gap-4 rounded-2xl border border-beige bg-cream p-5"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-warm-brown shadow-[0_2px_6px_rgba(139,101,77,0.08)]">
                  {item.icon}
                </span>
                <div>
                  <p className="font-semibold text-stone-800">{item.heading}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-500">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VS SELF-BROWSING ─────────────────────────────────────────────── */}
      <section className="relative px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
            Why not just search yourself?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-stone-500">
            You can. But most people spend hours lost in tabs, overwhelmed by choice,
            and end up not booking at all.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {/* Self-search column */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <p className="mb-4 text-sm font-semibold text-stone-400">Searching on your own</p>
              <ul className="space-y-3">
                {[
                  "Hundreds of results, no filter for fit",
                  "Listings optimised for clicks, not you",
                  "Hard to compare across different sites",
                  "No one who knows you to ask",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-stone-500">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mt-0.5 h-4 w-4 shrink-0 text-stone-300" aria-hidden>
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Matched column */}
            <div className="rounded-2xl border border-forest/20 bg-forest/5 p-6">
              <p className="mb-4 text-sm font-semibold text-forest">Matched by Light Path Retreats</p>
              <ul className="space-y-3">
                {[
                  "2–4 retreats chosen for your situation",
                  "A human who read your answers, not a filter",
                  "One clear recommendation with a reason",
                  "Someone to answer your questions after",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-stone-700">
                    <Checkmark />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────── */}
      <section className="relative border-y border-beige bg-white px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 sm:flex-row sm:justify-around">
          {trustStats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-forest">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-stone-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section className="relative px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
            Ready to find the one that fits?
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-stone-500">
            3 minutes. No account. A real reply within a day.
          </p>
          <Link
            href="/retreat-discovery-form"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-xl bg-forest px-10 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#345834] hover:shadow-md active:scale-[0.99]"
          >
            Start the free questionnaire
          </Link>
          <div className="mt-6">
            <Link
              href="/retreat-listings"
              className="text-sm font-medium text-stone-400 underline-offset-2 transition-colors hover:text-stone-700 hover:underline"
            >
              Or browse all retreats →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
