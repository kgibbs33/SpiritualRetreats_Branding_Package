/**
 * Branded HTML + plain text for user-facing transactional email.
 * Inline styles only; logo via absolute HTTPS URL (email clients).
 */

const BRAND = {
  forest: "#3d5f3d",
  forestHover: "#345834",
  warmBrown: "#8b654d",
  cream: "#f1ede4",
  beige: "#e1d3c8",
  foreground: "#222222",
  muted: "#57534e",
} as const;

export function getPublicBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "https://localhost";
  return raw.replace(/\/+$/, "");
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function wrapBrandedEmail(innerHtml: string): string {
  const base = getPublicBaseUrl();
  const logoUrl = `${base}/brand/lpr-emblem.png`;
  const font =
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:${BRAND.cream};font-family:${font};color:${BRAND.foreground};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.cream};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid ${BRAND.beige};overflow:hidden;">
          <tr>
            <td style="padding:28px 24px 16px;text-align:center;background:${BRAND.cream};">
              <img src="${logoUrl}" width="180" height="48" alt="Light Path Retreats" style="display:inline-block;max-width:180px;height:auto;border:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 32px;font-size:16px;line-height:1.55;color:${BRAND.foreground};">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:${BRAND.forest};text-align:center;font-size:12px;color:#f5f5f4;line-height:1.5;">
              <a href="${escapeHtml(base)}" style="color:#e7e5e4;text-decoration:underline;">Visit our site</a>
              &nbsp;·&nbsp;Light Path Retreats
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function primaryButtonHtml(href: string, label: string): string {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);
  return `<p style="margin:24px 0 0;text-align:center;">
    <a href="${safeHref}" style="display:inline-block;padding:14px 28px;background:${BRAND.forest};color:#ffffff;text-decoration:none;border-radius:12px;font-weight:600;">${safeLabel}</a>
  </p>`;
}
