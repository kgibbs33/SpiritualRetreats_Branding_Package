import { NextResponse, after } from "next/server";
import { fireFormWebhook } from "@/lib/webhooks";
import { sendTeamSubmissionNotification } from "@/lib/mail/team-notification";
import { publicJsonPostGuards } from "@/lib/request-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { retreatEnquirySchema } from "@/validation/retreatEnquiry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = publicJsonPostGuards(request, "retreat-enquiry");
  if (blocked) return blocked;

  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    const body = await request.json();
    const parsed = retreatEnquirySchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = parsed.data;
    const supabase = createAdminClient();

    const { data: row, error: insertError } = await supabase
      .from("retreat_enquiries")
      .insert({
        retreat_id: d.retreatId,
        departure_id: d.departureId ?? null,
        kind: d.kind,
        name: d.name,
        email: d.email,
        phone: d.phone ?? null,
        participants: d.participants ?? null,
        message: d.message ?? null,
        utm_source: d.utmSource ?? null,
        utm_medium: d.utmMedium ?? null,
        utm_campaign: d.utmCampaign ?? null,
        referrer: d.referrer ?? null,
        consent: d.consent,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("retreat_enquiries insert:", insertError);
      return NextResponse.json({ error: "Failed to submit. Please try again." }, { status: 500 });
    }

    await supabase.from("events").insert({
      event_type: "retreat_enquiry_submitted",
      entity_type: "retreat_enquiry",
      entity_id: row.id,
      payload: { email: d.email, kind: d.kind },
    });

    after(async () => {
      try {
        await sendTeamSubmissionNotification({
          formType: d.kind === "booking_request" ? "Booking request" : "Retreat enquiry",
          recordId: String(row.id),
          fields: { Name: d.name, Email: d.email, Retreat: d.retreatId },
        });
      } catch (teamErr) {
        console.error("enquiry team mail:", teamErr);
      }
      await fireFormWebhook({
        form_type: d.kind === "booking_request" ? "booking_request" : "retreat_enquiry",
        submitted_at: new Date().toISOString(),
        source_url: "",
        contact: { name: d.name, email: d.email, phone: d.phone ?? null },
        data: { retreatId: d.retreatId, departureId: d.departureId, participants: d.participants, message: d.message, kind: d.kind },
        record_id: String(row.id),
      });
    });

    return NextResponse.json({ success: true, id: row.id }, { status: 201 });
  } catch (err) {
    console.error("retreat-enquiry API:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}