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
        Explore submitted retreats and learn how booking is planned to work. Checkout and payments are not live on this preview.
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
            The planned payment rule is a {dep}% retainer for bookings more than 6 weeks ahead with a ticket of EUR 300 or more, unless the planner chooses full payment. Within 6 weeks, below EUR 300, or where the planner chooses it, the full ticket price is due. Guest payments go to the planner’s own Stripe account; any remaining balance is collected directly by the planner.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-celestial-navy">
            4. {w}-hour cancellation window
          </h2>
          <p className="mt-2 leading-relaxed text-stone-700">
            For bookings made more than 6 weeks ahead, the planned {w}-hour cancellation window gives a refund less EUR {adminFee} and the actual card processing costs. After the window the booking payment is non-refundable under the standard policy. Bookings within 6 weeks are non-refundable from booking. A planner may offer a more generous policy at their own cost.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-celestial-navy">5. What happens next</h2>
          <p className="mt-2 leading-relaxed text-stone-700">
            The planner is responsible for delivering the retreat, confirming practical details and collecting any balance. A planner cancellation requires a full guest refund within 14 days under the Retreat Planner Terms.
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