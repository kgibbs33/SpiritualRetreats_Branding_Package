import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TrustBadge } from "@/components/ui/TrustBadge";
import {
  facilitatorLocation,
  getPublishedFacilitatorBySlug,
} from "@/lib/facilitators/directory-queries";
import { PRACTICE_AREA_LABELS } from "@/lib/facilitators/practice-areas";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function practiceLabel(area: string): string {
  return (PRACTICE_AREA_LABELS as Record<string, string>)[area] ?? area;
}

/**
 * Render-boundary guard: only emit http(s) hrefs. Defense in depth — the
 * onboarding form already rejects non-http(s) schemes (SCOPE-029), but the
 * publish step copies URLs verbatim, so we never trust a stored value as a link.
 */
function safeHttpUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { row } = await getPublishedFacilitatorBySlug(slug);
  if (!row) return { title: "Facilitator not found — Re: Treat Yourself" };

  const title = `${row.display_name} — Re: Treat Yourself`;
  const description =
    row.headline?.trim() ||
    row.bio?.trim()?.slice(0, 160) ||
    `${row.display_name} facilitates retreats with Re: Treat Yourself.`;
  const canonical = `/facilitator-directory/${slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "profile", url: canonical, title, description },
    twitter: { card: "summary", title, description },
  };
}

const LINKS: Array<{
  key: "website_url" | "linkedin_url" | "instagram_url";
  label: string;
}> = [
  { key: "website_url", label: "Website" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "instagram_url", label: "Instagram" },
];

export default async function FacilitatorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const { row } = await getPublishedFacilitatorBySlug(slug);
  if (!row) notFound();

  const location = facilitatorLocation(row);
  const links = LINKS.map((l) => ({
    label: l.label,
    href: safeHttpUrl(row[l.key]),
  })).filter((l): l is { label: string; href: string } => l.href !== null);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <Link
          href="/facilitator-directory"
          className="text-sm font-medium text-stone-400 transition-colors hover:text-stone-700"
        >
          ← All facilitators
        </Link>

        <header className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          {row.photo_path ? (
            /* eslint-disable-next-line @next/next/no-img-element -- signed redirect to a private bucket */
            <img
              src={`/facilitator-directory/${slug}/photo`}
              alt={row.display_name}
              className="h-24 w-24 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-forest/10 text-2xl font-semibold text-forest"
            >
              {row.display_name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? "")
                .join("") || "RY"}
            </span>
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-stone-900">
                {row.display_name}
              </h1>
              {row.verified && <TrustBadge variant="verified" />}
            </div>
            {row.headline ? (
              <p className="mt-1 text-stone-600">{row.headline}</p>
            ) : null}
            {location ? (
              <p className="mt-1 text-sm text-stone-400">{location}</p>
            ) : null}
          </div>
        </header>

        {row.practice_areas && row.practice_areas.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              Skills &amp; practices
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {row.practice_areas.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-forest/10 px-3 py-1 text-sm text-forest"
                >
                  {practiceLabel(a)}
                </span>
              ))}
            </div>
          </div>
        )}

        {row.bio ? (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              About
            </h2>
            <p className="mt-2.5 whitespace-pre-line text-[15px] leading-relaxed text-stone-700">
              {row.bio}
            </p>
          </div>
        ) : null}

        {links.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400">
              Links
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex min-h-[40px] items-center rounded-xl border border-beige px-4 text-sm font-semibold text-forest hover:bg-cream"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-cream px-6 py-6 text-center">
          <p className="text-[15px] text-stone-700">
            Looking for the right retreat?
          </p>
          <Link
            href="/find-your-retreat"
            className="mt-3 inline-flex h-11 items-center justify-center rounded-xl bg-forest px-6 text-sm font-semibold text-white hover:bg-[#345834]"
          >
            Find your retreat
          </Link>
        </div>
      </div>
    </div>
  );
}
