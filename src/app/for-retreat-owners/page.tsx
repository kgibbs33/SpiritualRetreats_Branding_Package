import Link from "next/link";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const benefits = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    heading: "Pre-qualified seekers",
    body: "Every guest who reaches you has completed a detailed intention questionnaire. No casual browsers — only people who have articulated exactly why they want a retreat.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    heading: "Human matching, not algorithms",
    body: "Our team reads each submission personally and selects the retreats most aligned to that person's intention, budget, and timing. Your retreat reaches the right people.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    heading: "Global reach, zero ad spend",
    body: "Light Path Retreats connects retreat owners worldwide with a growing base of seekers actively looking. You focus on the experience — we handle discovery.",
  },
];

const steps = [
  {
    number: "01",
    heading: "Submit your retreat",
    body: "Fill in our intake form — takes around 5 minutes. Tell us about the experience, location, dates, and who it is for.",
    accent: "5 min form",
  },
  {
    number: "02",
    heading: "We review it personally",
    body: "Our team reviews every submission and may follow up with a short clarifying question before listing.",
    accent: "team review",
  },
  {
    number: "03",
    heading: "Your retreat goes live",
    body: "Once approved, your retreat is listed in our directory and becomes eligible for seeker matching.",
    accent: "Public listing",
  },
  {
    number: "04",
    heading: "Matched guests reach out",
    body: "When a seeker's profile aligns with your retreat, we notify both sides. You coordinate the booking directly — no middleman on the conversation.",
    accent: "Direct contact",
  },
];

const whoThisIsFor = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    label: "Established retreat centres",
    desc: "Running a venue with recurring programmes and wanting consistent occupancy.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "Independent facilitators",
    desc: "Creating your own retreat programmes and needing a channel to reach the right guests.",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: "Wellness professionals",
    desc: "Coaches, therapists, and healers hosting small transformational immersions.",
  },
];

// Advertising packages (SCOPE-057).
//
// PINNED OFF (Milestone 1, 2026-10-09): prices are NOT approved yet and must
// not appear anywhere on the public site. The `adPackages` array is kept in
// the file for reference only; the render block below is gated to false so
// the section can never appear, regardless of env var values.
const adPackagesVisible = false;

