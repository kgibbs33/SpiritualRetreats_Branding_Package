import { createHash } from "node:crypto";

import { CONTACT_EMAIL } from "@/lib/constants";

import {
  getBrandedConfirmationFromOrNull,
  sendTransactionalEmail,
} from "@/lib/mail/send-email";
import {
  escapeHtml,
  getPublicBaseUrl,
  wrapBrandedEmail,
} from "@/lib/mail/transactional-templates";

const SUPPORT = CONTACT_EMAIL;

function supportMailto(): string {
  return `mailto:${SUPPORT}?subject=${encodeURIComponent("Re: Treat Yourself — question")}`;
}

async function sendBrandedUserEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
  idempotencyKey?: string;
}): Promise<void> {
  const { idempotencyKey, ...rest } = input;
  await sendTransactionalEmail({
    from: getBrandedConfirmationFromOrNull() ?? undefined,
    replyTo: SUPPORT,
    ...rest,
    ...(idempotencyKey ? { idempotencyKey } : {}),
  });
}

export async function sendContactUserConfirmation(input: {
  toEmail: string;
  name: string;
  inquiryId: string;
}): Promise<void> {
  const { toEmail, name, inquiryId } = input;
  const safe = escapeHtml(name);
  const text = [
    `Hi ${name.trim() || "there"},`,
    "",
    "Thanks for contacting Re: Treat Yourself. We received your message and will get back to you when we can.",
    "",
    `Questions? Email us at ${SUPPORT}`,
    "",
    `— Re: Treat Yourself`,
    getPublicBaseUrl(),
  ].join("\n");

  const inner = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#3d5f3d;">We received your message</p>
    <p style="margin:0 0 12px;">Hi ${safe || "there"},</p>
    <p style="margin:0 0 12px;color:#57534e;">Thanks for reaching out. Our team has your note and will reply when we can.</p>
    <p style="margin:0;color:#57534e;font-size:14px;">If you need anything sooner, you can reach us at <a href="${escapeHtml(supportMailto())}" style="color:#3d5f3d;">${escapeHtml(SUPPORT)}</a>.</p>
  `;

  await sendBrandedUserEmail({
    to: toEmail,
    subject: "We received your message — Re: Treat Yourself",
    text,
    html: wrapBrandedEmail(inner),
    idempotencyKey: `contact-user/${inquiryId}`,
  });
}

export async function sendNewsletterUserConfirmation(toEmail: string): Promise<void> {
  const normalized = toEmail.toLowerCase().trim();
  const idempotencyKey = `newsletter-user/${createHash("sha256").update(normalized).digest("hex")}`;

  const text = [
    "You are on the list.",
    "",
    "We will send occasional updates about retreats, opportunities, and launches from Re: Treat Yourself.",
    "",
    `To reach us: ${SUPPORT}`,
    "",
    getPublicBaseUrl(),
  ].join("\n");

  const inner = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#3d5f3d;">You are subscribed</p>
    <p style="margin:0 0 12px;color:#57534e;">Thanks for joining the Global Retreat Community. We will share updates, free retreat opportunities, and new destination launches when we have news.</p>
    <p style="margin:0;color:#57534e;font-size:14px;">Questions? <a href="${escapeHtml(supportMailto())}" style="color:#3d5f3d;">${escapeHtml(SUPPORT)}</a></p>
  `;

  await sendBrandedUserEmail({
    to: toEmail,
    subject: "You are on the list — Re: Treat Yourself",
    text,
    html: wrapBrandedEmail(inner),
    idempotencyKey,
  });
}

