import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("lc_candidates")
    .select("*")
    .eq("retreat_id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ error: "Table not yet loaded" }, { status: 503 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data });
}