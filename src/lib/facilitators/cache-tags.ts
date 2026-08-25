/** Next.js cache tags for the facilitator directory (SCOPE-035/038). */
export const CACHE_TAG_FACILITATORS_LIST = "facilitators-list";

export function facilitatorDetailCacheTag(slug: string): string {
  return `facilitator-${slug.trim()}`;
}
