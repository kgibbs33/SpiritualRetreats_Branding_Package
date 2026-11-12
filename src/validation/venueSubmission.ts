import { z } from "zod";
import { checkListingText } from "@/lib/listing-text-rules";

const RELATIONSHIP_TYPES = ["owner", "manager", "other"] as const;

/** Base schema — no refinement (Zod 4 forbids .omit() on refined schemas). */
const venueSubmissionBase = z.object({
  contactName: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(40).optional().nullable(),

  venueName: z.string().min(1, "Venue name is required").max(200),
  relationship: z.enum(RELATIONSHIP_TYPES).optional().nullable(),
  website: z.string().max(500).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  location: z.string().max(500).optional().nullable(),

  capacity: z.coerce.number().int().positive().max(100000).optional().nullable(),
  bedrooms: z.coerce.number().int().positive().max(10000).optional().nullable(),

  practiceSpace: z.boolean().optional().nullable(),
  practiceSpaceDetails: z.string().max(4000).optional().nullable(),
  catering: z.string().max(1000).optional().nullable(),
  exclusiveUse: z.boolean().optional().nullable(),
  facilities: z.string().max(4000).optional().nullable(),
  suitableRetreatTypes: z.string().max(2000).optional().nullable(),
  accessNotes: z.string().max(2000).optional().nullable(),
  priceRange: z.string().max(200).optional().nullable(),
  minimumStay: z.string().max(200).optional().nullable(),
  description: z.string().max(8000).optional().nullable(),

  consent: z.literal(true, "Consent is required"),

  // Honeypot — bots fill this; humans never see it.
  company: z.string().max(0).optional(),
});

export const venueSubmissionSchema = venueSubmissionBase.superRefine((val, ctx) => {
    const publicFields = [
      { key: "venueName", label: "Venue Name" },
      { key: "location", label: "Location" },
      { key: "description", label: "Description" },
      { key: "practiceSpaceDetails", label: "Practice Space Details" },
      { key: "facilities", label: "Facilities" },
      { key: "suitableRetreatTypes", label: "Suitable Retreat Types" },
      { key: "accessNotes", label: "Access Notes" },
      { key: "catering", label: "Catering" },
    ] as const;
    for (const f of publicFields) {
      const v = (val as Record<string, unknown>)[f.key] as string | null | undefined;
      if (!v) continue;
      const hit = checkListingText(v);
      if (hit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [f.key],
          message: `Please remove websites, email addresses, phone numbers or social links from this field. Add photos and describe the venue in words instead. (Found: ${hit.excerpt})`,
        });
      }
    }
  });

// Omit from UNREFINED base — Zod 4 forbids .omit() on schemas with refinements.
export const venueSubmissionInsertSchema = venueSubmissionBase.omit({
  company: true,
});

export type VenueSubmissionPayload = z.infer<typeof venueSubmissionSchema>;
export type VenueSubmissionInsertPayload = z.infer<typeof venueSubmissionInsertSchema>;