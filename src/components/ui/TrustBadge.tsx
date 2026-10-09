/**
 * Shared trust badge (SCOPE-044) — consistent verified / listed signalling
 * across the retreat and facilitator directories.
 *
 * - `verified` — vetted by the Light Path Retreats team (check icon, forest).
 * - `listed` — published but not yet verified (neutral).
 */
export type TrustVariant = "verified" | "listed";

/** Map a retreat `trust_tier` value to a badge variant (or null = no badge). */
export function retreatTrustVariant(
  tier: string | null | undefined
): TrustVariant | null {
  if (!tier) return null;
  const t = tier.toLowerCase();
  if (t.includes("verified") || t === "partner") return "verified";
  if (t === "listed" || t === "emerging") return "listed";
  return null;
}

export function TrustBadge({
  variant,
  className = "",
}: {
  variant: TrustVariant;
  className?: string;
}) {
  if (variant === "verified") {
    return (
      <span
        aria-label="Verified by Light Path Retreats"
        className={`inline-flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-semibold text-forest ${className}`}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
            clipRule="evenodd"
          />
        </svg>
        Verified
      </span>
    );
  }
  return (
    <span
      aria-label="Listed"
      className={`inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500 ${className}`}
    >
      Listed
    </span>
  );
}
