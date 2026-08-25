/** Next.js cache tags for `unstable_cache` / `revalidateTag` (Next.js 16 App Router). */
export const CACHE_TAG_RETREATS_LIST = "retreats-list";

export function retreatDetailCacheTag(slug: string): string {
  return `retreat-${slug.trim()}`;
}
