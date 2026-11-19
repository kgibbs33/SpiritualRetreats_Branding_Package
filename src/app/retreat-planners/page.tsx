import type { Metadata } from "next";
import Link from "next/link";
import { PlannerFees } from "@/components/ui/RoleFees";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Retreat Planners",
  alternates: { canonical: canonicalUrl("/retreat-planners") },
};

export default function RetreatPlannersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* RP-01 Hero */}
      <section className="text-center pt-10 pb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl">
          List your retreat with Light Path Retreats.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          List and promote your retreats, and find venues and facilitators. The first 500 listings registered before 31 December 2026 receive Bronze free throughout 2027. Booking commission still applies.
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
          <li>Your retreat can go live after approval, required insurance checks and Stripe connection. Booking is not enabled on this preview.</li>
          <li>When checkout launches, guest payments go to your own Stripe account on Stripe's payout schedule, less commission and card fees.</li>
        </ol>
      </section>

      <PlannerFees />

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



    </div>
  );
}