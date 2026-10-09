import { NextResponse, after } from "next/server";

import { sendTeamSubmissionNotification } from "@/lib/mail/team-notification";
import { publicJsonPostGuards } from "@/lib/request-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  venueSubmissionInsertSchema,
  venueSubmissionSchema,
} from "@/validation/venueSubmission";

export const runtime = "nodejs";

const N8N_URL = process.env.N8N_FORM_SUBMISSION_URL;

export async function POST(request: Request) {
  const blocked = publicJsonPostGuards(request, "venue-submission");
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
    const parsed = venueSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const d = venueSubmissionInsertSchema.parse(parsed.data);
    const supabase = createAdminClient();

    const { data: row, error: insertError } = await supabase
      .from("venue_submissions")
      .insert({
        contact_name: d.contactName,
        email: d.email,
        phone: d.phone ?? null,
        venue_name: d.venueName,
        relationship: d.relationship ?? null,
        website: d.website ?? null,
        country: d.country ?? null,
        location: d.location ?? null,
        capacity: d.capacity ?? null,
        bedrooms: d.bedrooms ?? null,
        practice_space: d.practiceSpace ?? null,
        practice_space_details: d.practiceSpaceDetails ?? null,
        catering: d.catering ?? null,
        exclusive_use: d.exclusiveUse ?? null,
        facilities: d.facilities ?? null,
        suitable_retreat_types: d.suitableRetreatTypes ?? null,
        access_notes: d.accessNotes ?? null,
        price_range: d.priceRange ?? null,
        minimum_stay: d.minimumStay ?? null,
        description: d.description ?? null,
        consent: d.consent,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("venue_submissions insert:", insertError);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    await supabase.from("events").insert({
      event_type: "venue_submission_created",
      entity_type: "venue_submission",
      entity_id: row.id,
      payload: { email: d.email, venue_name: d.venueName },
    });

    after(async () => {
      try {
        await sendTeamSubmissionNotification({
          formType: "Venue application",
          recordId: String(row.id),
          fields: {
            Venue: d.venueName,
            Contact: d.contactName,
            Email: d.email,
            Phone: d.phone ?? null,
            Country: d.country ?? null,
            Location: d.location ?? null,
          },
        });
      } catch (teamErr) {
        console.error("venue team notification mail:", teamErr);
      }
      if (N8N_URL) {
        try {
          await fetch(N8N_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              form_type: "venue_submission",
              data: { id: row.id, ...d },
              idempotency_key: `venue-${row.id}-${Date.now()}`,
            }),
          });
        } catch (e) {
          console.error("n8n venue_submission webhook:", e);
        }
      }
    });

    return NextResponse.json({ success: true, id: row.id }, { status: 201 });
  } catch (err) {
    console.error("venue-submission API:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}