export async function sendSeekerDiscoveryUserConfirmation(input: {
  toEmail: string;
  firstName: string;
  responseId: string;
}): Promise<void> {
  const first = input.firstName.trim().split(/\s+/)[0] || "there";
  const safeFirst = escapeHtml(first);
  const text = [
    `Hi ${first},`,
    "",
    "We received your retreat matching questionnaire. Thank you for sharing how you travel and what you are looking for.",
    "",
    `Questions? ${SUPPORT}`,
    "",
    getPublicBaseUrl(),
  ].join("\n");

  const inner = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#3d5f3d;">We received your questionnaire</p>
    <p style="margin:0 0 12px;">Hi ${safeFirst},</p>
    <p style="margin:0 0 12px;color:#57534e;">Thank you for taking the time to tell us about your retreat preferences. Our team will use your answers to help match you with suitable experiences.</p>
    <p style="margin:0;color:#57534e;font-size:14px;">Questions? <a href="${escapeHtml(supportMailto())}" style="color:#3d5f3d;">${escapeHtml(SUPPORT)}</a></p>
  `;

  await sendBrandedUserEmail({
    to: input.toEmail,
    subject: "We received your questionnaire — Re: Treat Yourself",
    text,
    html: wrapBrandedEmail(inner),
    idempotencyKey: `seeker-user/${input.responseId}`,
  });
}

export async function sendRetreatSubmissionUserConfirmation(input: {
  toEmail: string;
  contactName: string;
  retreatTitle: string;
  submissionId: string;
}): Promise<void> {
  const name = input.contactName.trim().split(/\s+/)[0] || "there";
  const safeName = escapeHtml(name);
  const title = escapeHtml(input.retreatTitle.trim());
  const text = [
    `Hi ${name},`,
    "",
    "We received your retreat submission details. Our team will review and follow up by email when we can.",
    "",
    `Retreat: ${input.retreatTitle.trim()}`,
    "",
    `Questions? ${SUPPORT}`,
    "",
    getPublicBaseUrl(),
  ].join("\n");

  const inner = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#3d5f3d;">We received your retreat details</p>
    <p style="margin:0 0 12px;">Hi ${safeName},</p>
    <p style="margin:0 0 12px;color:#57534e;">Thank you for submitting your retreat information. Our team will review it and follow up by email.</p>
    <p style="margin:0 0 8px;color:#44403c;font-size:15px;"><strong>Retreat:</strong> ${title}</p>
    <p style="margin:0;color:#57534e;font-size:14px;">Questions? <a href="${escapeHtml(supportMailto())}" style="color:#3d5f3d;">${escapeHtml(SUPPORT)}</a></p>
  `;

  await sendBrandedUserEmail({
    to: input.toEmail,
    subject: "We received your retreat details — Re: Treat Yourself",
    text,
    html: wrapBrandedEmail(inner),
    idempotencyKey: `retreat-user/${input.submissionId}`,
  });
}

export async function sendFacilitatorWelcomeEmail(input: {
  toEmail: string;
  firstName: string;
  responseId: string;
}): Promise<void> {
  const first = input.firstName.trim().split(/\s+/)[0] || "there";
  const safeFirst = escapeHtml(first);
  const text = [
    `Hi ${first},`,
    "",
    "Thank you for completing facilitator onboarding with Re: Treat Yourself.",
    "",
    "Our team will review your details and follow up when we can.",
    "",
    `Questions? ${SUPPORT}`,
    "",
    getPublicBaseUrl(),
  ].join("\n");

  const inner = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#3d5f3d;">Welcome, facilitator</p>
    <p style="margin:0 0 12px;">Hi ${safeFirst},</p>
    <p style="margin:0 0 12px;color:#57534e;">Thanks for sharing your practice focus and credentials. We will be in touch about next steps.</p>
    <p style="margin:0;color:#57534e;font-size:14px;">Questions? <a href="${escapeHtml(supportMailto())}" style="color:#3d5f3d;">${escapeHtml(SUPPORT)}</a></p>
  `;

  await sendBrandedUserEmail({
    to: input.toEmail,
    subject: "We received your facilitator profile — Re: Treat Yourself",
    text,
    html: wrapBrandedEmail(inner),
    idempotencyKey: `facilitator-welcome/${input.responseId}`,
  });
}

export async function sendFacilitatorMatchingConfirmation(input: {
  toEmail: string;
  firstName: string;
  responseId: string;
}): Promise<void> {
  const first = input.firstName.trim().split(/\s+/)[0] || "there";
  const safeFirst = escapeHtml(first);
  const text = [
    `Hi ${first},`,
    "",
    "Thank you for submitting your matching request with Re: Treat Yourself.",
    "",
    "Our team will review your availability and practice profile and reach out when a suitable retreat collaboration comes up.",
    "",
    `Questions? ${SUPPORT}`,
    "",
    getPublicBaseUrl(),
  ].join("\n");

  const inner = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#3d5f3d;">We received your matching request</p>
    <p style="margin:0 0 12px;">Hi ${safeFirst},</p>
    <p style="margin:0 0 12px;color:#57534e;">Thanks for sharing your availability and what you are looking for in a retreat collaboration. Our team will be in touch when a suitable opportunity comes up.</p>
    <p style="margin:0;color:#57534e;font-size:14px;">Questions? <a href="${escapeHtml(supportMailto())}" style="color:#3d5f3d;">${escapeHtml(SUPPORT)}</a></p>
  `;

  await sendBrandedUserEmail({
    to: input.toEmail,
    subject: "We received your matching request — Re: Treat Yourself",
    text,
    html: wrapBrandedEmail(inner),
    idempotencyKey: `facilitator-matching/${input.responseId}`,
  });
}

