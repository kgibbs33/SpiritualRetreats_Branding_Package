/**
 * App configuration constants.
 * Client-safe values use NEXT_PUBLIC_ env vars.
 */

export const LEGAL_PAGES_VISIBLE =
  process.env.NEXT_PUBLIC_LEGAL_PAGES_VISIBLE === "true";

// Confirmed by Andrew, 18 Jun 2026: grow@ is primary; service@ is the fallback if grow@ is unworkable.
export const CONTACT_EMAIL = "grow@retreatyourself.network";

export const N8N_FORM_SUBMISSION_URL =
  process.env.N8N_FORM_SUBMISSION_URL || "";
export const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || "";

// Legal entity details, shared across privacy/terms/cookies (LegalLayout) and
// any other page that needs to name the operating entity. Single source so a
// future change (rebrand, entity change) only needs editing here.
export const LEGAL_ENTITY_NAME = "Landaus Mann Investments Ltd";
export const LEGAL_JURISDICTION = "Vanuatu";
// Matches when the legal page content was actually written (git history,
// feat(M1) commit) — was previously hardcoded as the wrong year (Feb 2025)
// independently on all three legal pages.
export const LEGAL_LAST_UPDATED = "February 2026";
