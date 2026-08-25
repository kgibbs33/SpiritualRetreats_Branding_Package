import { createHash } from "node:crypto";

import nodemailer from "nodemailer";
import type SMTPPool from "nodemailer/lib/smtp-pool";
import type { Transporter } from "nodemailer";
import { Resend } from "resend";

import { recordMailFailure } from "@/lib/mail/mail-failure";

// ---------------------------------------------------------------------------
// Module-level singletons — lazy-initialised on first call, not at import time
// ---------------------------------------------------------------------------

let _smtpTransporter: Transporter<SMTPPool.SentMessageInfo> | null = null;
let _resendClient: Resend | null = null;

function getSmtpTransporter(): Transporter<SMTPPool.SentMessageInfo> {
  if (_smtpTransporter) return _smtpTransporter;
  _smtpTransporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    host: process.env.SMTP_HOST!.trim(),
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER!.trim(), pass: process.env.SMTP_PASSWORD! },
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    requireTLS:
      process.env.SMTP_SECURE !== "true" &&
      Number(process.env.SMTP_PORT ?? "587") === 587,
  } as SMTPPool.Options);
  return _smtpTransporter!;
}

function getResendClient(): Resend {
  if (_resendClient) return _resendClient;
  _resendClient = new Resend(process.env.RESEND_API_KEY!.trim());
  return _resendClient;
}

/**
 * Shared transactional mail: Resend or SMTP, same env as contact ops mail.
 */

export type MailProvider = "resend" | "smtp" | "none";

export function resolveMailProvider(): MailProvider {
  const explicit = process.env.MAIL_PROVIDER?.trim().toLowerCase();

  if (explicit === "none") return "none";

  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasSmtp = isSmtpConfigured();

  if (explicit === "resend") {
    if (!hasResend) return "none";
    return "resend";
  }

  if (explicit === "smtp") {
    if (!hasSmtp) return "none";
    return "smtp";
  }

  if (explicit && explicit !== "auto") {
    console.warn(`mail: unknown MAIL_PROVIDER="${explicit}"; using auto`);
  }

  if (hasResend) return "resend";
  if (hasSmtp) return "smtp";
  return "none";
}

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASSWORD
  );
}

/** Resend idempotency keys: max 256 chars, 24h TTL (see ADR-001). */
const IDEMPOTENCY_KEY_MAX = 256;

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** When set, overrides `MAIL_FROM` for this send (same verified mailbox as env; e.g. visitor display name). */
  from?: string;
  replyTo?: string;
  /**
   * Resend only: sent as `Idempotency-Key` header. Omitted for SMTP.
   * Use a stable per-entity value (e.g. `contact-user/{inquiryId}`).
   */
  idempotencyKey?: string;
};

/**
 * Ensures the key fits Resend limits. Long inputs are hashed (still unique per logical key).
 */
export function normalizeIdempotencyKey(raw: string): string {
  const t = raw.trim();
  if (t.length <= IDEMPOTENCY_KEY_MAX) return t;
  const h = createHash("sha256").update(t).digest("hex");
  const prefixed = `sha256/${h}`;
  return prefixed.slice(0, IDEMPOTENCY_KEY_MAX);
}

type ResendErrorShape = {
  message: string;
  statusCode: number | null;
  name: string;
};

