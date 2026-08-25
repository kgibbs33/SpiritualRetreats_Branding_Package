import { CONTACT_EMAIL } from "@/lib/constants";
import { recordMailFailure } from "@/lib/mail/mail-failure";
import {
  extractVerifiedMailboxAddress,
  sendTransactionalEmail,
} from "@/lib/mail/send-email";
import {
  escapeHtml,
  wrapBrandedEmail,
} from "@/lib/mail/transactional-templates";

/**
 * Generic team/ops notification (SCOPE-052): a short heads-up email to
 * `CONTACT_NOTIFY_TO` (fallback `CONTACT_EMAIL`) for every public form
 * submission, so the team is notified regardless of the optional n8n webhook.
 * Non-blocking: failures are logged, never thrown, so a mail hiccup never fails
 * the user's submission. Idempotency-keyed per form + record.
 */
export async function sendTeamSubmissionNotification(input: {
  formType: string;
  recordId: string;
  fields?: Record<string, string | null | undefined>;
}): Promise<void> {
  const mailFrom = process.env.MAIL_FROM?.trim();
  const mailTo = process.env.CONTACT_NOTIFY_TO?.trim() || CONTACT_EMAIL;
  if (!mailFrom) {
    console.warn(
      `team notification (${input.formType}): MAIL_FROM unset; skipping`
    );
    await recordMailFailure({
      reason: "no_from",
      to: mailTo,
      subject: `New ${input.formType} submission`,
      detail: "MAIL_FROM unset; team notification skipped",
    });
    return;
  }

  const rows = Object.entries(input.fields ?? {})
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(([k, v]) => ({ k, v: String(v).trim() }));

  const subject = `New ${input.formType} submission`;
  const text = [
    `A new ${input.formType} submission was received.`,
    "",
    ...rows.map((r) => `${r.k}: ${r.v}`),
    "",
    `Record: ${input.recordId}`,
  ].join("\n");

  const inner =
    `<p style="margin:0 0 12px;color:#57534e;">A new <strong>${escapeHtml(
      input.formType
    )}</strong> submission was received.</p>` +
    (rows.length
      ? `<table style="border-collapse:collapse;font-size:14px;color:#292524;">${rows
          .map(
            (r) =>
              `<tr><td style="padding:2px 12px 2px 0;color:#78716c;">${escapeHtml(
                r.k
              )}</td><td style="padding:2px 0;">${escapeHtml(r.v)}</td></tr>`
          )
          .join("")}</table>`
      : "") +
    `<p style="margin:12px 0 0;color:#a8a29e;font-size:12px;">Record: ${escapeHtml(
      input.recordId
    )}</p>`;

  const fromHeader = extractVerifiedMailboxAddress(mailFrom) ?? mailFrom;
  const slug = input.formType
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    await sendTransactionalEmail({
      from: fromHeader,
      to: mailTo,
      subject,
      text,
      html: wrapBrandedEmail(inner),
      idempotencyKey: `team-${slug}/${input.recordId}`,
    });
  } catch (err) {
    console.error(`team notification (${input.formType}) failed:`, err);
  }
}
