import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TrustBadge, retreatTrustVariant } from "@/components/ui/TrustBadge";
import { getRetreatBySlug } from "@/lib/retreats/queries";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { row } = await getRetreatBySlug(slug);
  if (!row) {
    return { title: "Retreat not found — Re: Treat Yourself" };
  }
  const title = `${row.title} — Re: Treat Yourself`;
  const description =
    row.description?.trim() ||
    `${row.type} retreat in ${row.location ?? "a beautiful location"}. ${row.dates_display}.`;
  // Relative or absolute image paths are absolutized against `metadataBase` (root layout).
  const ogImages = row.image_path
    ? [{ url: row.image_path, alt: row.title }]
    : undefined;
  const canonicalPath = `/retreat/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      url: canonicalPath,
      title,
      description,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: ogImages
      ? { card: "summary_large_image", title, description, images: [ogImages[0].url] }
      : { card: "summary", title, description },
  };
}

export default async function SingularRetreatPage({ params }: PageProps) {
  const { slug } = await params;
  if (!slug) notFound();

  const { row, error } = await getRetreatBySlug(slug);
  if (error || !row) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/retreat-listings"
        className="mb-8 inline-flex text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        ← Back to retreat listings
      </Link>

      <div className="relative mb-8 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-beige bg-stone-100 shadow-sm">
        <Image
          src={row.image_path}
          alt={`${row.title} — retreat in ${row.location ?? row.type}`}
          fill
          className="object-cover"
          sizes="(max-width: 896px) 100vw, 896px"
          priority
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {row.type}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-stone-800">
        {row.title}
      </h1>
      <p className="mt-2 text-stone-600">
        {row.location}
        {row.location ? " · " : ""}
        {row.dates_display}
      </p>
      <p className="mt-2 text-lg font-semibold text-stone-900">
        {row.price_display}
      </p>

      {(row.trust_tier || row.credibility_note) && (
        <div className="mt-4 rounded-lg border border-beige bg-white px-4 py-3 text-sm text-stone-700">
          {retreatTrustVariant(row.trust_tier) ? (
            <div className="flex flex-wrap items-center gap-2">
              <TrustBadge variant={retreatTrustVariant(row.trust_tier)!} />
              {row.verified_at ? (
                <span className="text-stone-500">
                  Verified{" "}
                  {new Date(row.verified_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ) : null}
            </div>
          ) : null}
          {row.credibility_note?.trim() ? (
            <p className="mt-2 text-stone-600">{row.credibility_note.trim()}</p>
          ) : null}
        </div>
      )}

      <div className="mt-10 rounded-lg border border-beige bg-cream p-8">
        {row.description?.trim() ? (
          <p className="whitespace-pre-wrap text-stone-700">{row.description}</p>
        ) : (
          <p className="text-stone-600">
            Full description, facilitator details, and booking options will
            appear here as we expand this listing.
          </p>
        )}
      </div>
    </div>
  );
}
