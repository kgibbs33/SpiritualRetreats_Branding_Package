"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  PRACTICE_AREAS,
  PRACTICE_AREA_LABELS,
} from "@/lib/facilitators/practice-areas";

/**
 * SCOPE-036: public directory filters. Writes to URL searchParams
 * (`?skills=yoga,breathwork&open=1`) so filtered views are shareable; the server
 * component reads them back. Skills match facilitators with ANY selected area.
 */
export function FacilitatorDirectoryFilters({
  activeSkills,
  openToWork,
}: {
  activeSkills: string[];
  openToWork: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function commit(skills: string[], open: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (skills.length) params.set("skills", skills.join(","));
    else params.delete("skills");
    if (open) params.set("open", "1");
    else params.delete("open");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggleSkill(slug: string) {
    const set = new Set(activeSkills);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    commit([...set], openToWork);
  }

  const active = activeSkills.length > 0 || openToWork;

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Filter by skill"
        className="flex flex-wrap gap-2"
      >
        {PRACTICE_AREAS.map((slug) => {
          const on = activeSkills.includes(slug);
          return (
            <button
              key={slug}
              type="button"
              aria-pressed={on}
              onClick={() => toggleSkill(slug)}
              className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-1 ${
                on
                  ? "border-forest bg-forest/5 font-medium text-forest"
                  : "border-stone-300 text-stone-700 hover:border-warm-brown/60"
              }`}
            >
              {PRACTICE_AREA_LABELS[slug]}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={openToWork}
            onChange={(e) => commit(activeSkills, e.target.checked)}
            className="accent-forest"
          />
          Open to work only
        </label>
        {active && (
          <button
            type="button"
            onClick={() => commit([], false)}
            className="text-sm font-medium text-stone-400 hover:text-stone-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
