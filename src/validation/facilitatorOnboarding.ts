import { z } from "zod";

import { PRACTICE_AREAS } from "@/lib/facilitators/practice-areas";

/**
 * Optional outbound profile URL. Coerces a scheme-less entry ("linkedin.com/in/x")
 * to https, treats blank as absent, and restricts the protocol to http(s) so
 * `javascript:` / `data:` URLs can never be stored and later rendered as a link.
 * Pass `hostname` to constrain the domain (e.g. LinkedIn / Instagram).
 */
const optionalProfileUrl = (hostname?: RegExp) =>
  z.preprocess(
    (v) => {
      if (typeof v !== "string") return v ?? undefined;
      const t = v.trim();
      if (t === "") return undefined;
      return /^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : `https://${t}`;
    },
    z
      .url({ protocol: /^https?$/, ...(hostname ? { hostname } : {}) })
      .max(500)
      .optional()
      .nullable()
  );

/**
 * SCOPE-030: a referral/recommendation contact. Third-party personal data, so
 * the facilitator must separately confirm consent (see the schema refine).
 */
const referralSchema = z.object({
  name: z.string().trim().min(1, "Referee name is required").max(200),
  email: z.email("Valid referee email required").max(320),
  relationship: z.string().trim().max(200).optional().nullable(),
});

export const facilitatorOnboardingSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Valid email required").max(320),
  phone: z.string().trim().max(80).optional().nullable(),
  /** SCOPE-027: coarse, GDPR-minimal location (no street address). All optional. */
  city: z.string().trim().max(120).optional().nullable(),
  region: z.string().trim().max(120).optional().nullable(),
  country: z.string().trim().max(120).optional().nullable(),
  /** SCOPE-029: optional outbound profile links (http(s); host-checked where applicable). */
  websiteUrl: optionalProfileUrl(),
  linkedinUrl: optionalProfileUrl(/(^|\.)linkedin\.com$/i),
  instagramUrl: optionalProfileUrl(/(^|\.)instagram\.com$/i),
  /** SCOPE-031: structured multi-select skills (shared taxonomy with the matching form). */
  practiceAreas: z.array(z.enum(PRACTICE_AREAS)).max(10).optional().default([]),
  practiceFocus: z.string().trim().max(500).optional().nullable(),
  credentials: z.string().trim().max(2000).optional().nullable(),
  message: z.string().trim().max(4000).optional().nullable(),
  /** Object path returned by /api/facilitator-photo; constrained to our exact shape. */
  photoPath: z
    .string()
    .trim()
    .regex(
      /^facilitators\/[0-9a-f-]{36}\.(jpg|png|webp)$/,
      "Invalid photo reference"
    )
    .optional()
    .nullable(),
  /** Object path returned by /api/facilitator-cv; constrained to our exact shape. */
  cvPath: z
    .string()
    .trim()
    .regex(/^facilitators\/cv\/[0-9a-f-]{36}\.pdf$/, "Invalid CV reference")
    .optional()
    .nullable(),
  /** SCOPE-030: up to 2 referee contacts (third-party data; needs consent below). */
  referrals: z.array(referralSchema).max(2).optional().nullable(),
  /** SCOPE-030: facilitator confirms they have the referees' permission. */
  referralConsent: z.boolean().optional().default(false),
  /** Honeypot — must be empty. */
  company: z.string().max(0).optional(),
}).refine((d) => !(d.referrals && d.referrals.length > 0) || d.referralConsent, {
  message: "Please confirm you have permission to share these contacts.",
  path: ["referralConsent"],
});

export type FacilitatorOnboardingInput = z.infer<
  typeof facilitatorOnboardingSchema
>;
