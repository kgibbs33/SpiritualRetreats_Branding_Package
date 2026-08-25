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
 * Contact form ops notification via SMTP (Nodemailer) or Resend HTTP API.
 *
 * Provider selection: `MAIL_PROVIDER` = `auto` | `resend` | `smtp` | `none`.
 * `from` / `to` are always from env — never from the client JSON.
 * Submitter is **`Reply-To`** (verified-domain `From` + visitor `Reply-To` is deliverability best practice).
 */

export type ContactInquiryMailPayload = {
  inquiryId: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
};

/** RFC5322-friendly Reply-To with display name; strips CR/LF and quotes in name. */
export function formatReplyToDisplayName(name: string, email: string): string {
  const safeName = name
    .replace(/[\r\n"<>\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  const display = safeName || "Contact";
  return `"${display.replace(/"/g, "")}" <${email.trim()}>`;
}

function buildMailBodies(payload: ContactInquiryMailPayload): {
  subject: string;
  text: string;
  html: string;
} {
  const subjectLine = `[Contact] ${payload.subject?.trim() || "(no subject)"}`;
  const safeSubject = payload.subject?.trim() || "(no subject)";
  const mailto = `mailto:${encodeURIComponent(payload.email.trim())}`;
  const text = [
    "New contact inquiry — Re: Treat Yourself",
    `Reference: ${payload.inquiryId}`,
    "",
    `From: ${payload.name}`,
    `Email: ${payload.email}`,
    `Subject: ${safeSubject}`,
    "",
    "Message:",
    payload.message,
    "",
    "Reply in your mail client to respond directly to this person (Reply-To is set to their address).",
  ].join("\n");

  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeSubjectEsc = escapeHtml(safeSubject);
  const safeMsg = escapeHtml(payload.message).replace(/\r\n|\r|\n/g, "<br>");
  const safeId = escapeHtml(payload.inquiryId);

  const inner = `
    <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#8b654d;">Contact form</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:600;color:#3d5f3d;line-height:1.25;">New inquiry</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;border-collapse:separate;border-spacing:0;">
      <tr>
        <td style="padding:16px 18px;background:#f1ede4;border-radius:12px;border:1px solid #e1d3c8;">
          <p style="margin:0 0 12px;font-size:14px;line-height:1.5;color:#57534e;">
            <span style="display:inline-block;min-width:72px;font-weight:600;color:#3d5f3d;">From</span>
            <a href="${escapeHtml(mailto)}" style="color:#3d7c86;font-weight:600;text-decoration:underline;">${safeName}</a>
            <span style="color:#a8a29e;"> · </span><span style="color:#44403c;">${safeEmail}</span>
          </p>
          <p style="margin:0;font-size:14px;line-height:1.5;color:#57534e;">
            <span style="display:inline-block;min-width:72px;font-weight:600;color:#3d5f3d;vertical-align:top;">Subject</span>
            <span style="color:#44403c;">${safeSubjectEsc}</span>
          </p>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#8b654d;">Message</p>
    <div style="margin:0;padding:18px 20px;background:#ffffff;border:1px solid #e1d3c8;border-radius:12px;border-left:4px solid #3d5f3d;">
      <p style="margin:0;font-size:15px;line-height:1.65;color:#222222;">${safeMsg}</p>
    </div>
    <p style="margin:22px 0 0;font-size:12px;line-height:1.55;color:#78716c;">
      Reference <span style="font-family:ui-monospace,Menlo,monospace;color:#44403c;">${safeId}</span>
      · Use <strong style="color:#57534e;">Reply</strong> to reach them at their email.
    </p>
  `;

  const html = wrapBrandedEmail(inner);

  return { subject: subjectLine, text, html };
}

export async function sendContactInquiryMail(
  payload: ContactInquiryMailPayload
): Promise<void> {
  const mailFrom = process.env.MAIL_FROM?.trim();
  // `||` not `??`: a whitespace-only CONTACT_NOTIFY_TO trims to "", which is
  // not nullish — with `??` the fallback never fired and the ops mail was
  // addressed to an empty string. Matches team-notification.ts.
  const mailTo = process.env.CONTACT_NOTIFY_TO?.trim() || CONTACT_EMAIL;

  if (!mailFrom) {
    console.warn(
      "contact mail: MAIL_FROM is unset; skipping email notification"
    );
    await recordMailFailure({
      reason: "no_from",
      to: mailTo,
      subject: "New contact inquiry",
      detail: "MAIL_FROM unset; contact notification skipped",
    });
    return;
  }

  const { subject, text, html } = buildMailBodies(payload);
  const replyTo = formatReplyToDisplayName(payload.name, payload.email);
  const verifiedAddr = extractVerifiedMailboxAddress(mailFrom);
  const fromHeader =
    verifiedAddr != null
      ? formatReplyToDisplayName(payload.name, verifiedAddr)
      : mailFrom;

  try {
    await sendTransactionalEmail({
      from: fromHeader,
      to: mailTo,
      subject,
      text,
      html,
      replyTo,
      idempotencyKey: `contact-ops/${payload.inquiryId}`,
    });
  } catch (err) {
    console.error("contact mail: send failed:", err);
  }
}
