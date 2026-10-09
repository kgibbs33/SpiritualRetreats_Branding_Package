import type { Metadata } from "next";
import { VenueApplicationForm } from "@/components/venue/VenueApplicationForm";

export const metadata: Metadata = {
  title: "List Your Venue",
  description:
    "Showcase your property to retreat organisers looking for the right place to host their experience.",
  alternates: { canonical: "/venue-application" },
};

export default function VenueApplicationPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-celestial-navy sm:text-4xl">
        List your venue
      </h1>
      <p className="mt-2 text-stone-600">
        Tell us about your property. We will review your application and get
        back to you about the next steps.
      </p>

      <div className="mt-10">
        <VenueApplicationForm />
      </div>
    </div>
  );
}