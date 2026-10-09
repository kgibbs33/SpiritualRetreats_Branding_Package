/**
 * Shared outgoing webhook client for all public forms.
 *
 * Reads FORM_WEBHOOK_URL (primary) — already set in Vercel.
 * N8N_FORM_SUBMISSION_URL is kept as a fallback for backward compatibility.
 * Sends the webhook secret as an X-Webhook-Secret header, never in URL/body.
 *
 * Payload: { form_type, submitted_at, source_url, contact, data, record_id }
 *
 * CRITICAL: a failed webhook must NEVER fail the user's submission.
 * Always caught and logged with no personal data.
 */

const WEBHOOK_URL =
  process.env.FORM_WEBHOOK_URL?.trim() ||
  process.env.N8N_FORM_SUBMISSION_URL?.trim() ||
  "";

const WEBHOOK_SECRET =
  process.env.FORM_WEBHOOK_SECRET?.trim() ||
  process.env.N8N_WEBHOOK_SECRET?.trim() ||
  "";

export interface FormWebhookPayload {
  form_type: string;
  submitted_at: string;
  source_url: string;
  contact: {
    name: string;
    email: string;
    phone?: string | null;
  };
  data: Record<string, unknown>;
  record_id: string;
}

export async function fireFormWebhook(
  payload: FormWebhookPayload,
): Promise<void> {
  if (!WEBHOOK_URL) return;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (WEBHOOK_SECRET) {
    headers["X-Webhook-Secret"] = WEBHOOK_SECRET;
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
  } catch {
    console.error("webhook: " + payload.form_type + " delivery failed");
  }
}
