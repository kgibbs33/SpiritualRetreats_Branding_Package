import { NextResponse, after } from "next/server";

import {
  sendFacilitatorWelcomeEmail,
} from "@/lib/mail/transactional-confirmations";
import { sendTeamSubmissionNotification } from "@/lib/mail/team-notification";
import { publicJsonPostGuards } from "@/lib/request-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { facilitatorOnboardingSchema } from "@/validation/facilitatorOnboarding";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = publicJsonPostGuards(request, "facilitator-onboarding");
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
    const parsed = facilitatorOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = parsed.data;
    const supabase = createAdminClient();

    const { data: row, error: insertError } = await supabase
      .from("facilitator_onboarding_responses")
      .insert({
        full_name: d.fullName.trim(),
        email: d.email.trim().toLowerCase(),
        phone: d.phone?.trim() || null,
        practice_areas: d.practiceAreas ?? [],
        city: d.city?.trim() || null,
        region: d.region?.trim() || null,
        country: d.country?.trim() || null,
        website_url: d.websiteUrl || null,
        linkedin_url: d.linkedinUrl || null,
        instagram_url: d.instagramUrl || null,
        practice_focus: d.practiceFocus?.trim() || null,
        credentials: d.credentials?.trim() || null,
        message: d.message?.trim() || null,
        photo_path: d.photoPath?.trim() || null,
        cv_path: d.cvPath?.trim() || null,
        referrals: d.referrals && d.referrals.length > 0 ? d.referrals : null,
        referral_consent: Boolean(d.referralConsent),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("facilitator_onboarding insert:", insertError);
      return NextResponse.json(
        { error: "Failed to save. Please try again." },
        { status: 500 }
      );
    }

    await supabase.from("events").insert({
      event_type: "facilitator_onboarding_submitted",
      entity_type: "facilitator_onboarding_response",
      entity_id: row.id,
      payload: { email: d.email.trim() },
    });

    after(async () => {
      try {
        await sendFacilitatorWelcomeEmail({
          toEmail: d.email.trim(),
          firstName: d.fullName.trim(),
          responseId: String(row.id),
        });
      } catch (confirmErr) {
        console.error("facilitator welcome mail:", confirmErr);
      }
      try {
        await sendTeamSubmissionNotification({
          formType: "Facilitator onboarding",
          recordId: String(row.id),
          fields: { Name: d.fullName.trim(), Email: d.email.trim() },
        });
      } catch (teamErr) {
        console.error("facilitator team notification mail:", teamErr);
      }
    });

    return NextResponse.json({ success: true, id: row.id }, { status: 201 });
  } catch (err) {
    console.error("facilitator-onboarding API:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
