/**
 * Shared facilitator practice-area taxonomy (SCOPE-031).
 * Single source of truth so the onboarding and matching forms stay consistent.
 */
export const PRACTICE_AREAS = [
  "yoga",
  "meditation",
  "breathwork",
  "sound-healing",
  "plant-medicine",
  "somatic",
  "coaching",
  "creative",
  "spiritual",
  "other",
] as const;

export type PracticeArea = (typeof PRACTICE_AREAS)[number];

export const PRACTICE_AREA_LABELS: Record<PracticeArea, string> = {
  yoga: "Yoga & movement",
  meditation: "Meditation",
  breathwork: "Breathwork",
  "sound-healing": "Sound healing",
  "plant-medicine": "Plant medicine",
  somatic: "Somatic",
  coaching: "Coaching",
  creative: "Creative arts",
  spiritual: "Spiritual",
  other: "Other",
};
