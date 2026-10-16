/**
 * GoHighLevel form embed configuration.
 * When an iframeUrl is set, <GhlForm> renders an iframe instead of the built-in form.
 * The formId is derived from the last path segment of the URL.
 * URLs are empty now — Kirtis is creating them.
 */
export const GHL_FORMS = {
  retreatPlannerIntake: { iframeUrl: "" },
  venueIntake: { iframeUrl: "" },
} as const;

export type GhlFormKey = keyof typeof GHL_FORMS;

/** Derive a GHL form ID from the last path segment of the iframe URL. */
export function deriveFormId(url: string): string {
  const parts = url.replace(/\/+$/, "").split("/");
  return parts[parts.length - 1] || "unknown";
}