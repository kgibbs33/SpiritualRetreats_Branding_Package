import { z } from "zod";

import { RETREAT_CATEGORY_SLUGS } from "@/lib/retreat-categories";
import { checkListingText } from "@/lib/listing-text-rules";

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
}).superRefine((val, ctx) => {
    const publicFields = [
      { key: "retreatTitle", label: "Retreat Title" },
      { key: "location", label: "Location" },
      { key: "description", label: "Description" },
      { key: "priceRange", label: "Price Range" },
      { key: "facilitatorNotes", label: "Facilitator Notes" },
      { key: "categoryOther", label: "Category Other" },
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

export const retreatSubmissionInsertSchema = retreatSubmissionSchema.omit({
  company: true,
});

export type RetreatSubmissionPayload = z.infer<typeof retreatSubmissionSchema>;
export type RetreatSubmissionInsertPayload = z.infer<typeof retreatSubmissionInsertSchema>;
