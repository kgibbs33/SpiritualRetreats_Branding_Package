import type { Metadata } from "next";
import { VenueApplicationForm } from "@/components/venue/VenueApplicationForm";
import { GhlForm } from "@/components/ui/GhlForm";

export const metadata: Metadata = { title: "List Your Venue" };

export default function VenueApplicationPage() {
  return (
    <GhlForm
      formKey="venueIntake"
      label="List your venue"
      existingForm={<VenueApplicationForm />}
    />
  );
}