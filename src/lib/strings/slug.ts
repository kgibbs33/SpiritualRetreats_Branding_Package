/** URL-safe slug from human title (fallback segment if empty). */
export function slugifyTitle(title: string, fallback: string): string {
  const raw = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return raw || fallback;
}
