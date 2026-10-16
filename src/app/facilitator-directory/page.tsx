import type { Metadata } from "next";
import Link from "next/link";

import { FacilitatorCard } from "@/components/facilitator/FacilitatorCard";
import { FacilitatorDirectoryFilters } from "@/components/facilitator/FacilitatorDirectoryFilters";
import {
  facilitatorLocation,
  hasActiveFacilitatorFilters,
  listPublishedFacilitators,
  parseFacilitatorFilters,
} from "@/lib/facilitators/directory-queries";

export const revalidate = 60;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = {
  title: "Facilitators — Light Path Retreats",
  description:
    "Browse our directory of retreat facilitators — teachers, guides, and practitioners across yoga, meditation, breathwork, somatic work, coaching, and more.",
  alternates: { canonical: "/facilitator-directory" },
  openGraph: {
    type: "website",
    url: "/facilitator-directory",
    title: "Facilitators — Light Path Retreats",
    description:
      "Browse our directory of retreat facilitators across many practices and locations.",
  },
};

export default async function FacilitatorDirectoryPage({
  searchParams,
}: PageProps) {
  const filters = parseFacilitatorFilters(await searchParams);
  const { rows, error } = await listPublishedFacilitators(filters);
  const filtered = hasActiveFacilitatorFilters(filters);

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-beige bg-cream/40">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <p className="text-sm font-medium uppercase tracking-widest text-forest">
            Facilitators
          </p>
          <h1 className="mt-2 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold text-stone-900 sm:text-4xl">
            Meet the people behind the practice
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-600">
            Teachers, guides, and practitioners who facilitate retreats with us.
            Real people, human-matched to the right experiences.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <FacilitatorDirectoryFilters
          activeSkills={filters.skills}
          openToWork={filters.openToWork}
        />

        <div className="mt-8">
          {error ? (
            <p className="py-16 text-center text-sm text-stone-500">
              We couldn&apos;t load the directory just now. Please try again
              later.
            </p>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-stone-600">
                {filtered
                  ? "No facilitators match these filters yet."
                  : "No facilitators are listed yet — check back soon."}
              </p>
              <Link
                href={filtered ? "/facilitator-directory" : "/facilitators-portal"}
                className="mt-4 inline-flex items-center text-sm font-semibold text-forest hover:underline"
              >
                {filtered ? "Clear filters" : "Are you a facilitator? Join us →"}
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => (
                <FacilitatorCard
                  key={row.slug}
                  slug={row.slug}
                  name={row.display_name}
                  headline={row.headline}
                  location={facilitatorLocation(row)}
                  practiceAreas={row.practice_areas}
                  hasPhoto={Boolean(row.photo_path)}
                  openToWork={row.open_to_work}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
