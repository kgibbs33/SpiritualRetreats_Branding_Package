import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";

import { canonicalUrl } from "@/lib/metadata";
import { BrandImage } from "@/components/ui/BrandImage";
import { IMAGES } from "@/config/images";

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
      <div className="relative -mx-4 -mt-12 h-48 sm:-mx-6 lg:-mx-8"><BrandImage slot={{ ...IMAGES.facilitatorHeader, alt: "A facilitator leading a session" }} fill /></div>
      <section className="text-center mt-8">
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
      <section id="membership" className="mt-16 rounded-2xl border border-sage-mist bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-celestial-navy">
          Join Light Path Retreats and be found by retreat planners
        </h2>
        <p className="mt-3 text-stone-700">
          EUR {m.toFixed(2)} per month, or EUR {a.toFixed(2)} per year (two
          months free). No commission on your bookings. Prices are before any applicable tax. Billing starts after approval, when you pay; your profile goes live once payment is received.
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

      <section className="mt-8 space-y-4 rounded-xl bg-[#f6f5ee] p-6 text-sm leading-6">
        <h2 className="text-xl text-[#104c3b]">Membership details</h2>
        <p>One membership per person. Monthly and yearly plans renew automatically. Give at least 30 full days' notice before either renewal date. Yearly renewals have a reminder at least 45 days before. Membership fees are non-refundable.</p>
        <p>If a payment fails, there are 3 days to pay. Promotion is paused during that period, then the profile is hidden until payment is made. Changes to membership prices require at least 45 days' notice.</p>
        <Link href="/terms/facilitators" className="text-[#104c3b] underline">Read the full Facilitator Terms</Link>
      </section>

      {/* FA-04 Credentials — Stage 2 note */}
      <p className="mt-8 text-xs text-stone-400">
        Facilitator applications are reviewed individually. Checkable experience and an online professional presence are required; qualifications and insurance are required where the role calls for them. Approval is not a guarantee of skill or safety.
      </p>
    </div>
  );
}