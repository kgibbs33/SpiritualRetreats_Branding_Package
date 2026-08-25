import { z } from "zod";

const TEXT = 4000;

export const seekerSevenAnswersSchema = z.object({
  mainIntention: z.string().min(1, "Please answer this question").max(TEXT),
  relaxationHealingTransform: z
    .string()
    .min(1, "Please answer this question")
    .max(TEXT),
  groupOrPrivate: z.string().min(1, "Please answer this question").max(TEXT),
  locationInspiration: z.string().min(1, "Please answer this question").max(TEXT),
  duration: z.string().min(1, "Please answer this question").max(TEXT),
  // SCOPE-050: multi-select stored as a proper array (not a delimited string).
  practices: z.array(z.string().max(120)).min(1, "Please answer this question").max(20),
  budget: z.string().min(1, "Please answer this question").max(TEXT),
});

export const seekerDiscoverySchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120),
  email: z.string().email("Invalid email address"),
  phoneWhatsapp: z.string().max(80).optional().nullable(),
  travelDates: z.string().max(500).optional().nullable(),
  travelDatesFlexible: z.boolean().optional().default(false),
  destinationRegion: z.string().max(500).optional().nullable(),
  budgetRange: z.string().max(120).optional().nullable(),
  purpose: z.string().max(2000).optional().nullable(),
  answers: seekerSevenAnswersSchema,
  reflectionIntention: z.string().max(TEXT).optional().nullable(),
  reflectionGreatRetreat: z.string().max(TEXT).optional().nullable(),
  reflectionSpecialRequests: z.string().max(TEXT).optional().nullable(),
  idempotencyKey: z.string().min(8).max(128).optional().nullable(),
  /** Honeypot — must be empty. */
  company: z.string().max(0).optional(),
});

/** After honeypot validated; use for Supabase insert + side effects. */
export const seekerDiscoveryInsertSchema = seekerDiscoverySchema.omit({
  company: true,
});

export type SeekerDiscoveryPayload = z.infer<typeof seekerDiscoverySchema>;
export type SeekerDiscoveryInsertPayload = z.infer<
  typeof seekerDiscoveryInsertSchema
>;
