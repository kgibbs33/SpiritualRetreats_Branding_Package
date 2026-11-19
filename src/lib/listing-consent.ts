import { randomUUID } from "node:crypto";
import hashes from "@/content/legal/consent-hashes.json";
import { z } from "zod";
import { CONSENT_VERSION, MARKETING_WORDING, ROLE_TERMS, SERVICE_WORDING, consentWording, type ListingRole } from "./listing-consent-copy";
import { createAdminClient } from "./supabase/admin";

export const listingConsentSchema = z.object({
  termsAccepted: z.literal(true, "Please agree to the terms and read the Privacy Policy."),
  marketingOptIn: z.boolean().optional().default(false),
});

/** Persist before the submission. Failure stops the signup; a failed signup may
 * leave an audit event, never a successful signup without recorded consent.
 * No email, IP, or user agent is copied into the consent payload. */
export async function recordListingConsent(supabase: ReturnType<typeof createAdminClient>, role: ListingRole, body: unknown) {
  const consent = listingConsentSchema.parse(body);
  const id = randomUUID();
  const recordedAt = new Date().toISOString();
  const terms = ROLE_TERMS[role];
  const documentFile = {planner:"retreat-planners",venue:"venues",facilitator:"facilitators"}[role];
  const termsHash = hashes[documentFile as keyof typeof hashes];
  const privacyHash = hashes.privacy;
  const entityType = {planner:"retreat_submission", venue:"venue_submission", facilitator:"facilitator_onboarding_response"}[role];
  const { error } = await supabase.from("events").insert({
    event_type: "listing_consent_recorded", entity_type: entityType, entity_id: id,
    created_at: recordedAt,
    payload: {
      role, wording_version: CONSENT_VERSION, recorded_at: recordedAt,
      terms_accepted: true, terms_accepted_at: recordedAt, terms_path: terms.path,
      terms_version: terms.version, terms_sha256: termsHash, terms_wording: consentWording(role),
      privacy_read: true, privacy_path: "/privacy", privacy_sha256: privacyHash,
      marketing_opt_in: consent.marketingOptIn, marketing_choice_at: recordedAt,
      marketing_wording: MARKETING_WORDING, service_email_notice: SERVICE_WORDING,
    },
  });
  if (error) throw new Error("Could not save consent. Please try again.");
  return id;
}
