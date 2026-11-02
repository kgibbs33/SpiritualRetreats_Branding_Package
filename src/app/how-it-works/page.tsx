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
    const dep = SITE_CONFIG.pricing.guest_minimum_deposit_pct;
  const adminFee = SITE_CONFIG.pricing.guest_cancellation_admin_fee_eur;
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
          <h2 className="text-xl font-semibold text-celestial-navy">3. Booking and payment</h2>
          <p className="mt-2 leading-relaxed text-stone-700">
            Your first payment ({dep}% of the retreat price) is taken when you
            book. After the {w}-hour window, your booking details go to the
            Retreat Planner, who contacts you to arrange the remaining balance
            directly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-celestial-navy">
            4. {w}-hour cancellation window
          </h2>
          <p className="mt-2 leading-relaxed text-stone-700">
            You can cancel within {w} hours of booking for a refund of your
            payment, less a &euro;{adminFee} administration fee. After that,
            the Retreat Planner&apos;s own cancellation policy applies, shown
            on each retreat page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-celestial-navy">5. What happens next</h2>
          <p className="mt-2 leading-relaxed text-stone-700">
            After the {w}-hour window, the Retreat Planner confirms your place
            and the retreat&apos;s own policies apply from that point.
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