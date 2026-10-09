/**
 * Shared outgoing webhook client for all public forms.
 *
 * Reads FORM_WEBHOOK_URL from env (already set in Vercel).
 * FORM_WEBHOOK_SECRET is sent as X-Webhook-Secret header.
 *
 * CRITICAL: a webhook failure or timeout must NEVER fail or delay the
 * user's submission.  The fetch has an 8 s timeout; non-2xx responses are
 * logged (form_type + status only, no personal data) and treated as soft
 * failures.  The caller should always fire-and-forget (never await this).
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
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(
        `webhook: ${payload.form_type} returned HTTP ${res.status}`
      );
    }
  } catch {
    // Timeout or network error — logged without personal data.
    console.error(`webhook: ${payload.form_type} delivery failed`);
  }
}
