import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "How It Works",
  alternates: { canonical: canonicalUrl("/how-it-works") },
};

export default function HowItWorksPage() {
  const w = SITE_CONFIG.pricing.cancellation_window_hours;
  const fee = SITE_CONFIG.pricing.lightpath_fee_pct;
  const dep = SITE_CONFIG.pricing.guest_minimum_deposit_pct;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl">
        How it works
      </h1>
      <p className="mt-4 text-lg text-stone-600">
        Find a retreat, book your place, and pay a deposit. The rest is handled
        safely.
      </p>

      <section className="mt-12 space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-celestial-navy">1. Search</h2>
          <p className="mt-2 leading-relaxed text-stone-700">
            Browse retreats by destination, date, type and budget. Every listing
            describes what is included, the dates available and the price.
            Details are provided by the retreat planner.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-celestial-navy">2. Book your place</h2>
          <p className="mt-2 leading-relaxed text-stone-700">
            Request a place on the retreat that fits. Our team confirms
            availability with the planner before anything is finalised.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-celestial-navy">3. Pay your deposit</h2>
          <p className="mt-2 leading-relaxed text-stone-700">
            A deposit of {dep}% secures your place. Card payments are not live
            on the site yet — we will tell you exactly how to pay when booking
            opens.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-celestial-navy">
            4. {w}-hour cancellation window
          </h2>
          <p className="mt-2 leading-relaxed text-stone-700">
            You can cancel free of charge within {w} hours of booking. After
            that, the planner&apos;s own cancellation policy applies — shown
            clearly on each retreat page.
          </p>
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Placeholder pending legal review: the {fee}% Light Path fee becomes
            non-refundable after the {w}-hour window.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-celestial-navy">5. The planner is paid</h2>
          <p className="mt-2 leading-relaxed text-stone-700">
            Your payments go to the retreat planner after the {w}-hour
            cancellation window has passed.
          </p>
        </div>
      </section>

      <p className="mt-10 text-sm text-stone-500">
        No payments are being taken on this website yet. Booking and checkout
        are coming soon.
      </p>

      <div className="mt-10">
        <Link
          href="/#search"
          className="inline-flex h-12 items-center rounded-xl bg-sacred-gold px-6 text-sm font-semibold text-celestial-navy"
        >
          Find your retreat
        </Link>
      </div>
    </div>
  );
}