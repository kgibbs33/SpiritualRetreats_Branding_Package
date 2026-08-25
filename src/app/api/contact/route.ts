import { NextResponse, after } from "next/server";

import { sendContactUserConfirmation } from "@/lib/mail/transactional-confirmations";
import { sendContactInquiryMail } from "@/lib/mail/contact-notification";
import { publicJsonPostGuards } from "@/lib/request-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { contactSchema } from "@/validation/contact";

/** Nodemailer / Resend require Node.js (not Edge). */
export const runtime = "nodejs";

const N8N_URL = process.env.N8N_FORM_SUBMISSION_URL;

export async function POST(request: Request) {
  const blocked = publicJsonPostGuards(request, "contact");
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

    const result = contactSchema.safeParse(body);
    if (!result.success) {
      const first = result.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // SCOPE-085: result.data is already validated by contactSchema; the honeypot
    // `company` is simply not destructured here (never reaches DB/mail), so the
    // second contactInsertSchema.parse() was a redundant re-validation.
    const { name, email, subject, message } = result.data;

    const supabase = createAdminClient();

    const { data: inquiry, error: insertError } = await supabase
      .from("contact_inquiries")
      .insert({
        name,
        email,
        subject: subject || null,
        message,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Contact insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save your message. Please try again." },
        { status: 500 }
      );
    }

    await supabase.from("events").insert({
      event_type: "contact_submitted",
      entity_type: "contact_inquiry",
      entity_id: inquiry.id,
      payload: { name, email, subject },
    });

    after(async () => {
      try {
        await sendContactInquiryMail({
          inquiryId: String(inquiry.id),
          name,
          email,
          subject: subject ?? null,
          message,
        });
      } catch (mailErr) {
        console.error("contact inquiry mail:", mailErr);
      }
      try {
        await sendContactUserConfirmation({
          toEmail: email,
          name,
          inquiryId: String(inquiry.id),
        });
      } catch (confirmErr) {
        console.error("contact user confirmation mail:", confirmErr);
      }
      if (N8N_URL) {
        const idempotencyKey = `contact-${inquiry.id}-${Date.now()}`;
        try {
          await fetch(N8N_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              form_type: "contact",
              data: { name, email, subject, message, id: inquiry.id },
              idempotency_key: idempotencyKey,
            }),
          });
        } catch (webhookErr) {
          console.error("n8n webhook error:", webhookErr);
        }
      }
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
