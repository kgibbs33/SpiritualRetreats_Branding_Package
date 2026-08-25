/**
 * Retreat category SSOT — stakeholder list (25 types, WhatsApp 29 May 2026).
 * Common types first in UI; legacy slugs retained for existing DB rows.
 */

export type RetreatCategorySlug =
  | "yoga"
  | "meditation"
  | "silent"
  | "breathwork"
  | "wellness"
  | "sound_healing"
  | "somatic"
  | "plant"
  | "sound"
  | "plant_medicine_integration"
  | "shamanic_healing"
  | "spiritual"
  | "spiritual_awakening"
  | "inner_child_healing"
  | "shadow_work"
  | "trauma_release"
  | "energy_healing"
  | "reiki"
  | "chakra_balancing"
  | "kundalini_activation"
  | "sacred_feminine"
  | "sacred_masculine"
  | "couples_spiritual"
  | "manifestation"
  | "abundance_prosperity"
  | "life_purpose"
  | "vision_quest"
  | "nature"
  | "nature_connection"
  | "detox_renewal"
  | "adventure"
  | "leadership"
  | "creative"
  | "alchemist_transformation"
  | "other";

export const RETREAT_CATEGORY_SLUGS = [
  "yoga",
  "meditation",
  "wellness",
  "silent",
  "breathwork",
  "sound_healing",
  "somatic",
  "spiritual_awakening",
  "inner_child_healing",
  "shadow_work",
  "trauma_release",
  "energy_healing",
  "reiki",
  "chakra_balancing",
  "kundalini_activation",
  "plant_medicine_integration",
  "shamanic_healing",
  "sacred_feminine",
  "sacred_masculine",
  "couples_spiritual",
  "manifestation",
  "abundance_prosperity",
  "life_purpose",
  "vision_quest",
  "nature_connection",
  "detox_renewal",
  "alchemist_transformation",
  "adventure",
  "leadership",
  "creative",
  "plant",
  "sound",
  "spiritual",
  "nature",
  "other",
] as const satisfies readonly RetreatCategorySlug[];

export type RetreatCategoryTile = {
  value: RetreatCategorySlug;
  label: string;
  sub?: string;
};

/** Ordered for intake / owner forms (common first). */
export const RETREAT_CATEGORY_TILE_OPTIONS: RetreatCategoryTile[] = [
  { value: "yoga", label: "Yoga Retreat", sub: "Movement & embodiment" },
  { value: "meditation", label: "Meditation Retreat", sub: "Stillness & clarity" },
  { value: "wellness", label: "Wellness & spa", sub: "Restore & renew" },
  { value: "silent", label: "Silent Retreat", sub: "Deep quiet" },
  { value: "breathwork", label: "Breathwork Retreat", sub: "Conscious breathing" },
  { value: "sound_healing", label: "Sound Healing", sub: "Bowls, gongs, voice" },
  { value: "somatic", label: "Somatic healing", sub: "Body-led therapy" },
  { value: "spiritual_awakening", label: "Spiritual Awakening", sub: "Inner opening" },
  { value: "inner_child_healing", label: "Inner Child Healing", sub: "Reparenting & repair" },
  { value: "shadow_work", label: "Shadow Work", sub: "Integration & truth" },
  { value: "trauma_release", label: "Trauma Release", sub: "Safe nervous-system work" },
  { value: "energy_healing", label: "Energy Healing", sub: "Subtle body work" },
  { value: "reiki", label: "Reiki Retreat", sub: "Hands-on healing" },
  { value: "chakra_balancing", label: "Chakra Balancing", sub: "Energy centers" },
  { value: "kundalini_activation", label: "Kundalini Activation", sub: "Awakening practices" },
  { value: "plant_medicine_integration", label: "Plant Medicine Integration", sub: "Ceremony & integration" },
  { value: "shamanic_healing", label: "Shamanic Healing", sub: "Indigenous-informed" },
  { value: "sacred_feminine", label: "Sacred Feminine", sub: "Feminine rites" },
  { value: "sacred_masculine", label: "Sacred Masculine", sub: "Masculine rites" },
  { value: "couples_spiritual", label: "Couples Spiritual", sub: "Shared journey" },
  { value: "manifestation", label: "Manifestation", sub: "Intention & creation" },
  { value: "abundance_prosperity", label: "Abundance & Prosperity", sub: "Wealth consciousness" },
  { value: "life_purpose", label: "Life Purpose", sub: "Direction & calling" },
  { value: "vision_quest", label: "Vision Quest", sub: "Solitude & vision" },
  { value: "nature_connection", label: "Nature Connection", sub: "Wild & grounding" },
  { value: "detox_renewal", label: "Detox & Renewal", sub: "Cleanse & reset" },
  { value: "alchemist_transformation", label: "Alchemist Transformation", sub: "Premium deep work" },
  { value: "adventure", label: "Adventure", sub: "Nature & exploration" },
  { value: "leadership", label: "Leadership / executive", sub: "Teams & professionals" },
  { value: "creative", label: "Creative arts", sub: "Art, writing, craft" },
  { value: "plant", label: "Plant medicine (legacy)", sub: "Ceremonial" },
  { value: "spiritual", label: "Spiritual (general)", sub: "Sacred inner work" },
  { value: "other", label: "Other", sub: "Describe your retreat type" },
];

export function isRetreatCategorySlug(v: string): v is RetreatCategorySlug {
  return (RETREAT_CATEGORY_SLUGS as readonly string[]).includes(v);
}
