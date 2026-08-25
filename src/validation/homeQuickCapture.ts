import { z } from "zod";

export const homeQuickCaptureSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email address"),
  phoneWhatsapp: z.string().max(80).optional().nullable(),
  travelDates: z.string().max(500).optional().nullable(),
  destinationRegion: z.string().max(500).optional().nullable(),
  budgetRange: z.string().max(120).optional().nullable(),
  purpose: z.string().max(2000).optional().nullable(),
  company: z.string().max(0).optional(),
});

export const homeQuickCaptureInsertSchema = homeQuickCaptureSchema.omit({
  company: true,
});

export type HomeQuickCapturePayload = z.infer<typeof homeQuickCaptureSchema>;
