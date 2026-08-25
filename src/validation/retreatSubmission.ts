import { z } from "zod";

import { RETREAT_CATEGORY_SLUGS } from "@/lib/retreat-categories";

const categorySlugTuple = RETREAT_CATEGORY_SLUGS as unknown as [
  string,
  ...string[],
];

const RETREAT_ENVIRONMENTS = [
  "mountains", "ocean", "jungle", "desert", "sacred", "country", "anywhere",
] as const;

const RETREAT_DURATIONS = [
  "weekend", "week", "twoweeks", "month", "flexible",
] as const;

const OWNER_TYPES = ["venue_only", "program_operator"] as const;

export const retreatSubmissionSchema = z.object({
  contactName:      z.string().min(1, "Name is required").max(120),
  email:            z.string().email("Invalid email address"),
  retreatTitle:     z.string().min(1, "Retreat title is required").max(200),
  location:         z.string().max(500).optional().nullable(),
  startDate:        z.string().max(32).optional().nullable(),
  endDate:          z.string().max(32).optional().nullable(),
  description:      z.string().max(8000).optional().nullable(),
  capacity:         z.coerce.number().int().positive().max(100000).optional().nullable(),
  priceRange:       z.string().max(200).optional().nullable(),
  facilitatorNotes: z.string().max(4000).optional().nullable(),

  ownerType:        z.enum(OWNER_TYPES).optional().nullable(),
  category:         z.array(z.enum(categorySlugTuple)).default([]),
  categoryOther:    z.string().max(300).optional().nullable(),
  environment:      z.enum(RETREAT_ENVIRONMENTS).optional().nullable(),
  duration:         z.enum(RETREAT_DURATIONS).optional().nullable(),

  company:          z.string().max(0).optional(),
});

export const retreatSubmissionInsertSchema = retreatSubmissionSchema.omit({
  company: true,
});

export type RetreatSubmissionPayload = z.infer<typeof retreatSubmissionSchema>;
export type RetreatSubmissionInsertPayload = z.infer<typeof retreatSubmissionInsertSchema>;