export async function sendMatchNotificationToSeeker(input: {
  toEmail: string;
  firstName: string;
  retreatTitle: string;
  matchId: string;
}): Promise<void> {
  const first = input.firstName.trim().split(/\s+/)[0] || "there";
  const safeFirst = escapeHtml(first);
  const title = escapeHtml(input.retreatTitle.trim());
  const text = [
    `Hi ${first},`,
    "",
    "We identified a retreat experience that may align with what you shared.",
    "",
    `Retreat: ${input.retreatTitle.trim()}`,
    "",
    `Questions? ${SUPPORT}`,
    "",
    getPublicBaseUrl(),
  ].join("\n");

  const inner = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#3d5f3d;">A retreat match for you</p>
    <p style="margin:0 0 12px;">Hi ${safeFirst},</p>
    <p style="margin:0 0 12px;color:#57534e;">Based on your questionnaire, we think this listing may be a fit. The facilitator may reach out separately to coordinate details.</p>
    <p style="margin:0 0 8px;color:#44403c;font-size:15px;"><strong>Retreat:</strong> ${title}</p>
    <p style="margin:0;color:#57534e;font-size:14px;">Questions? <a href="${escapeHtml(supportMailto())}" style="color:#3d5f3d;">${escapeHtml(SUPPORT)}</a></p>
  `;

  await sendBrandedUserEmail({
    to: input.toEmail,
    subject: "A retreat we think you will like — Re: Treat Yourself",
    text,
    html: wrapBrandedEmail(inner),
    idempotencyKey: `match-seeker/${input.matchId}`,
  });
}

export async function sendMatchNotificationToFacilitator(input: {
  toEmail: string;
  firstName: string;
  seekerFirstName: string;
  retreatTitle: string;
  matchId: string;
}): Promise<void> {
  const first = input.firstName.trim().split(/\s+/)[0] || "there";
  const safeFirst = escapeHtml(first);
  const seeker = escapeHtml(input.seekerFirstName.trim() || "A seeker");
  const title = escapeHtml(input.retreatTitle.trim());
  const text = [
    `Hi ${first},`,
    "",
    "We matched a seeker with one of your retreat listings.",
    "",
    `Seeker: ${input.seekerFirstName.trim() || "Questionnaire respondent"}`,
    `Retreat: ${input.retreatTitle.trim()}`,
    "",
    `Questions? ${SUPPORT}`,
    "",
    getPublicBaseUrl(),
  ].join("\n");

  const inner = `
    <p style="margin:0 0 16px;font-size:18px;font-weight:600;color:#3d5f3d;">New seeker match</p>
    <p style="margin:0 0 12px;">Hi ${safeFirst},</p>
    <p style="margin:0 0 12px;color:#57534e;">Someone who completed our questionnaire may be a fit for <strong>${title}</strong>. Their first name for your reference: ${seeker}.</p>
    <p style="margin:0;color:#57534e;font-size:14px;">Reach out when ready, or reply to us at <a href="${escapeHtml(supportMailto())}" style="color:#3d5f3d;">${escapeHtml(SUPPORT)}</a>.</p>
  `;

  await sendBrandedUserEmail({
    to: input.toEmail,
    subject: "New seeker match — Re: Treat Yourself",
    text,
    html: wrapBrandedEmail(inner),
    idempotencyKey: `match-facilitator/${input.matchId}`,
  });
}
