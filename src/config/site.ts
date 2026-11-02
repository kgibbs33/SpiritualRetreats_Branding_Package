/**
 * Site-wide configuration constants.
 * Edit this file to update display text site-wide.
 * Does NOT change database values, API routes, or GHL form_type values.
 */

export const SITE_CONFIG = {
  /** Support email — shown on contact page, error states, legal pages */
  support_email: "connect@lightpathretreats.com",

  /** Phone number (Andrew's, confirmed 23 Oct) — hidden everywhere when empty */
  contact_number: "+49 162 9363732",

  /** Physical address — shown in footer */
  address: "1209 Mountain Road PL NE, Suite R, Albuquerque, NM 87110, USA",

  /** Registered legal entity — used in footer and legal text */
  legal_name: "Light Path Retreats LLC",

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
    guest_minimum_deposit_pct: 20,
    lightpath_fee_pct: 15,
    cancellation_window_hours: 72,
    guest_cancellation_admin_fee_eur: 30,
    facilitator_monthly_eur: 12.22,
    facilitator_annual_eur: 122,
    payment_management_note: "Payment schedule management: coming soon",
    examples: {
      seat_eur: 1000,
      first_payment_eur: 200, // 20% of seat price, taken at booking
      lightpath_fee_eur: 150, // 15% of seat price, from the first payment
      first_payment_remainder_eur: 50, // after card/currency costs are deducted
      remaining_balance_eur: 800, // collected directly by the planner
    },
  },

  /** Legal — placeholder state */
  legal: {
    /** True when legal text has been reviewed and approved */
    text_approved: false,
    label_draft: "Draft: pending team approval",
    last_updated: "2026-10-13",
  },
} as const;

export type SiteConfig = typeof SITE_CONFIG;