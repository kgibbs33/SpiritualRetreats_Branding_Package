/**
 * App configuration constants.
 * Client-safe values use NEXT_PUBLIC_ env vars.
 */

export const LEGAL_PAGES_VISIBLE =
  process.env.NEXT_PUBLIC_LEGAL_PAGES_VISIBLE === "true";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

/** Legal entity — from env, with Light Path Retreats as default. */
export const LEGAL_ENTITY_NAME =
  process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || "Light Path Retreats";
export const LEGAL_JURISDICTION =
  process.env.NEXT_PUBLIC_LEGAL_JURISDICTION || "";
export const LEGAL_LAST_UPDATED = "February 2026";
