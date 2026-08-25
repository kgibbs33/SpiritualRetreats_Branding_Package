import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 20;
  const from = (page - 1) * limit;

  const admin = createAdminClient();
  const { data, count, error } = await admin
    .from("facilitator_onboarding_responses")
    // Embed the published facilitator's open_to_work (FK: facilitators.source_onboarding_id)
    // so the admin can toggle availability (SCOPE-037).
    .select("*, facilitators(open_to_work, verified)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count ?? 0, page, limit });
}
