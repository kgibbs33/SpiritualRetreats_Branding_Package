import { NextResponse, after } from "next/server";

import { sendSeekerDiscoveryUserConfirmation } from "@/lib/mail/transactional-confirmations";
import { sendTeamSubmissionNotification } from "@/lib/mail/team-notification";
import { fireFormWebhook } from "@/lib/webhooks";
import { publicJsonPostGuards } from "@/lib/request-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  seekerDiscoveryInsertSchema,
  seekerDiscoverySchema,
} from "@/validation/seekerDiscovery";

export const runtime = "nodejs";


export async function POST(request: Request) {
  const blocked = publicJsonPostGuards(request, "seeker-discovery");
  if (blocked) return blocked;

  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const parsed = seekerDiscoverySchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = seekerDiscoveryInsertSchema.parse(parsed.data);
    const supabase = createAdminClient();

    if (d.idempotencyKey) {
      const { data: existing } = await supabase
        .from("seeker_discovery_responses")
        .select("id")
        .eq("idempotency_key", d.idempotencyKey)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          { success: true, id: existing.id, duplicate: true },
          { status: 200 }
        );
      }
    }

    const { data: row, error: insertError } = await supabase
      .from("seeker_discovery_responses")
      .insert({
        full_name: d.fullName,
        email: d.email,
        phone_whatsapp: d.phoneWhatsapp ?? null,
        travel_dates: d.travelDates ?? null,
        travel_dates_flexible: d.travelDatesFlexible ?? false,
        destination_region: d.destinationRegion ?? null,
        budget_range: d.budgetRange ?? null,
        purpose: d.purpose ?? null,
        answers: d.answers,
        reflection_intention: d.reflectionIntention ?? null,
        reflection_great_retreat: d.reflectionGreatRetreat ?? null,
        reflection_special_requests: d.reflectionSpecialRequests ?? null,
        idempotency_key: d.idempotencyKey ?? null,
      })
      .select("id")
      .single();

    if (insertError) {
      // SCOPE-099: two concurrent submissions can both pass the pre-check above
      // and race to insert the same idempotency_key. The DB unique constraint
      // rejects the loser with 23505 — treat it as a duplicate (200), not a 500.
      if (insertError.code === "23505" && d.idempotencyKey) {
        const { data: existing } = await supabase
          .from("seeker_discovery_responses")
          .select("id")
          .eq("idempotency_key", d.idempotencyKey)
          .maybeSingle();
        if (existing) {
          return NextResponse.json(
            { success: true, id: existing.id, duplicate: true },
            { status: 200 }
          );
        }
      }
      console.error("seeker_discovery insert:", insertError);
      return NextResponse.json(
        { error: "Failed to save your responses. Please try again." },
        { status: 500 }
      );
    }

    await supabase.from("events").insert({
      event_type: "seeker_discovery_submitted",
      entity_type: "seeker_discovery_response",
      entity_id: row.id,
      payload: { email: d.email, full_name: d.fullName },
    });

    after(async () => {
      try {
        await sendSeekerDiscoveryUserConfirmation({
          toEmail: d.email,
          firstName: d.fullName,
          responseId: String(row.id),
        });
      } catch (confirmErr) {
        console.error("seeker user confirmation mail:", confirmErr);
      }
      try {
        await sendTeamSubmissionNotification({
          formType: "Seeker discovery",
          recordId: String(row.id),
          fields: { Name: d.fullName, Email: d.email, Purpose: d.purpose ?? null },
        });
      } catch (teamErr) {
        console.error("seeker team notification mail:", teamErr);
      }
      fireFormWebhook({
        form_type: "seeker_discovery",
        submitted_at: new Date().toISOString(),
        source_url: "",
        contact: { name: d.fullName, email: d.email, phone: d.phoneWhatsapp ?? null },
        data: { answers: d.answers, purpose: d.purpose, budget: d.budgetRange, destination: d.destinationRegion },
        record_id: String(row.id),
      });
    });

    return NextResponse.json({ success: true, id: row.id }, { status: 201 });
  } catch (err) {
    console.error("seeker-discovery API:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
