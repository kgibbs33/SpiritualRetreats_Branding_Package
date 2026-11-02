import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import { MarketingPackages } from "@/components/ui/MarketingPackages";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Retreat Planners",
  alternates: { canonical: canonicalUrl("/retreat-planners") },
};

export default function RetreatPlannersPage() {
  const p = SITE_CONFIG.pricing;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* RP-01 Hero */}
      <section className="text-center pt-10 pb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl">
          List your retreat with Light Path Retreats.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          List, promote and fill your retreats, and find venues and facilitators. Free to list for 2027 when you register before the end of
          2026.
        </p>
        <Link
          href="/retreat-intake-form"
          className="mt-8 inline-flex h-12 items-center rounded-xl bg-sacred-gold px-8 text-sm font-semibold text-celestial-navy shadow-md transition-all hover:bg-sacred-gold/90 hover:scale-[1.02]"
        >
          Register your retreat
        </Link>
      </section>

      {/* RP-02 Why list */}
      <section className="mt-16 rounded-2xl border border-sage-mist bg-warm-cream/50 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-celestial-navy">Why list</h2>
        <ul className="mt-4 space-y-2 text-stone-700">
          <li>Be found by guests searching for retreats.</li>
          <li>A simple listing page for each retreat.</li>
                    <li>Find venues and facilitators for your retreat in the same place.</li>
        </ul>
      </section>

      {/* RP-03 How it works */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-celestial-navy">How it works</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-stone-700">
          <li>Register your retreat.</li>
          <li>We review your listing against our guidelines.</li>
          <li>Your retreat goes live and guests can book.</li>
          <li>You are paid after the {p.cancellation_window_hours}-hour cancellation window.</li>
        </ol>
      </section>

      {/* RP-04 Fees */}
      <section className="mt-16 rounded-2xl border border-sage-mist bg-warm-cream p-6">
        <h2 className="text-2xl font-semibold text-celestial-navy">Fees</h2>
        <p className="mt-3 text-stone-700">
          Planners set their own deposit, with a minimum of 20%.
        </p>
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          The 15% fee is non-refundable once the 72-hour window has passed,
          including if you later cancel the retreat. We expect Retreat Planners
          to hold suitable insurance for cancellations and related losses.
        </p>
        <p className="mt-2 text-xs text-stone-500">
          Draft wording. The full terms are in the{" "}
          <Link href="/terms" className="text-link underline">
            Partner Terms
          </Link>
          .
        </p>
        <p className="mt-3 text-stone-700">
          Free to list for 2027 when you register before the end of 2026. When a
          guest books, Light Path Retreats takes {p.lightpath_fee_pct}% of the
          ticket price from the first payment. You receive the rest, less card
          fees, once the {p.cancellation_window_hours}-hour cancellation window
          has passed.
        </p>

        <p className="mt-4 text-sm font-semibold text-celestial-navy">
          Illustrative example, final figures confirmed in the Partner Terms:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
          <li>Retreat seat: &euro;{p.examples.seat_eur.toLocaleString()}.</li>
          <li>Guest pays the first payment: {p.guest_minimum_deposit_pct}% = &euro;{p.examples.first_payment_eur.toLocaleString()} (through Light Path Retreats).</li>
          <li>Light Path Retreats fee: {p.lightpath_fee_pct}% of the seat price = &euro;{p.examples.lightpath_fee_eur.toLocaleString()}, taken from that first payment.</li>
          <li>Remaining &euro;{p.examples.first_payment_remainder_eur.toLocaleString()} in the first payment: card and currency-conversion costs are deducted from this; you receive what is left.</li>
          <li>You collect the remaining balance, &euro;{p.examples.remaining_balance_eur.toLocaleString()}, directly from the guest.</li>
        </ul>
        <p className="mt-2 text-sm text-stone-500">Card and currency costs vary.</p>
      </section>

      {/* RP-06 Who it's for */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-celestial-navy">Who it&apos;s for</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["First-time planners", "Guidance to get your first retreat listed."],
            ["Experienced leaders", "A bigger audience and easier bookings."],
            ["Teachers and organisations", "One place for retreats, venues and facilitators."],
          ].map(([t, d]) => (
            <div key={t} className="rounded-2xl border border-sage-mist bg-white p-5">
              <h3 className="font-semibold text-celestial-navy">{t}</h3>
              <p className="mt-2 text-sm text-stone-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RP-07 Also available */}
      <section className="mt-16 flex flex-wrap items-center gap-4">
        <Link href="/find-a-venue" className="text-link">Find a venue</Link>
        <Link href="/find-a-facilitator" className="text-link">Find a facilitator</Link>
        <Link href="/education" className="text-link">Education</Link>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-celestial-navy">Marketing packages</h2>
        <MarketingPackages />
      </section>

    </div>
  );
}