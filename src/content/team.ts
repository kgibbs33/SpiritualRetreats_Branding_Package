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
    subheading: "Co-Founder & Head of Experiences & Development",
    bio: "Creating meaningful experiences that inspire connection, growth and transformation.
Gordana is a passionate retreat leader, wellbeing coach, mentor and lifelong explorer who believes that some of life's most meaningful changes begin when we step away from everyday life and reconnect with ourselves.
Having travelled to more than 54 countries, her love for adventure, different cultures and human connection has shaped the way she sees the world. For her, travel is about more than discovering new places. It's about opening our minds, seeing life differently and sometimes rediscovering parts of ourselves we've lost along the way.
With years of experience in coaching, personal development, and event and project management, Gordana understands that a truly memorable retreat goes far beyond beautiful surroundings. It's about genuine connections, new perspectives and experiences that stay with us long after we return home.
At Light Path Retreats, she brings her experience, creativity and passion for people to designing meaningful retreat experiences, supporting Retreat Planners and building a community rooted in authenticity and connection.
A free spirit at heart, Gordana believes life is too precious to be lived on autopilot. She loves inspiring others to embrace who they are, explore new possibilities and find the courage to live life on their own terms.
Above all, she believes that when we reconnect with ourselves, we don't just change our own lives. We change the way we live, lead, love and contribute to the world.",
  },
  {
    name: "Kirtis Gibbs",
    subheading: "CFO / CTO",
    bio: "Bio to be supplied.",
  },
];