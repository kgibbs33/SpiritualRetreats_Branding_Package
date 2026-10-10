import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRetreatBySlug } from "@/lib/retreats/queries";
import { BRAND_NAME } from "@/lib/brand";
import { RequestPlaceForm } from "@/components/retreat/RequestPlaceForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { row, error } = await getRetreatBySlug(slug);
  if (error || !row) return { title: `Retreat not found | ${BRAND_NAME}` };

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
  };
}

export default async function RetreatDetailPage({ params }: Props) {
  const { slug } = await params;
  const { row, departures, error } = await getRetreatBySlug(slug);

  if (error || !row) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      {/* Header */}
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-celestial-navy sm:text-4xl lg:text-5xl">
        {row.title}
      </h1>
      <p className="mt-3 text-lg text-stone-600">
        {row.country || row.location || ""}
        {row.country && row.location ? ` — ${row.location}` : ""}
      </p>

      {/* Gallery */}
      {(row.gallery_paths?.length ?? 0) > 0 && (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {row.gallery_paths!.map((img, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={img}
                alt={`${row.title} — photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}
      {(!row.gallery_paths || row.gallery_paths.length === 0) && row.image_path && (
        <div className="mt-8 relative aspect-[16/9] overflow-hidden rounded-2xl">
          <Image
            src={row.image_path}
            alt={row.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* Departures */}
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
                      {" — "}
                      {new Date(d.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-sm text-stone-500">{nights} night{nights !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {full
                      ? <span className="text-sm font-semibold text-red-500">Full</span>
                      : d.spots_left != null
                        ? <span className="text-sm text-stone-600">{d.spots_left} spot{d.spots_left !== 1 ? "s" : ""} left</span>
                        : null
                    }
                    <RequestPlaceForm
                      retreatId={row.id}
                      departureId={d.id}
                      retreatTitle={row.title}
                      full={full}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Price */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">Price</h2>
        <p className="mt-2 text-lg font-semibold text-celestial-navy">
          {row.price_display}
          {row.price_currency ? ` ${row.price_currency}` : ""}
        </p>
        {row.price_notes && <p className="mt-1 text-sm text-stone-500">{row.price_notes}</p>}
      </section>

      {/* Description */}
      {row.description && (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">About this retreat</h2>
          <div className="mt-4 leading-relaxed text-stone-700 max-w-none">{row.description}</div>
        </section>
      )}

      {/* What's included */}
      {(row.inclusions?.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">What is included</h2>
          <ul className="mt-4 list-disc pl-5 space-y-1 text-stone-700">
            {row.inclusions!.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>
      )}

      {/* What's excluded */}
      {(row.exclusions?.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">What is not included</h2>
          <ul className="mt-4 list-disc pl-5 space-y-1 text-stone-700">
            {row.exclusions!.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>
      )}

      {/* Programme / itinerary */}
      {(row.itinerary as Array<{ label?: string; title?: string; description?: string }> | null)?.length ? (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">Programme</h2>
          <div className="mt-4 space-y-4">
            {(row.itinerary as Array<{ label?: string; title?: string; description?: string }>).map((item, i) => (
              <div key={i} className="rounded-xl border border-sage-mist bg-warm-cream p-4">
                {item.label && <p className="text-xs font-semibold uppercase tracking-wider text-forest-green">{item.label}</p>}
                {item.title && <p className="mt-1 font-semibold text-celestial-navy">{item.title}</p>}
                {item.description && <p className="mt-1 text-sm text-stone-600">{item.description}</p>}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Operator */}
      {row.operator_name && (
        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-celestial-navy">Operator</h2>
          <p className="mt-2 text-stone-700">{row.operator_name}</p>
          {row.operator_website && (
            <a href={row.operator_website} target="_blank" rel="noopener noreferrer" className="text-link text-sm">
              Visit website
            </a>
          )}
        </section>
      )}

      {/* Capacity + Age */}
      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        {row.min_age != null || row.max_age != null ? (
          <div className="rounded-2xl border border-sage-mist bg-warm-cream p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-forest-green">Age range</h3>
            <p className="mt-2 text-stone-700">
              {row.min_age != null && row.max_age != null
                ? `${row.min_age}–${row.max_age}`
                : row.min_age != null
                  ? `${row.min_age}+`
                  : `Up to ${row.max_age}`}
            </p>
            {row.age_notes && <p className="mt-1 text-xs text-stone-500">{row.age_notes}</p>}
          </div>
        ) : null}
        <div className="rounded-2xl border border-sage-mist bg-warm-cream p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-forest-green">Capacity</h3>
          <p className="mt-2 text-stone-700">{departures[0]?.capacity ?? "Contact operator for details"}</p>
        </div>
      </section>

      {/* Rating — only when real data exists */}
      {row.rating != null && row.rating > 0 && (
        <section className="mt-10">
          <p className="text-lg text-stone-600">
            Rating: {row.rating.toFixed(1)}
            {row.review_count != null ? ` (${row.review_count} review${row.review_count !== 1 ? "s" : ""})` : ""}
          </p>
        </section>
      )}

      {/* Bottom CTA — if no departures, show general enquiry */}
      {departures.length === 0 && (
        <section className="mt-10 rounded-2xl border border-sage-mist bg-warm-cream p-6 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-celestial-navy">
            Interested in this retreat?
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            No dates are listed at the moment. Ask a question and the team will get back to you.
          </p>
          <RequestPlaceForm retreatId={row.id} retreatTitle={row.title} enquiry />
        </section>
      )}
    </div>
  );
}