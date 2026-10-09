/**
 * App configuration constants.
 * Client-safe values use NEXT_PUBLIC_ env vars.
 */

export const LEGAL_PAGES_VISIBLE =
  process.env.NEXT_PUBLIC_LEGAL_PAGES_VISIBLE === "true";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

/** Primary webhook URL (GHL inbound). FORM_WEBHOOK_URL is already set
 *  in Vercel (Production + Preview). N8N_FORM_SUBMISSION_URL kept as
 *  fallback for backward compatibility. */
export const FORM_WEBHOOK_URL =
  process.env.FORM_WEBHOOK_URL?.trim() ||
  process.env.N8N_FORM_SUBMISSION_URL?.trim() ||
  "";
export const FORM_WEBHOOK_SECRET =
  process.env.FORM_WEBHOOK_SECRET?.trim() ||
  process.env.N8N_WEBHOOK_SECRET?.trim() ||
  "";

/** Legal entity — from env, with Light Path Retreats as default. */
export const LEGAL_ENTITY_NAME =
  process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || "Light Path Retreats";
export const LEGAL_JURISDICTION =
  process.env.NEXT_PUBLIC_LEGAL_JURISDICTION || "";
export const LEGAL_LAST_UPDATED = "February 2026";
