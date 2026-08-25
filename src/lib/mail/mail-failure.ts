import { createAdminClient } from "@/lib/supabase/admin";

export type MailFailureReason =
  | "provider_none"
  | "no_from"
  | "no_recipient"
  | "smtp_error"
  | "smtp_rejected"
  | "resend_error";

export type MailFailureInput = {
  reason: MailFailureReason;
  to: string;
  subject: string;
  provider?: string;
  idempotencyKey?: string;
  detail?: string;
};

/**
 * Records a mail delivery failure as an `events` row so it is durable and
 * queryable, instead of vanishing into a Passenger process log nobody reads.
 *
 * `events.event_type` is plain text with no CHECK constraint
 * (supabase/migrations/20240218000000_events.sql), so this needs no migration.
 *
 * MUST NEVER THROW: this runs inside error paths and inside `after()`
 * callbacks. A failure to record a failure is logged and swallowed.
 */
export async function recordMailFailure(input: MailFailureInput): Promise<void> {
  console.error(
    `mail failure [${input.reason}] to=${input.to} subject="${input.subject}": ${
      input.detail ?? "(no detail)"
    }`
  );
  try {
    const supabase = createAdminClient();
    await supabase.from("events").insert({
      event_type: "mail_delivery_failed",
      entity_type: "email",
      payload: {
        reason: input.reason,
        to: input.to,
        subject: input.subject,
        provider: input.provider ?? null,
        idempotency_key: input.idempotencyKey ?? null,
        detail: input.detail ? input.detail.slice(0, 2000) : null,
        at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("mail failure: could not record events row:", err);
  }
}
