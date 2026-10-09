import { NextResponse, after } from "next/server";

import { sendNewsletterUserConfirmation } from "@/lib/mail/transactional-confirmations";
import { sendTeamSubmissionNotification } from "@/lib/mail/team-notification";
import { fireFormWebhook } from "@/lib/webhooks";
import { publicJsonPostGuards } from "@/lib/request-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { newsletterSchema } from "@/validation/newsletter";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = publicJsonPostGuards(request, "newsletter");
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
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.flatten().fieldErrors.email?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const supabase = createAdminClient();
    const email = parsed.data.email.toLowerCase().trim();
    const { data: newRow, error } = await supabase
      .from("newsletter_subscriptions")
      .insert({ email })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { success: true, alreadySubscribed: true },
          { status: 200 }
        );
      }
      console.error("newsletter insert:", error);
      return NextResponse.json(
        { error: "Could not subscribe right now. Please try again." },
        { status: 500 }
      );
    }

    await supabase.from("events").insert({
      event_type: "newsletter_subscribed",
      entity_type: "newsletter_subscription",
      entity_id: newRow.id,
      payload: { email },
    });

    after(async () => {
      try {
        await sendNewsletterUserConfirmation(email);
      } catch (confirmErr) {
        console.error("newsletter user confirmation mail:", confirmErr);
      }
      try {
        await sendTeamSubmissionNotification({
          formType: "Newsletter signup",
          recordId: newRow?.id || email,
          fields: { Email: email },
        });
      } catch (teamErr) {
        console.error("newsletter team notification mail:", teamErr);
      }
      try {
        fireFormWebhook({
          form_type: "newsletter",
          submitted_at: new Date().toISOString(),
          source_url: "",
          contact: { name: "", email },
          data: {},
          record_id: newRow?.id || email,
        });
      } catch {
        // fire-and-forget — never fail the submission
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("newsletter API:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
