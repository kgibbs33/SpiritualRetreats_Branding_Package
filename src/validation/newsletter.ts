import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
  /** Honeypot — must be empty. */
  company: z.string().max(0).optional(),
});
