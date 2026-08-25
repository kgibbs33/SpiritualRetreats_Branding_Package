import Link from "next/link";

import { TrustBadge } from "@/components/ui/TrustBadge";
import { PRACTICE_AREA_LABELS } from "@/lib/facilitators/practice-areas";

export type FacilitatorCardProps = {
  slug: string;
  name: string;
  headline?: string | null;
  location?: string;
  practiceAreas?: string[] | null;
  hasPhoto?: boolean;
  openToWork?: boolean;
  verified?: boolean;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function practiceLabel(area: string): string {
  return (PRACTICE_AREA_LABELS as Record<string, string>)[area] ?? area;
}

export function FacilitatorCard({
  slug,
  name,
  headline,
  location,
  practiceAreas,
  hasPhoto,
  openToWork,
  verified,
}: FacilitatorCardProps) {
  const areas = (practiceAreas ?? []).slice(0, 4);
  const extra = (practiceAreas ?? []).length - areas.length;

  return (
    <Link
      href={`/facilitator-directory/${slug}`}
      className="group flex flex-col rounded-2xl border border-beige bg-white p-6 shadow-[0_4px_12px_rgba(61,95,61,0.06)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(61,95,61,0.1)]"
    >
      <div className="flex items-center gap-4">
        {hasPhoto ? (
          /* eslint-disable-next-line @next/next/no-img-element -- signed redirect to a private bucket; next/image remote optimization isn't a fit here */
          <img
            src={`/facilitator-directory/${slug}/photo`}
            alt={name}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-forest/10 text-base font-semibold text-forest"
          >
            {initials(name) || "RY"}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-[family-name:var(--font-display)] text-lg font-semibold text-stone-900">
              {name}
            </h3>
            {verified && <TrustBadge variant="verified" className="shrink-0" />}
            {openToWork && (
              <span className="shrink-0 rounded-full bg-warm-brown/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warm-brown">
                Open
              </span>
            )}
          </div>
          {headline ? (
            <p className="truncate text-sm text-stone-500">{headline}</p>
          ) : null}
          {location ? (
            <p className="truncate text-xs text-stone-400">{location}</p>
          ) : null}
        </div>
      </div>

      {areas.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {areas.map((a) => (
            <span
              key={a}
              className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs text-forest"
            >
              {practiceLabel(a)}
            </span>
          ))}
          {extra > 0 && (
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500">
              +{extra}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
