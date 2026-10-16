import type { Metadata } from "next";
import Link from "next/link";
import { canonicalUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Find a Venue",
  alternates: { canonical: canonicalUrl("/find-a-venue") },
};

const GUIDELINES = [
  "Around four or more bedrooms (or several properties bookable together)",
  "An indoor group room and outdoor space",
  "A usable kitchen or catering (hotels welcome)",
  "Willingness to host group retreats",
  "A website, photos and accurate details",
  "Any permits and insurance needed",
];

export default function FindAVenuePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* V-01 Hero */}
      <section className="text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl">
          Find the right venue for your retreat.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-600">
          Browse approved venues, then send an inquiry. Venues, list your space
          below.
        </p>
      </section>

      {/* V-02 Empty state */}
      <section className="mt-12 rounded-2xl border border-sage-mist bg-warm-cream p-8 text-center">
        <p className="text-stone-700">
          Venues are being added now. Register your interest and we will let
          you know when new venues go live.
        </p>
        <Link
          href="/find-a-venue#list"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-sacred-gold px-6 text-sm font-semibold text-celestial-navy"
        >
          Register your interest
        </Link>
        <p className="mt-4 text-sm text-stone-500">
          Inquiries go through our contact form. Direct contact details are
          never shown on venue pages.
        </p>
      </section>

      {/* V-03 List your venue */}
      <section id="list" className="mt-16 rounded-2xl border border-sage-mist bg-white p-6">
        <h2 className="text-2xl font-semibold text-celestial-navy">
          List your venue
        </h2>
        <p className="mt-3 text-stone-700">
          List your venue and be found by retreat planners. The first 100
          approved venues registering before the end of 2026 list free
          throughout 2027. When a retreat is booked from an inquiry on this
          site, Light Path Retreats takes a 15% commission.
        </p>
        <Link
          href="/venue-application"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-sacred-gold px-6 text-sm font-semibold text-celestial-navy"
        >
          Apply to list your venue
        </Link>
      </section>

      {/* V-04 Approval criteria */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-celestial-navy">Our listing guidelines</h2>
        <p className="mt-3 text-sm text-stone-500 italic">Draft — criteria to be finalised by the team.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-stone-700">
          {GUIDELINES.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        <p className="mt-3 text-stone-700">Holiday homes are not accepted.</p>
        <p className="mt-3 text-stone-700">
          Process: application, review against the guidelines, decision.
        </p>
      </section>

      {/* V-05 Wording rule */}
      <section className="mt-8 rounded-xl border border-sage-mist bg-sage-mist/40 p-4 text-sm text-forest-green">
        &ldquo;Approved&rdquo; means the venue meets our listing guidelines based
        on the information provided. We have not inspected it. Details are
        provided by the venue owner.
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold text-celestial-navy">Marketing packages</h2>
        <MarketingPackages />
      </section>

      {/* V-07 Reviews — hidden Stage 2 */}
      <p className="mt-8 text-xs text-stone-400">
        Venue reviews from retreat planners who have booked are coming soon.
      </p>
    </div>
  );
}