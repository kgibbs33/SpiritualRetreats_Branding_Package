import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const [k, v] of Object.entries(fields)) { if (v !== undefined) update[k] = v; }
  const admin = createAdminClient();
  const { error } = await admin.from("retreat_departures").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}