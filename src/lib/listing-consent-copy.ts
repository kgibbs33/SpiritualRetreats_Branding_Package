export const CONSENT_VERSION = "2026-11-19-v1";
export const MARKETING_WORDING = "Yes, I'd like first access. Send me members-only offers, such as promotion boosters at a special price, along with news of new venues, facilitators and places to hold retreats. I can unsubscribe whenever I like.";
export const SERVICE_WORDING = "Whatever you choose, we'll always email you about your account, listing, payments and any changes to our prices or terms.";
export const ROLE_TERMS = {
  planner: { label: "Retreat Planner Terms", path: "/terms/retreat-planners", version: "1.0 / 13 November 2026" },
  venue: { label: "Venue Terms", path: "/terms/venues", version: "1.0 / 13 November 2026" },
  facilitator: { label: "Facilitator Terms", path: "/terms/facilitators", version: "1.0 / 16 November 2026" },
} as const;
export type ListingRole = keyof typeof ROLE_TERMS;
export function consentWording(role: ListingRole) {
  return `I have read and agree to the ${ROLE_TERMS[role].label}, and I have read the Privacy Policy.`;
}