function resendErrorRetriable(error: ResendErrorShape): boolean {
  if (
    error.name === "concurrent_idempotent_requests" ||
    error.name === "invalid_idempotency_key" ||
    error.name === "invalid_idempotent_request"
  ) {
    return false;
  }
  if (error.statusCode === 429) return true;
  if (error.statusCode != null && error.statusCode >= 500) return true;
  if (
    error.name === "internal_server_error" ||
    error.name === "application_error"
  ) {
    return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getMailFromOrNull(): string | null {
  const v = process.env.MAIL_FROM?.trim();
  return v || null;
}

/**
 * Returns the mailbox address inside `MAIL_FROM` (`Name <addr>` or bare `addr`).
 * Used so operator notifications can set From display name to the visitor while
 * keeping the envelope address on your verified domain (Resend-friendly).
 */
export function extractVerifiedMailboxAddress(mailFromHeader: string): string | null {
  const t = mailFromHeader.trim();
  const angle = t.match(/<([^>]+)>/);
  if (angle?.[1]) {
    const addr = angle[1].trim();
    if (addr.includes("@")) return addr;
  }
  if (/^[^\s<>]+@[^\s<>]+$/.test(t)) return t;
  return null;
}

/** Display name for user-facing receipts; matches site / layout branding. */
const BRAND_MAIL_FROM_DISPLAY = "Re: Treat Yourself";

/**
 * `MAIL_FROM` with a fixed branded display name on the verified mailbox.
 * Resend: `from` supports `"Name <email@domain.com>"` on a verified domain.
 */
export function formatBrandedMailFrom(mailFromHeader: string): string {
  const t = mailFromHeader.trim();
  const addr = extractVerifiedMailboxAddress(t);
  if (!addr) return t;
  return `"${BRAND_MAIL_FROM_DISPLAY}" <${addr}>`;
}

/** Same mailbox as `MAIL_FROM`, shown to recipients as “Re: Treat Yourself”. */
export function getBrandedConfirmationFromOrNull(): string | null {
  const raw = getMailFromOrNull();
  if (!raw) return null;
  return formatBrandedMailFrom(raw);
}

export async function sendTransactionalEmail(
  input: SendEmailInput
): Promise<void> {
  const provider = resolveMailProvider();
  if (provider === "none") {
    // Previously a bare `return` — indistinguishable from a successful send.
    await recordMailFailure({
      reason: "provider_none",
      to: input.to,
      subject: input.subject,
      idempotencyKey: input.idempotencyKey,
      detail: "MAIL_PROVIDER resolved to none (no RESEND_API_KEY, no complete SMTP config)",
    });
    return;
  }

  const { to, subject, text, html, replyTo } = input;
  const from = input.from?.trim() || getMailFromOrNull();
  if (!from) {
    console.warn("mail: MAIL_FROM unset; skipping send");
    await recordMailFailure({
      reason: "no_from",
      to,
      subject,
      idempotencyKey: input.idempotencyKey,
      detail: "MAIL_FROM unset and no per-send from override",
    });
    return;
  }

  if (provider === "resend") {
    const resend = getResendClient();
    const payload = {
      from,
      to: [to],
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    };
    const requestOpts = input.idempotencyKey
      ? {
          idempotencyKey: normalizeIdempotencyKey(input.idempotencyKey),
        }
      : undefined;

    const backoffMs = [1000, 2000, 4000] as const;
    let lastMessage = "Resend send failed";

    for (let attempt = 0; attempt < 4; attempt++) {
      if (attempt > 0) {
        await sleep(backoffMs[attempt - 1] ?? 4000);
      }
      const { error } = await resend.emails.send(payload, requestOpts);
      if (!error) return;
      lastMessage = error.message;
      if (!resendErrorRetriable(error)) {
        await recordMailFailure({
          reason: "resend_error",
          to,
          subject,
          provider,
          idempotencyKey: input.idempotencyKey,
          detail: error.message,
        });
        throw new Error(error.message);
      }
    }

    await recordMailFailure({
      reason: "resend_error",
      to,
      subject,
      provider,
      idempotencyKey: input.idempotencyKey,
      detail: lastMessage,
    });
    throw new Error(lastMessage);
  }

  const transporter = getSmtpTransporter();
  let info: Awaited<ReturnType<typeof transporter.sendMail>>;
  try {
    info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
  } catch (err) {
    await recordMailFailure({
      reason: "smtp_error",
      to,
      subject,
      provider,
      idempotencyKey: input.idempotencyKey,
      detail: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }

  // Nodemailer resolves (does not reject) on a PARTIAL failure: some recipients
  // can be in `info.rejected` while the promise still fulfils. Without this
  // check a rejected recipient is indistinguishable from a delivered one.
  if (Array.isArray(info?.rejected) && info.rejected.length > 0) {
    await recordMailFailure({
      reason: "smtp_rejected",
      to,
      subject,
      provider,
      idempotencyKey: input.idempotencyKey,
      detail: `rejected=${JSON.stringify(info.rejected)} response=${String(
        info.response ?? ""
      ).slice(0, 300)}`,
    });
  }
}

