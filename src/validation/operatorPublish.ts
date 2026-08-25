import { z } from "zod";

export const publishRetreatSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
});

export const publishFacilitatorSchema = z.object({
  onboardingId: z.string().uuid(),
  headline: z.string().trim().max(160).optional().nullable(),
  bio: z.string().trim().max(2000).optional().nullable(),
});

export const createMatchSchema = z.object({
  seekerDiscoveryResponseId: z.string().uuid(),
  retreatId: z.string().uuid(),
  seekerEmail: z.string().trim().email().max(320),
  facilitatorEmail: z.string().trim().email().max(320),
  seekerName: z.string().trim().max(200).optional().nullable(),
  facilitatorName: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
});
