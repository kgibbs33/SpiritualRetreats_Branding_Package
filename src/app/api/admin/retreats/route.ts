import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CACHE_TAG_RETREATS_LIST, retreatDetailCacheTag } from "@/lib/retreats/cache-tags";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const status = searchParams.get("status") ?? "all";
  const limit = 20;
  const from = (page - 1) * limit;

  const admin = createAdminClient();
  let query = admin
    .from("retreats")
    .select("*", { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count ?? 0, page, limit });
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { id, status, sort_order, trust_tier } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const admin = createAdminClient();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (status) update.status = status;
  if (sort_order !== undefined) update.sort_order = sort_order;
  // SCOPE-044: admin sets the trust tier; verified_at tracks a verified tier.
  if (typeof trust_tier === "string") {
    update.trust_tier = trust_tier;
    const isVerified = /verified|^partner$/i.test(trust_tier);
    update.verified_at = isVerified ? new Date().toISOString() : null;
  }

  const { data, error } = await admin.from("retreats").update(update).eq("id", id).select("slug").maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data?.slug) {
    revalidateTag(CACHE_TAG_RETREATS_LIST, "max");
    revalidateTag(retreatDetailCacheTag(data.slug), "max");
  }

  return NextResponse.json({ ok: true });
}
