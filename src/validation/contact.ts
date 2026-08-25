import { z } from "zod";

const MESSAGE_MAX_LENGTH = 2000;

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.enum(["general", "partnership", "other"]).optional(),
  message: z
    .string()
    .min(1, "Message is required")
    .max(MESSAGE_MAX_LENGTH, `Message must be ${MESSAGE_MAX_LENGTH} characters or less`),
  /** Honeypot — must be empty (bots often fill hidden fields). */
  company: z.string().max(0).optional(),
});

/** Payload after honeypot validated (Zod v4 `omit`); use for DB insert / mail. */
export const contactInsertSchema = contactSchema.omit({ company: true });

export type ContactFormData = z.infer<typeof contactSchema>;
export type ContactInsertPayload = z.infer<typeof contactInsertSchema>;
