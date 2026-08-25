import { NextResponse } from "next/server";

import {
  sendMatchNotificationToFacilitator,
  sendMatchNotificationToSeeker,
} from "@/lib/mail/transactional-confirmations";
import { verifyOperatorSecret } from "@/lib/operator/verify-secret";
import { createAdminClient } from "@/lib/supabase/admin";
import { createMatchSchema } from "@/validation/operatorPublish";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!verifyOperatorSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const parsed = createMatchSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = parsed.data;
    const admin = createAdminClient();

    const { data: seekerRow, error: seekerErr } = await admin
      .from("seeker_discovery_responses")
      .select("email, full_name")
      .eq("id", d.seekerDiscoveryResponseId)
      .maybeSingle();

    if (seekerErr || !seekerRow) {
      return NextResponse.json(
        { error: "Seeker questionnaire response not found." },
        { status: 404 }
      );
    }

    if (
      seekerRow.email.trim().toLowerCase() !== d.seekerEmail.trim().toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Seeker email does not match questionnaire record." },
        { status: 400 }
      );
    }

    const { data: retreatRow, error: retreatErr } = await admin
      .from("retreats")
      .select("id, title")
      .eq("id", d.retreatId)
      .eq("status", "published")
      .maybeSingle();

    if (retreatErr || !retreatRow) {
      return NextResponse.json(
        { error: "Published retreat not found." },
        { status: 404 }
      );
    }

    const { data: matchRow, error: matchErr } = await admin
      .from("matches")
      .insert({
        seeker_discovery_response_id: d.seekerDiscoveryResponseId,
        retreat_id: d.retreatId,
        seeker_email: d.seekerEmail.trim().toLowerCase(),
        facilitator_email: d.facilitatorEmail.trim().toLowerCase(),
        seeker_name: d.seekerName?.trim() || seekerRow.full_name || null,
        facilitator_name: d.facilitatorName?.trim() || null,
        status: "recorded",
        operator_notes: d.notes?.trim() || null,
      })
      .select("id")
      .single();

    if (matchErr || !matchRow) {
      console.error("matches insert:", matchErr);
      return NextResponse.json({ error: "Could not create match." }, { status: 500 });
    }

    const seekerFirst =
      (d.seekerName?.trim() || seekerRow.full_name || "there").split(/\s+/)[0] ||
      "there";
    const facilitatorFirst =
      (d.facilitatorName?.trim() || "there").split(/\s+/)[0] || "there";
    const retreatTitle = retreatRow.title as string;

    try {
      await sendMatchNotificationToSeeker({
        toEmail: d.seekerEmail.trim(),
        firstName: seekerFirst,
        retreatTitle,
        matchId: String(matchRow.id),
      });
      await sendMatchNotificationToFacilitator({
        toEmail: d.facilitatorEmail.trim(),
        firstName: facilitatorFirst,
        seekerFirstName: seekerFirst,
        retreatTitle,
        matchId: String(matchRow.id),
      });
    } catch (mailErr) {
      console.error("match notification mail:", mailErr);
    }

    await admin
      .from("matches")
      .update({ status: "notified" })
      .eq("id", matchRow.id);

    await admin.from("events").insert({
      event_type: "manual_match_created",
      entity_type: "match",
      entity_id: matchRow.id,
      payload: {
        retreat_id: d.retreatId,
        seeker_discovery_response_id: d.seekerDiscoveryResponseId,
      },
    });

    return NextResponse.json({ success: true, id: matchRow.id }, { status: 201 });
  } catch (err) {
    console.error("create-match:", err);
    return NextResponse.json({ error: "Match creation failed." }, { status: 500 });
  }
}
