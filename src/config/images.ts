/**
 * Named image slots — sites reference these keys, not file paths.
 * When a file is missing, components show a brand-colour gradient fallback.
 * When present, use next/image with the provided alt text.
 *
 * Ownership/licence tracking lives in public/images/CREDITS.md.
 */

export interface ImageSlot {
  /** Path under /public — empty string means "no image supplied yet" */
  src: string;
  alt: string;
}

export const IMAGES = {
  homeHero: { src: "/images/hero-home.jpg", alt: "" },
  typeYoga: { src: "/images/yoga-retreat.jpg", alt: "Yoga retreat" },
  typeMeditation: { src: "/images/meditation-retreat-type.png", alt: "Meditation retreat" },
  typeWellness: { src: "/images/spa-wellness.jpg", alt: "Wellness retreat" },
  typeNature: { src: "/images/nature-immersion.jpg", alt: "Nature retreat" },
  typeBreathwork: { src: "", alt: "Breathwork retreat" },
  typeSoundHealing: { src: "", alt: "Sound healing retreat" },
  typeSomatic: { src: "", alt: "Somatic retreat" },
  typeMindfulness: { src: "/images/mindfulness-retreat.jpg", alt: "Mindfulness retreat" },
  plannersBand: { src: "", alt: "Retreat planners" },
  venueHeader: { src: "", alt: "A retreat venue" },
  facilitatorHeader: { src: "", alt: "A facilitator leading a session" },
  aboutHeader: { src: "/images/hero-nature.jpg", alt: "Nature" },
} satisfies Record<string, ImageSlot>;