import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ALLOWED_STATUSES = ["open", "full", "cancelled"] as const;

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const retreatId = searchParams.get("retreat_id");
  if (!retreatId) return NextResponse.json({ error: "Missing retreat_id" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("retreat_departures")
    .select("id, retreat_id, start_date, end_date, capacity, spots_left, price_override, status, notes, created_at")
    .eq("retreat_id", retreatId)
    .order("start_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { retreat_id, start_date, end_date, capacity, spots_left, price_override, status, notes } = body;
  if (!retreat_id || !start_date || !end_date) {
    return NextResponse.json({ error: "retreat_id, start_date, end_date required" }, { status: 400 });
  }

  // Bug 1: validate dates server-side
  const today = new Date().toISOString().slice(0, 10);
  if (start_date < today) {
    return NextResponse.json({ error: "Start date must be today or in the future." }, { status: 400 });
  }
  if (end_date < start_date) {
    return NextResponse.json({ error: "End date must be on or after the start date." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("retreat_departures")
    .insert({ retreat_id, start_date, end_date, capacity, spots_left, price_override, status: status ?? "open", notes })
    .select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Bug 1: if updating dates, validate end >= start
  if (fields.start_date || fields.end_date) {
    // Fetch current dates to compare
    const admin = createAdminClient();
    const { data: current } = await admin
      .from("retreat_departures")
      .select("start_date, end_date")
      .eq("id", id)
      .maybeSingle();

    const s = fields.start_date ?? (current?.start_date ?? null);
    const e = fields.end_date ?? (current?.end_date ?? null);
    if (s && e && e < s) {
      return NextResponse.json({ error: "End date must be on or after the start date." }, { status: 400 });
    }
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) update[k] = v;
  }
  // Only allow valid statuses
  if (update.status && !ALLOWED_STATUSES.includes(update.status as typeof ALLOWED_STATUSES[number])) {
    return NextResponse.json({ error: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}` }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("retreat_departures").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = createAdminClient();

  // Check if this departure has any enquiries referencing it
  // Migration A column name: departure_id
  const { count: enquiryCount, error: eqErr } = await admin
    .from("retreat_enquiries")
    .select("id", { count: "exact", head: true })
    .eq("departure_id", id);
  if (eqErr) return NextResponse.json({ error: eqErr.message }, { status: 500 });
  if ((enquiryCount ?? 0) > 0) {
    return NextResponse.json({
      error: "This departure has enquiries. Set it to Full or Cancelled instead."
    }, { status: 409 });
  }

  // Fetch departure to check retreat context
  const { data: dep } = await admin
    .from("retreat_departures")
    .select("retreat_id")
    .eq("id", id)
    .maybeSingle();
  if (!dep) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check if this is the last departure of a published/live retreat
  const { data: retreat } = await admin
    .from("retreats")
    .select("status, qualification_status")
    .eq("id", dep.retreat_id)
    .maybeSingle();

  if (retreat && retreat.status === "published" && retreat.qualification_status === "live") {
    const { count: depCount } = await admin
      .from("retreat_departures")
      .select("id", { count: "exact", head: true })
      .eq("retreat_id", dep.retreat_id);
    if ((depCount ?? 0) <= 1) {
      return NextResponse.json({
        error: "Cannot delete the last departure of a published retreat. Unpublish first."
      }, { status: 409 });
    }
  }

  const { error } = await admin.from("retreat_departures").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}