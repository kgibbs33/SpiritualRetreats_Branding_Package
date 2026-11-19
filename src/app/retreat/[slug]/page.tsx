import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getRetreatBySlug,
  getRetreatBySlugAdmin,
} from "@/lib/retreats/queries";
import { getAdminSession } from "@/lib/admin/auth";
import { BRAND_NAME } from "@/lib/brand";
import { RetreatDetailContent } from "@/components/retreat/RetreatDetailContent";
import "@/app/retreat-design.css";
import type { RetreatRow, DepartureRow } from "@/lib/retreats/types";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp.preview === "1";
  let row: RetreatRow | null = null;

  if (isPreview && (await getAdminSession())) {
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
    description:
      row.description?.slice(0, 160) || `Book ${row.title} with ${BRAND_NAME}.`,
    alternates: { canonical: `/retreat/${row.slug}` },
    openGraph: {
      title: row.title,
      description: row.description?.slice(0, 200) || "",
      images: [{ url: ogImage, alt: row.title }],
    },
    ...((isPreview || row.previewOnly) ? { robots: "noindex, nofollow" } : {}),
  };
}

export default async function RetreatDetailPage({
  params,
  searchParams,
}: Props) {
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
    <RetreatDetailContent
      row={row}
      departures={departures}
      hasAdmin={Boolean(hasAdmin)}
    />
  );
}
