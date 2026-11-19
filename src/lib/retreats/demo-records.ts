// Exact slugs from the repository's mock-data seed migrations.
// Keep demonstration records out of the public directory without mutating the database.
export const DEMO_RETREAT_SLUGS = new Set([
  "mindful-journey-yoga-meditation-nature-mexico",
  "inner-calm-silent-meditation-peru",
  "spa-renewal-wellness-detox-bali",
  "ocean-wellness-beachfront-yoga-breathwork-costa-rica",
  "sacred-valley-plant-medicine-integration-peru",
  "restorative-yoga-ayurveda-kerala-india",
  "black-forest-mindfulness-germany",
  "somatic-healing-algarve-portugal",
  "sunrise-yoga-safari-kenya",
  "silent-vipassana-sierra-nevada",
]);
export function isDemoRetreatHref(href?: string) {
  return Boolean(
    href && DEMO_RETREAT_SLUGS.has(href.split("/").filter(Boolean).pop() ?? ""),
  );
}
