import { z } from "zod";

/**
 * Venue application intake — mirrors the retreat submission pattern
 * (zod → API route with guards + honeypot → Supabase insert → team mail →
 * optional n8n webhook).
 */

const RELATIONSHIP_TYPES = ["owner", "manager", "other"] as const;

export const venueSubmissionSchema = z.object({
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

export const venueSubmissionInsertSchema = venueSubmissionSchema.omit({
  company: true,
});

export type VenueSubmissionPayload = z.infer<typeof venueSubmissionSchema>;
export type VenueSubmissionInsertPayload = z.infer<
  typeof venueSubmissionInsertSchema
>;