const adPackages = [
  {
    name: "Website Promotion",
    slug: "website-promotion",
    price: "€14.99",
    cadence: "per placement",
    desc: "Featured placement across the directory so seekers see your retreat while they browse.",
  },
  {
    name: "Premium Campaign",
    slug: "premium-campaign",
    price: "€122.22",
    cadence: "full campaign",
    desc: "Website placement plus a dedicated social push — our best value for a full launch.",
    highlighted: true,
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const metadata = {
  title: "For Retreat Owners — Light Path Retreats",
  description:
    "List your retreat with Light Path Retreats and reach pre-qualified seekers who are actively looking for transformational experiences aligned with yours.",
  alternates: { canonical: "/for-retreat-owners" },
};

export default function ForRetreatOwnersPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full border border-forest/20 bg-forest/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-forest">
              For Retreat Owners
            </span>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
              Fill your retreats with the right people
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-stone-600">
              List your retreat on Light Path Retreats and connect with seekers
              who are actively looking for exactly what you offer — matched by
              intention, not just availability.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/retreat-intake-form"
                className="inline-flex h-14 items-center justify-center rounded-xl bg-forest px-10 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#345834] hover:shadow-md"
              >
                List your retreat →
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex h-14 items-center justify-center rounded-xl border border-beige bg-white px-10 text-base font-semibold text-stone-700 transition-all hover:bg-stone-50"
              >
                See how it works
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-beige to-transparent" />
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-800">
            Why list with us
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-stone-500">
            We are not a directory where retreats compete for attention.
            We are a matching platform where your retreat finds the people it
            was made for.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {benefits.map((b) => (
            <div
              key={b.heading}
              className="rounded-2xl border border-beige bg-white p-8 transition-shadow hover:shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-forest/8 text-forest">
                {b.icon}
              </div>
              <h3 className="mb-2 font-semibold text-stone-800">{b.heading}</h3>
              <p className="text-[15px] leading-relaxed text-stone-500">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-800">
              How it works
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-stone-500">
              From submission to first matched guest in four steps.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.number} className="relative rounded-2xl border border-beige bg-white p-6">
                <div className="mb-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-forest/20">
                  {s.number}
                </div>
                <div className="mb-3 inline-block rounded-full bg-forest/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-forest">
                  {s.accent}
                </div>
                <h3 className="mb-2 font-semibold text-stone-800">{s.heading}</h3>
                <p className="text-sm leading-relaxed text-stone-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who this is for ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-800">
            Who this is for
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {whoThisIsFor.map((w) => (
            <div
              key={w.label}
              className="flex gap-4 rounded-2xl border border-beige bg-white p-6"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest/8 text-forest">
                {w.icon}
              </div>
              <div>
                <p className="font-semibold text-stone-800">{w.label}</p>
                <p className="mt-1 text-sm leading-relaxed text-stone-500">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What we need from you ────────────────────────────────────────── */}
      <section className="bg-cream">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-800">
                What you will need to submit
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-stone-500">
                Our intake form is short. Here is roughly what it asks for — no
                writing required for most of it, just tile selections.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Retreat type and setting (select from tiles)",
                  "Duration and group size",
                  "Price range per person",
                  "Retreat title and location",
                  "Dates (or approximate)",
                  "A short description of the experience",
                  "Your name and email for follow-up",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-stone-600">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-forest"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-beige bg-white p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                Also available
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold text-stone-800">
                Need a facilitator for your retreat?
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-stone-500">
                If you have a venue or retreat concept but need the right
                facilitator to lead it, our matching service can connect you
                with practitioners looking for exactly this kind of
                collaboration.
              </p>
              <Link
                href="/facilitator-matching-form"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
              >
                Explore facilitator matching
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <div className="my-6 h-px bg-beige" />

              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-stone-800">
                Building a retreat from scratch?
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-stone-500">
                Our Make Your Retreat module guides you through structuring a
                retreat concept before you list — programme, pricing, and guest
                journey.
              </p>
              <Link
                href="/make-your-retreat"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
              >
                Make Your Retreat
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marketing / sales support (SCOPE-058) ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-warm-brown/25 bg-cream px-8 py-10 sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-warm-brown">
            Owner support
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
            Want help advertising, marketing, or selling your retreat?
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-600">
            Our Make Your Retreat modules cover brand, marketing, and sales —
            €250 per module with guided support. Tell us which area you need
            first.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/make-your-retreat"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-warm-brown px-7 font-semibold text-white hover:bg-warm-brown/90"
            >
              View 12 modules
            </Link>
            <Link
              href="/contact?subject=owner-marketing"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-beige px-7 font-semibold text-forest hover:bg-white"
            >
              Ask our team
            </Link>
          </div>
        </div>
      </section>

      {/* ── Advertising packages (SCOPE-057) ────────────────────────────────
          Published via NEXT_PUBLIC_OWNER_AD_PACKAGES_VISIBLE (.env.public).
          PROVISIONAL pricing (2026-08-09, see #96) — edit `adPackages` to adjust. */}
      {adPackagesVisible && (
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-warm-brown">
              Promote your retreat
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold text-stone-900 sm:text-3xl">
              Give your listing an extra push
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
              Listing is free. When you want more visibility, add a paid
              placement to reach further.
            </p>
            <p className="mt-2 text-xs text-stone-400">
              Pricing shown is provisional and subject to change.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-5 sm:grid-cols-2">
            {adPackages.map((pkg) => (
              <div
                key={pkg.name}
                className={`flex flex-col rounded-3xl border bg-white p-7 ${
                  pkg.highlighted
                    ? "border-warm-brown ring-1 ring-warm-brown"
                    : "border-beige"
                }`}
              >
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900">
                  {pkg.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-3xl font-semibold text-forest">
                    {pkg.price}
                  </span>
                  <span className="text-sm text-stone-500">{pkg.cadence}</span>
                </div>
                <p className="mt-4 flex-1 text-[14px] leading-relaxed text-stone-600">
                  {pkg.desc}
                </p>
                <Link
                  href={`/contact?subject=owner-advertising-${pkg.slug}`}
                  className={`mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl px-5 font-semibold ${
                    pkg.highlighted
                      ? "bg-warm-brown text-white hover:bg-warm-brown/90"
                      : "border border-beige text-forest hover:bg-cream"
                  }`}
                >
                  Get {pkg.name.toLowerCase()}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="rounded-3xl bg-forest px-8 py-16 text-center sm:px-16">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to fill your next retreat?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/75">
            Submission takes 5 minutes. Our team reviews and
            will follow up by email to confirm listing details.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/retreat-intake-form"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-10 text-base font-semibold text-forest shadow-sm transition-all hover:bg-stone-50 hover:shadow-md"
            >
              List your retreat →
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-14 items-center justify-center rounded-xl border border-white/30 px-10 text-base font-semibold text-white transition-all hover:bg-white/10"
            >
              Questions? Contact us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
