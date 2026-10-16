/**
 * Site-wide configuration constants.
 * Edit this file to update display text site-wide.
 * Does NOT change database values, API routes, or GHL form_type values.
 */

export const SITE_CONFIG = {
  /** Support email — shown on contact page, error states, legal pages */
  support_email: "connect@lightpathretreats.com",

  /** Phone number — hidden everywhere when empty */
  contact_number: "",

  /** Physical address — shown in footer */
  address: "1954 Airport Road, Suite 1338, Atlanta, GA 30341, USA",

  /** Tagline — used under logo in footer and in site metadata */
  tagline: "Lighting the way to spiritual retreats worldwide.",

  /** Canonical domain */
  canonical: "https://lightpathretreats.com",

  /** Social links — icon hidden when href is empty */
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
  },

  /** Pricing — display values (pricing logic is NOT here) */
  pricing: {
    guest_minimum_deposit_pct: 20, // D1 override: brief said 25%, team decided 20%
    lightpath_fee_pct: 15,
    cancellation_window_hours: 72,
    facilitator_monthly_eur: 12.22,
    facilitator_annual_eur: 122,
    payment_management_note: "Payment schedule management: coming soon",
  },

  /** Legal — placeholder state */
  legal: {
    /** True when legal text has been reviewed and approved */
    text_approved: false,
    label_draft: "Draft: pending legal review",
    last_updated: "2026-10-13",
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;