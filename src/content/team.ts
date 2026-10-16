/**
 * Team section data for /about.
 * Copy is verbatim from the brief (D8). No bios invented.
 */

export interface TeamMember {
  /** Display name (used in heading + subheading references) */
  name: string;
  /** Role / subheading line */
  subheading: string;
  /** Bio text — supports `{name}` interpolation */
  bio: string;
  /** Optional headshot. Not supplied yet. */
  imagePath?: string;
}

/** Display name for Vanessa Mendoza. */
const VANESSA_NAME = "Vanessa Mendoza";

export const TEAM: TeamMember[] = [
  {
    name: "Andrew A. Porteous",
    subheading: "Chief Strategy Officer",
    bio: "Andrew A. Porteous is a financial educator, personal development coach and architect of The Alchemist Path, with over 20 years of experience in personal and spiritual transformation. His enlightening vision quest in Corumbá, Brazil, in 2015 strengthened his belief that the world needs more spiritual retreats and meaningful human connection beyond our everyday environments. Through Light Path Retreats, Andrew seeks to create transformative experiences that people can bring back into their homes, relationships and workplaces. His vision is to inspire lasting change in thoughts, behaviours, beliefs, values and identity, empowering individuals to align with their higher purpose and their highest possible timeline.",
  },
  {
    name: VANESSA_NAME,
    subheading: "Executive Assistant | Light Path Retreats",
    bio: `${VANESSA_NAME} is the Executive Assistant to Andrew Porteous, supporting the organisation, communication and daily operations of Light Path Retreats. She helps connect people, coordinate activities and ensure that retreat initiatives run smoothly and professionally. ${VANESSA_NAME} is committed to supporting meaningful experiences that encourage human connection, personal growth and spiritual transformation.`,
  },
  // Titles pending team sign-off; edit here only.
  {
    name: "Gordana Ross",
    subheading: "CPO / CMO",
    bio: "Bio to be supplied.",
  },
  {
    name: "Kirtis Gibbs",
    subheading: "CFO / CTO",
    bio: "Bio to be supplied.",
  },
];