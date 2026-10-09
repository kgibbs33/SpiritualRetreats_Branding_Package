import { NextResponse, after } from "next/server";

import { sendFacilitatorMatchingConfirmation } from "@/lib/mail/transactional-confirmations";
import { sendTeamSubmissionNotification } from "@/lib/mail/team-notification";
import { fireFormWebhook } from "@/lib/webhooks";
import { publicJsonPostGuards } from "@/lib/request-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { facilitatorMatchingSchema } from "@/validation/facilitatorMatching";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = publicJsonPostGuards(request, "facilitator-matching");
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
    const parsed = facilitatorMatchingSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = parsed.data;
    const supabase = createAdminClient();

    const { data: row, error: insertError } = await supabase
      .from("facilitator_matching_requests")
      .insert({
        full_name:               d.fullName.trim(),
        email:                   d.email.trim().toLowerCase(),
        phone:                   d.phone?.trim() || null,
        practice_areas:          d.practiceAreas,
        session_format:          d.sessionFormat ?? null,
        experience_years:        d.experienceYears ?? null,
        retreat_duration_pref:   d.retreatDurationPref,
        setting_preference:      d.settingPreference,
        group_size_preference:   d.groupSizePreference ?? null,
        region_preference:       d.regionPreference?.trim() || null,
        availability_notes:      d.availabilityNotes?.trim() || null,
        compensation_preference: d.compensationPreference ?? null,
        bio:                     d.bio?.trim() || null,
        special_requests:        d.specialRequests?.trim() || null,
        looking_for:             d.lookingFor?.trim() || null,
        hourly_rate_cents:       d.hourlyRateCents ?? null,
        daily_rate_cents:        d.dailyRateCents ?? null,
        promotion_consent:       d.promotionConsent ?? false,
        open_to_work:            d.openToWork ?? true,
        linkedin_url:            d.linkedinUrl?.trim() || null,
        social_urls:             d.socialUrls ?? [],
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("facilitator_matching insert:", insertError);
      return NextResponse.json(
        { error: "Failed to save. Please try again." },
        { status: 500 }
      );
    }

    await supabase.from("events").insert({
      event_type: "facilitator_matching_submitted",
      entity_type: "facilitator_matching_request",
      entity_id: row.id,
      payload: { email: d.email.trim() },
    });

    after(async () => {
      try {
        await sendFacilitatorMatchingConfirmation({
          toEmail: d.email.trim(),
          firstName: d.fullName.trim(),
          responseId: String(row.id),
        });
      } catch (mailErr) {
        console.error("facilitator matching confirmation mail:", mailErr);
      }
      try {
        await sendTeamSubmissionNotification({
          formType: "Facilitator matching",
          recordId: String(row.id),
          fields: { Name: d.fullName.trim(), Email: d.email.trim() },
        });
      } catch (teamErr) {
        console.error("facilitator matching team notification mail:", teamErr);
      }
      try {
        fireFormWebhook({
          form_type: "facilitator_matching",
          submitted_at: new Date().toISOString(),
          source_url: "",
          contact: { name: d.fullName.trim(), email: d.email.trim(), phone: d.phone?.trim() || null },
          data: { practiceAreas: d.practiceAreas, sessionFormat: d.sessionFormat },
          record_id: String(row.id),
        });
      } catch {
        // fire-and-forget — never fail the submission
      }
    });

    return NextResponse.json({ success: true, id: row.id }, { status: 201 });
  } catch (err) {
    console.error("facilitator-matching API:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
