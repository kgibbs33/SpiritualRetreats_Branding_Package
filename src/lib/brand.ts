/**
 * Light Path Retreats — single source of truth for brand strings.
 *
 * Every page, component, email template and metadata field imports from here.
 * Never type the brand name directly into a page; change it once here and
 * the whole site follows.
 */
export const BRAND_NAME = "Light Path Retreats";
export const BRAND_MOTTO = "Lighting the way for spiritual retreats worldwide.";
export const BRAND_POSITIONING =
  "The global connection hub for spiritual retreats.";
export const BRAND_MANTRA =
  "Grounded in nature. Guided by spirit. Built for trust.";

/** Brand pillars (ordered as they appear in UI). */
export const PILLARS = [
  {
    slug: "discover",
    label: "DISCOVER",
    audience: "Seekers",
    description:
      "Explore trusted spiritual retreats with clearer information and human guidance designed around who you are.",
  },
  {
    slug: "grow",
    label: "GROW",
    audience: "Retreat Leaders",
    description:
      "Grow a stronger, more visible retreat business through trusted connections and an aligned global community.",
  },
  {
    slug: "connect",
    label: "CONNECT",
    audience: "Facilitators & Venues",
    description:
      "Connect your space or skills with suitable partners and build repeat relationships around meaningful experiences.",
  },
  {
    slug: "learn",
    label: "LEARN",
    audience: "Wider Community",
    description:
      "Stay informed, inspired and part of a growing global movement around spiritual retreats.",
  },
] as const;

// ── Approved copy (verbatim) ────────────────────────────────────────────────

export const SEEKER_HERO_HEADING = "Find the retreat that fits your path";
export const SEEKER_HERO_TEXT =
  "Explore trusted spiritual retreats with clearer information, human guidance and support designed around who you are and what you genuinely need.";
export const SHORT_DESCRIPTION = `${BRAND_NAME} is the global connection hub for spiritual retreats, bringing seekers, retreat leaders, venues and facilitators together through trusted discovery, human matching, professional support and an aligned global community.`;
export const FOR_RETREAT_LEADERS =
  "Grow a stronger, more visible retreat business through trusted connections, professional support and an aligned global community.";
export const FOR_VENUES =
  "Connect your space with suitable retreat organisers and build repeat relationships around meaningful experiences.";
export const FOR_FACILITATORS =
  "Present your gifts professionally and connect with aligned retreats that value your contribution.";

// ── Approved calls to action ────────────────────────────────────────────────

export const CTA = {
  DISCOVER_RETREATS: "Discover Retreats",
  FIND_YOUR_PATH: "Find Your Path",
  JOIN_OUR_COMMUNITY: "Join Our Community",
  PARTNER_WITH_US: "Partner With Us",
  LIST_YOUR_RETREAT: "List Your Retreat",
  GROW_YOUR_RETREAT: "Grow Your Retreat",
  CONNECT_AS_FACILITATOR: "Connect as a Facilitator",
  EXPLORE_VENUES: "Explore Venues",
  SPEAK_WITH_OUR_TEAM: "Speak With Our Team",
} as const;

// ── Logo constants ───────────────────────────────────────────────────────────

/** The emblem (no lettering) is the only safe logo file right now. */
export const EMBLEM_PATH = "/brand/lpr-emblem.png";

/**
 * Expected final lockup files the owner will drop into `public/brand/`
 * when the "LIGHT PATH RETREATS" lettering artwork is delivered:
 *   lpr-logo-horizontal-transparent.png
 *   lpr-logo-primary.png
 *   lpr-wordmark.png
 *   lpr-emblem.png (already present)
 */