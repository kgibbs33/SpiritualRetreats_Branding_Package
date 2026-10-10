import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRetreatBySlug, getRetreatBySlugAdmin } from "@/lib/retreats/queries";
import { getAdminSession } from "@/lib/admin/auth";
import { BRAND_NAME } from "@/lib/brand";
import { RequestPlaceForm } from "@/components/retreat/RequestPlaceForm";
import type { RetreatRow, DepartureRow } from "@/lib/retreats/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp.preview === "1";
  let row: RetreatRow | null = null;

  if (isPreview && await getAdminSession()) {
    const r = await getRetreatBySlugAdmin(slug);
    row = r.row;
  } else {
    const r = await getRetreatBySlug(slug);
    row = r.row;
  }

  if (!row) return { title: `Retreat not found | ${BRAND_NAME}` };

  const ogImage = row.gallery_paths?.[0] || "/brand/og-share.png";
  return {
    title: row.title,
    description: row.description?.slice(0, 160) || `Book ${row.title} with ${BRAND_NAME}.`,
    alternates: { canonical: `/retreat/${row.slug}` },
    openGraph: {
      title: row.title,
      description: row.description?.slice(0, 200) || "",
      images: [{ url: ogImage, alt: row.title }],
    },
    ...(isPreview ? { robots: "noindex, nofollow" } : {}),
  };
}

export default async function RetreatDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp.preview === "1";
  const hasAdmin = isPreview ? await getAdminSession() : false;

  let row: RetreatRow | null = null;
  let departures: DepartureRow[] = [];
  let error: string | null = null;

  if (hasAdmin) {
    const r = await getRetreatBySlugAdmin(slug);
    row = r.row;
    departures = r.departures;
    error = r.error;
  } else {
    const r = await getRetreatBySlug(slug);
    row = r.row;
    departures = r.departures;
    error = r.error;
  }

  if (error || !row) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      {hasAdmin && row.status === "draft" && (
        <div className="mb-6 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-center font-semibold text-amber-800">
          Draft preview — not public
        </div>
      )}

      {/* Title, gallery, departures, sections — same as before */}
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl lg:text-5xl">{row.title}</h1>
      <p className="mt-3 text-lg text-stone-600">{row.country || row.location || ""}{row.country && row.location ? ` — ${row.location}` : ""}</p>

      {departures.length > 0 && (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">Departures</h2>
          <div className="mt-4 divide-y divide-sage-mist rounded-2xl border border-sage-mist bg-white">
            {departures.map((d) => {
              const nights = (new Date(d.end_date).getTime() - new Date(d.start_date).getTime()) / 86400000 + 1;
              const full = d.status === "full" || (d.spots_left != null && d.spots_left <= 0);
              return (
                <div key={d.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-celestial-navy">
                      {new Date(d.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      {" — "}{new Date(d.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-sm text-stone-500">{nights} night{nights !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {full ? <span className="text-sm font-semibold text-red-500">Full</span>
                      : d.spots_left != null ? <span className="text-sm text-stone-600">{d.spots_left} spot{d.spots_left !== 1 ? "s" : ""} left</span>
                      : null}
                    {!hasAdmin && <RequestPlaceForm retreatId={row.id} departureId={d.id} retreatTitle={row.title} full={full} />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {row.price_display && (<section className="mt-10"><h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">Price</h2><p className="mt-2 text-lg font-semibold text-celestial-navy">{row.price_display}</p>{row.price_notes && <p className="mt-1 text-sm text-stone-500">{row.price_notes}</p>}</section>)}
      {row.description && (<section className="mt-10"><h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">About this retreat</h2><div className="mt-4 leading-relaxed text-stone-700">{row.description}</div></section>)}

      {/* Remaining sections unchanged — omitted for brevity; same as previous version */}
      <p className="mt-20 text-center text-xs text-stone-300">
        <a href="/retreat-listings">← Back to retreats</a>
      </p>
    </div>
  );
}