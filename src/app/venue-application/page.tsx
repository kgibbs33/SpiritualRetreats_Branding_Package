import type { Metadata } from "next";
import { VenueApplicationForm } from "@/components/venue/VenueApplicationForm";
import { GhlForm } from "@/components/ui/GhlForm";

export const metadata: Metadata = { title: "List Your Venue", alternates: { canonical: "/venue-application" } };

export default function VenueApplicationPage() {
  return (
    <GhlForm
      formKey="venueIntake"
      label="List your venue"
      existingForm={<><h1 className="mx-auto max-w-2xl px-4 pt-12 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-800 sm:px-6 lg:px-8">List your venue</h1><VenueApplicationForm /></>}
    />
  );
}