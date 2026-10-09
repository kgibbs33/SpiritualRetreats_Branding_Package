import { NextResponse, after } from "next/server";

import { sendSeekerDiscoveryUserConfirmation } from "@/lib/mail/transactional-confirmations";
import { sendTeamSubmissionNotification } from "@/lib/mail/team-notification";
import { fireFormWebhook } from "@/lib/webhooks";
import { publicJsonPostGuards } from "@/lib/request-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  homeQuickCaptureInsertSchema,
  homeQuickCaptureSchema,
} from "@/validation/homeQuickCapture";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // SCOPE-097: dedicated rate-limit bucket — must not share the seeker-discovery
  // window, or homepage captures and the full discovery form throttle each other.
  const blocked = publicJsonPostGuards(request, "home-quick-capture");
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
    const parsed = homeQuickCaptureSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = homeQuickCaptureInsertSchema.parse(parsed.data);
    const supabase = createAdminClient();

    const { data: row, error: insertError } = await supabase
      .from("seeker_discovery_responses")
      .insert({
        full_name: d.fullName,
        email: d.email,
        phone_whatsapp: d.phoneWhatsapp ?? null,
        travel_dates: d.travelDates ?? null,
        destination_region: d.destinationRegion ?? null,
        budget_range: d.budgetRange ?? null,
        purpose: d.purpose ?? null,
        answers: {
          source: "homepage-quick-capture",
          capturedAt: new Date().toISOString(),
        },
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("home-quick-capture insert:", insertError);
      return NextResponse.json(
        { error: "Failed to save. Please try again." },
        { status: 500 }
      );
    }

    await supabase.from("events").insert({
      event_type: "seeker_discovery_submitted",
      entity_type: "seeker_discovery_response",
      entity_id: row.id,
      payload: {
        email: d.email,
        source: "homepage-quick-capture",
      },
    });

    // Mirrors api/seeker-discovery: both sends are deferred with after() so a
    // mail outage can never turn a saved lead into an HTTP 500, and each is
    // caught independently so one failure does not suppress the other.
    after(async () => {
      try {
        await sendSeekerDiscoveryUserConfirmation({
          toEmail: d.email,
          firstName: d.fullName,
          responseId: String(row.id),
        });
      } catch (confirmErr) {
        console.error("home-quick-capture user confirmation mail:", confirmErr);
      }
      try {
        await sendTeamSubmissionNotification({
          formType: "Homepage quick capture",
          recordId: String(row.id),
          fields: {
            Name: d.fullName,
            Email: d.email,
            Phone: d.phoneWhatsapp ?? null,
            Dates: d.travelDates ?? null,
            Region: d.destinationRegion ?? null,
            Budget: d.budgetRange ?? null,
            Purpose: d.purpose ?? null,
          },
        });
      } catch (teamErr) {
        console.error("home-quick-capture team notification mail:", teamErr);
      }
      try {
        fireFormWebhook({
          form_type: "home_quick_capture",
          submitted_at: new Date().toISOString(),
          source_url: "",
          contact: { name: d.fullName, email: d.email, phone: d.phoneWhatsapp ?? null },
          data: { purpose: d.purpose, budget: d.budgetRange, destination: d.destinationRegion },
          record_id: String(row.id),
        });
      } catch {
        // fire-and-forget — never fail the submission
      }
    });

    return NextResponse.json({ success: true, id: row.id }, { status: 201 });
  } catch (err) {
    console.error("home-quick-capture API:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
