import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminRetreatCreateSchema } from "@/validation/adminRetreatCreate";

export const runtime = "nodejs";

const ADM_COLS = [
  "id","slug","title","type","categories","location","country","region",
  "dates_display","price_display","price_from","price_currency","price_notes",
  "image_path","gallery_paths",
  "rating","review_count","badge","description",
  "inclusions","exclusions","itinerary",
  "operator_name","operator_website",
  "min_age","max_age","age_notes",
  "booking_url","commercial_status","qualification_status","qualification_checks",
  "internal_notes",
  "status","sort_order","trust_tier","verified_at","credibility_note",
  "created_at","updated_at",
].join(",");

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const admin = createAdminClient();

  // Single retreat: /api/admin/retreats?id=<uuid or slug>
  const idParam = searchParams.get("id");
  if (idParam) {
    const { data, error } = await admin
      .from("retreats")
      .select(ADM_COLS)
      .or(`id.eq.${idParam},slug.eq.${idParam}`)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data });
  }

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const status = searchParams.get("status") ?? "all";
  const limit = 20;

  let query = admin.from("retreats").select(ADM_COLS, { count: "exact" })
    .order("sort_order", { ascending: true }).order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  if (status !== "all") query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count ?? 0, page, limit });
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = createAdminClient();

  // Publishing validation: if changing to 'published', must be approved/live + >=1 departure + >=1 image
  if (fields.status === "published") {
    const { data: row } = await admin.from("retreats").select("qualification_status, gallery_paths, image_path").eq("id", id).single();
    if (!row) return NextResponse.json({ error: "Retreat not found" }, { status: 404 });
    const qs = row.qualification_status as string | null;
    if (qs !== "approved" && qs !== "live") {
      return NextResponse.json({ error: "Retreat must be approved or live before publishing. Change qualification_status first." }, { status: 400 });
    }
    const hasImage = (row.gallery_paths as string[] | null)?.length || row.image_path;
    if (!hasImage) {
      return NextResponse.json({ error: "At least one image (gallery or main) is required before publishing." }, { status: 400 });
    }
    try {
      const { count } = await admin.from("retreat_departures").select("id", { count: "exact", head: true }).eq("retreat_id", id);
      if ((count ?? 0) < 1) {
        return NextResponse.json({ error: "At least one departure is required before publishing." }, { status: 400 });
      }
    } catch { /* departures table may not exist yet */ }
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) update[k] = v;
  }
  // qualification_checks is a jsonb column — send the object as-is,
  // NOT stringified, so it is stored as JSON and round-trips correctly.

  const { error } = await admin.from("retreats").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });


  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const parsed = adminRetreatCreateSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const d = parsed.data;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("retreats")
    .insert({
      slug: d.slug,
      title: d.title,
      type: d.type,
      categories: d.categories ?? [],
      location: d.location ?? null,
      country: d.country ?? null,
      region: d.region ?? null,
      dates_display: d.dates_display ?? "",
      price_display: d.price_display ?? "Price on request",
      price_from: d.price_from ?? null,
      price_currency: d.price_currency ?? "EUR",
      price_notes: d.price_notes ?? null,
      image_path: d.image_path ?? "/brand/og-share.png",
      gallery_paths: d.gallery_paths ?? null,
      description: d.description ?? null,
      inclusions: d.inclusions ?? null,
      exclusions: d.exclusions ?? null,
      itinerary: d.itinerary ?? null,
      operator_name: d.operator_name ?? null,
      operator_website: d.operator_website ?? null,
      min_age: d.min_age ?? null,
      max_age: d.max_age ?? null,
      age_notes: d.age_notes ?? null,
      booking_url: d.booking_url ?? null,
      commercial_status: d.commercial_status ?? null,
      internal_notes: d.internal_notes ?? null,
      status: "draft",
      qualification_status: "submitted",
      qualification_checks: {},
      sort_order: 0,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug }, { status: 201 });
}
