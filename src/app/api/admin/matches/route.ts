import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendMatchNotificationToFacilitator,
  sendMatchNotificationToSeeker,
} from "@/lib/mail/transactional-confirmations";

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
    .from("matches")
    .select("*, retreats(title, slug)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count ?? 0, page, limit });
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const {
    seekerDiscoveryResponseId,
    seekerEmail,
    retreatId,
    facilitatorEmail,
    seekerName,
    facilitatorName,
    notes,
  } = body;

  if (!seekerEmail || !retreatId || !facilitatorEmail) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: retreatRow, error: retreatErr } = await admin
    .from("retreats")
    .select("id, title")
    .eq("id", retreatId)
    .eq("status", "published")
    .maybeSingle();

  if (retreatErr || !retreatRow) {
    return NextResponse.json({ error: "Published retreat not found." }, { status: 404 });
  }

  const { data: matchRow, error: matchErr } = await admin
    .from("matches")
    .insert({
      seeker_discovery_response_id: seekerDiscoveryResponseId || null,
      retreat_id: retreatId,
      seeker_email: seekerEmail.trim().toLowerCase(),
      facilitator_email: facilitatorEmail.trim().toLowerCase(),
      seeker_name: seekerName?.trim() || null,
      facilitator_name: facilitatorName?.trim() || null,
      status: "recorded",
      operator_notes: notes?.trim() || null,
    })
    .select("id")
    .single();

  if (matchErr || !matchRow) {
    return NextResponse.json({ error: "Could not create match." }, { status: 500 });
  }

  const seekerFirst = (seekerName?.trim() || "there").split(/\s+/)[0] || "there";
  const facilitatorFirst = (facilitatorName?.trim() || "there").split(/\s+/)[0] || "there";

  try {
    await sendMatchNotificationToSeeker({
      toEmail: seekerEmail.trim(),
      firstName: seekerFirst,
      retreatTitle: retreatRow.title as string,
      matchId: String(matchRow.id),
    });
    await sendMatchNotificationToFacilitator({
      toEmail: facilitatorEmail.trim(),
      firstName: facilitatorFirst,
      seekerFirstName: seekerFirst,
      retreatTitle: retreatRow.title as string,
      matchId: String(matchRow.id),
    });
  } catch (mailErr) {
    console.error("match notification mail:", mailErr);
  }

  await admin.from("matches").update({ status: "notified" }).eq("id", matchRow.id);
  await admin.from("events").insert({
    event_type: "manual_match_created",
    entity_type: "match",
    entity_id: matchRow.id,
    payload: { retreat_id: retreatId, seeker_discovery_response_id: seekerDiscoveryResponseId },
  });

  return NextResponse.json({ ok: true, id: matchRow.id }, { status: 201 });
}
