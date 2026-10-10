import { z } from "zod";

export const retreatEnquirySchema = z.object({
  retreatId: z.string().uuid(),
  departureId: z.string().uuid().optional().nullable(),
  kind: z.enum(["enquiry", "booking_request"]),
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(40).optional().nullable(),
  participants: z.coerce.number().int().positive().max(1000).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
  consent: z.literal(true, "Consent is required"),
  company: z.string().max(0).optional(),
});

export type RetreatEnquiryPayload = z.infer<typeof retreatEnquirySchema>;