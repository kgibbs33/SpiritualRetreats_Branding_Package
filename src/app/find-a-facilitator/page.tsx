import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import { MarketingPackages } from "@/components/ui/MarketingPackages";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Find a Facilitator",
  alternates: { canonical: canonicalUrl("/find-a-facilitator") },
};

export default function FindAFacilitatorPage() {
  const m = SITE_CONFIG.pricing.facilitator_monthly_eur;
  const a = SITE_CONFIG.pricing.facilitator_annual_eur;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* FA-01 Hero */}
      <section className="text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl">
          Find the right facilitator for your retreat.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          Browse facilitators, then send an inquiry. Facilitators, join below.
        </p>
      </section>

      {/* FA-02 Empty state */}
      <section className="mt-12 rounded-2xl border border-sage-mist bg-warm-cream p-8 text-center">
        <p className="text-stone-700">
          Facilitators are joining now. Register your interest and we will let
          you know when profiles go live.
        </p>
        <p className="mt-4 text-sm text-stone-500">
          Inquiries go through our contact form. Direct contact details are
          never shown on facilitator profiles.
        </p>
      </section>

      {/* FA-03 Membership */}
      <section id="membership" className="mt-16 rounded-2xl border border-sage-mist bg-white p-6">
        <h2 className="text-2xl font-semibold text-celestial-navy">
          Join Light Path Retreats and be found by retreat planners
        </h2>
        <p className="mt-3 text-stone-700">
          EUR {m.toFixed(2)} per month, or EUR {a.toFixed(0)} per year (two
          months free). No commission on your bookings. Membership starts from
          day one.
        </p>
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Membership payment is not live yet. Sign-up uses our onboarding form.
        </p>
        <Link
          href="/facilitator-onboarding"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-sacred-gold px-6 text-sm font-semibold text-celestial-navy"
        >
          Join as a facilitator
        </Link>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-celestial-navy">Marketing packages</h2>
        <MarketingPackages />
      </section>

      {/* FA-04 Credentials — Stage 2 note */}
      <p className="mt-8 text-xs text-stone-400">
        Qualifications are provided by the facilitator, not verified by us.
        Document upload is coming soon.
      </p>
    </div>
  );
}