import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Guarded transitions: a match may only move to an allowed next status. */
const ALLOWED_NEXT: Record<string, string[]> = {
  recorded: ["notified", "closed"],
  notified: ["closed"],
  closed: ["notified"],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const next: string = body?.status ?? "";

  const admin = createAdminClient();
  const { data: match, error: loadErr } = await admin
    .from("matches")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (loadErr || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const allowed = ALLOWED_NEXT[match.status] ?? [];
  if (!allowed.includes(next)) {
    return NextResponse.json(
      { error: `Cannot move a ${match.status} match to ${next || "(none)"}.` },
      { status: 400 }
    );
  }

  const { error: updErr } = await admin
    .from("matches")
    .update({ status: next })
    .eq("id", id);

  if (updErr) {
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }

  await admin.from("events").insert({
    event_type: "match_status_changed",
    entity_type: "match",
    entity_id: id,
    payload: { from: match.status, to: next },
  });

  return NextResponse.json({ ok: true, status: next });
}
