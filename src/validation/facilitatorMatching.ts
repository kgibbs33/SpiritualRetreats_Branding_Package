import { z } from "zod";

import { PRACTICE_AREAS } from "@/lib/facilitators/practice-areas";

const SESSION_FORMATS = ["group", "one-to-one", "both"] as const;
const EXPERIENCE_OPTIONS = ["lt2", "2to5", "5to10", "gt10"] as const;
const DURATION_OPTIONS = ["day", "weekend", "week", "twoweeks", "flexible"] as const;
const SETTING_OPTIONS = ["jungle", "ocean", "mountains", "desert", "countryside", "any"] as const;
const GROUP_SIZE_OPTIONS = ["intimate", "small", "medium", "large"] as const;
const COMPENSATION_OPTIONS = ["revenue-share", "day-rate", "volunteer", "open"] as const;

export const facilitatorMatchingSchema = z.object({
  fullName:              z.string().trim().min(1, "Name is required").max(200),
  email:                 z.string().trim().email("Valid email required").max(320),
  phone:                 z.string().trim().max(80).optional().nullable(),

  practiceAreas:         z.array(z.enum(PRACTICE_AREAS)).min(1, "Select at least one practice area"),
  sessionFormat:         z.enum(SESSION_FORMATS).optional().nullable(),
  experienceYears:       z.enum(EXPERIENCE_OPTIONS).optional().nullable(),

  retreatDurationPref:   z.array(z.enum(DURATION_OPTIONS)).default([]),
  settingPreference:     z.array(z.enum(SETTING_OPTIONS)).default([]),
  groupSizePreference:   z.enum(GROUP_SIZE_OPTIONS).optional().nullable(),
  regionPreference:      z.string().trim().max(300).optional().nullable(),

  availabilityNotes:     z.string().trim().max(1000).optional().nullable(),
  compensationPreference: z.enum(COMPENSATION_OPTIONS).optional().nullable(),

  lookingFor:            z.string().trim().max(2000).optional().nullable(),
  hourlyRateCents:       z.coerce.number().int().min(0).max(10_000_000).optional().nullable(),
  dailyRateCents:        z.coerce.number().int().min(0).max(50_000_000).optional().nullable(),
  promotionConsent:      z.boolean().optional().default(false),
  openToWork:            z.boolean().optional().default(true),
  linkedinUrl:           z.string().trim().max(500).optional().nullable(),
  socialUrls:            z.array(z.string().trim().max(500)).max(8).optional().default([]),

  bio:                   z.string().trim().max(3000).optional().nullable(),
  specialRequests:       z.string().trim().max(2000).optional().nullable(),

  company:               z.string().max(0).optional(),
});

export type FacilitatorMatchingInput = z.infer<typeof facilitatorMatchingSchema>;
