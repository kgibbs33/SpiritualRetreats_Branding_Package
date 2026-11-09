import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const LIST_COLS =
  "retreat_id, retreat_name, primary_category, country, city_area, verification_level, record_status, website, data_quality_score";

function escapeLike(raw: string): string {
  return raw.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 50;
  const from = (page - 1) * limit;
  const q = searchParams.get("q")?.trim();
  const country = searchParams.get("country")?.trim();
  const category = searchParams.get("category")?.trim();
  const verification = searchParams.get("verification")?.trim();
  const status = searchParams.get("status")?.trim();

  const admin = createAdminClient();
  let query = admin.from("lc_candidates").select(LIST_COLS, { count: "exact" });

  if (q) {
    const escaped = escapeLike(q);
    const pattern = `%${escaped}%`;
    query = query.or(
      `retreat_name.ilike.${pattern},city_area.ilike.${pattern},website.ilike.${pattern}`
    );
  }
  if (country) query = query.eq("country", country);
  if (category) query = query.eq("primary_category", category);
  if (verification) query = query.eq("verification_level", verification);
  if (status) query = query.eq("record_status", status);

  const { data, count, error } = await query
    .order("retreat_name", { ascending: true })
    .range(from, from + limit - 1);

  if (error) {
    // Table not yet created — graceful
    if (error.code === "42P01") {
      return NextResponse.json({ data: [], total: 0, tableMissing: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Distinct filter values (simple per-request cache)
  const [{ data: countries }, { data: cats }, { data: verifs }, { data: statz }] =
    await Promise.all([
      admin.from("lc_candidates").select("country").neq("country", null).order("country"),
      admin.from("lc_candidates").select("primary_category").neq("primary_category", null).order("primary_category"),
      admin.from("lc_candidates").select("verification_level").neq("verification_level", null).order("verification_level"),
      admin.from("lc_candidates").select("record_status").neq("record_status", null).order("record_status"),
    ].map(p => p.then(r => r).catch(() => ({ data: [], error: null }))));

  const unique = (rows: Record<string, unknown>[] | null, col: string) =>
    [...new Set((rows ?? []).map((r) => r[col] as string).filter(Boolean))];

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    limit,
    filters: {
      country: unique(countries, "country"),
      category: unique(cats, "primary_category"),
      verification: unique(verifs, "verification_level"),
      status: unique(statz, "record_status"),
    },
  });
}