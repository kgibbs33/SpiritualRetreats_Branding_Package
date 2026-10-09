import type { Metadata } from "next";
import Link from "next/link";
import {
  BRAND_NAME,
  FOR_RETREAT_LEADERS,
  FOR_VENUES,
  FOR_FACILITATORS,
  CTA,
} from "@/lib/brand";

export const metadata: Metadata = {
  title: "Why list with us",
  description: `Why retreat organisers, venues and facilitators list with ${BRAND_NAME}.`,
  alternates: { canonical: "/why-work-with-us" },
};

const reasons = [
  {
    heading: "Visibility that matters",
    body: "Your retreat, venue or practice appears in front of seekers who are actively looking — not passive scrollers.",
  },
  {
    heading: "A professional profile",
    body: "Showcase what makes your offering different. Photos, descriptions, dates, pricing — all in one trusted place.",
  },
  {
    heading: "Enquiries through the platform",
    body: "Seekers contact you directly through your listing. No middleman — you own the relationship.",
  },
  {
    heading: "Qualified reach",
    body: "Every listing is reviewed before it goes live. Seekers trust the quality, which means better enquiries for you.",
  },
];

export default function WhyWorkWithUs() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-warm-cream py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl lg:text-5xl">
              Why list with {BRAND_NAME}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              We are building a trusted global directory where retreat
              organisers, venues and facilitators connect with seekers who are
              ready to book.
            </p>
          </div>
        </div>
      </section>

      {/* For retreat leaders */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy sm:text-3xl">
            {CTA.LIST_YOUR_RETREAT}
          </h2>
          <p className="mt-3 max-w-lg text-base text-stone-600">
            {FOR_RETREAT_LEADERS}
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <div
                key={r.heading}
                className="rounded-2xl border border-sage-mist bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-celestial-navy">
                  {r.heading}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {r.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/retreat-intake-form"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-sacred-gold px-8 text-base font-semibold text-celestial-navy shadow-sm transition-all hover:bg-sacred-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-river-teal focus-visible:ring-offset-2"
            >
              {CTA.LIST_YOUR_RETREAT}
            </Link>
          </div>
        </div>
      </section>

      {/* For venues */}
      <section className="border-t border-sage-mist bg-warm-cream py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy sm:text-3xl">
            {CTA.EXPLORE_VENUES}
          </h2>
          <p className="mt-3 max-w-lg text-base text-stone-600">
            {FOR_VENUES}
          </p>
          <div className="mt-8">
            <Link
              href="/venue-application"
              className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-forest-green bg-white px-8 text-base font-semibold text-forest-green shadow-sm transition-all hover:bg-forest-green hover:text-warm-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-river-teal focus-visible:ring-offset-2"
            >
              List Your Venue
            </Link>
          </div>
        </div>
      </section>

      {/* For facilitators */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy sm:text-3xl">
            {CTA.CONNECT_AS_FACILITATOR}
          </h2>
          <p className="mt-3 max-w-lg text-base text-stone-600">
            {FOR_FACILITATORS}
          </p>
          <div className="mt-8">
            <Link
              href="/facilitator-onboarding"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-forest-green px-8 text-base font-semibold text-warm-cream shadow-sm transition-all hover:bg-forest-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-river-teal focus-visible:ring-offset-2"
            >
              {CTA.CONNECT_AS_FACILITATOR}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}