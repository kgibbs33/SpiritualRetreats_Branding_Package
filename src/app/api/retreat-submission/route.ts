import { listingConsentSchema, recordListingConsent } from "@/lib/listing-consent";
import { NextResponse, after } from "next/server";

import { sendRetreatSubmissionUserConfirmation } from "@/lib/mail/transactional-confirmations";
import { sendTeamSubmissionNotification } from "@/lib/mail/team-notification";
import { publicJsonPostGuards } from "@/lib/request-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { fireFormWebhook } from "@/lib/webhooks";
import {
  retreatSubmissionInsertSchema,
  retreatSubmissionSchema,
} from "@/validation/retreatSubmission";

export const runtime = "nodejs";


export async function POST(request: Request) {
  const blocked = publicJsonPostGuards(request, "retreat-submission");
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
    const consentCheck = listingConsentSchema.safeParse(body);
    if (!consentCheck.success) return NextResponse.json({error: "Please agree to the terms and read the Privacy Policy."}, {status:400});
    const parsed = retreatSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = retreatSubmissionInsertSchema.parse(parsed.data);
    const supabase = createAdminClient();
    const submissionId = await recordListingConsent(supabase, "planner", body);

    const { data: row, error: insertError } = await supabase
      .from("retreat_submissions")
      .insert({
        id: submissionId,
        contact_name:      d.contactName,
        email:             d.email,
        retreat_title:     d.retreatTitle,
        location:          d.location ?? null,
        start_date:        d.startDate || null,
        end_date:          d.endDate || null,
        description:       d.description ?? null,
        capacity:          d.capacity ?? null,
        price_range:       d.priceRange ?? null,
        facilitator_notes: d.facilitatorNotes ?? null,
        category:          d.category ?? [],
        category_other:    d.categoryOther ?? null,
        owner_type:        d.ownerType ?? null,
        environment:       d.environment ?? null,
        duration:          d.duration ?? null,
        status:            "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("retreat_submissions insert:", insertError);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    await supabase.from("events").insert({
      event_type: "retreat_submission_created",
      entity_type: "retreat_submission",
      entity_id: row.id,
      payload: { email: d.email, retreat_title: d.retreatTitle },
    });

    after(async () => {
      try {
        await sendRetreatSubmissionUserConfirmation({
          toEmail: d.email,
          contactName: d.contactName,
          retreatTitle: d.retreatTitle,
          submissionId: String(row.id),
        });
      } catch (confirmErr) {
        console.error("retreat user confirmation mail:", confirmErr);
      }
      try {
        await sendTeamSubmissionNotification({
          formType: "Retreat submission",
          recordId: String(row.id),
          fields: {
            Retreat: d.retreatTitle,
            Contact: d.contactName,
            Email: d.email,
            Location: d.location ?? null,
          },
        });
      } catch (teamErr) {
        console.error("retreat team notification mail:", teamErr);
      }
      await fireFormWebhook({
        form_type: "retreat_submission",
        submitted_at: new Date().toISOString(),
        source_url: "",
        contact: { name: d.contactName, email: d.email },
        data: { terms_accepted: true, marketing_opt_in: consentCheck.data.marketingOptIn, retreatTitle: d.retreatTitle, location: d.location },
        record_id: String(row.id),
      });
    });

    return NextResponse.json({ success: true, id: row.id }, { status: 201 });
  } catch (err) {
    console.error("retreat-submission API:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
