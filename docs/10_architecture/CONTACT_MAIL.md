# Contact and transactional outbound email

**Purpose:** Describe how public form APIs send **operator notifications** and **user receipt/confirmation** messages after successful writes, without blocking the user if mail fails.

**Code (shared send path):** `src/lib/mail/send-email.ts` — `resolveMailProvider()`, `sendTransactionalEmail()` (Resend + SMTP; requires explicit `text` and `html`).

**Operator contact notify:** `src/lib/mail/contact-notification.ts` — from `src/app/api/contact/route.ts` after `contact_inquiries` insert and event log.

**User confirmations:** `src/lib/mail/transactional-confirmations.ts` + `transactional-templates.ts` — paired plain text + branded HTML (logo via `NEXT_PUBLIC_APP_URL` + `/images/logo-transparent.png`). Wired from contact, newsletter (new row only), seeker-discovery, and retreat-submission routes after successful persistence.

---

## Providers (both supported)

| Mechanism | When it runs | Typical use |
|-----------|----------------|-------------|
| **Resend** (HTTP API) | `MAIL_PROVIDER` is `resend`, or `auto` with `RESEND_API_KEY` set | Transactional API; no SMTP firewall issues; domain verification in Resend dashboard. |
| **SMTP** (Nodemailer) | `MAIL_PROVIDER` is `smtp`, or `auto` with SMTP env complete and no Resend key | cPanel **Outgoing Server**, Google Workspace SMTP, etc. |

References: [Resend send API](https://resend.com/docs/api-reference/emails/send-email); Nodemailer SMTP + TLS ([STARTTLS on 587](https://github.com/nodemailer/nodemailer), implicit TLS on 465).

---

## `MAIL_PROVIDER`

| Value | Behavior |
|-------|----------|
| `auto` *(default if unset)* | If `RESEND_API_KEY` is set → Resend. Else if `SMTP_HOST` + `SMTP_USER` + `SMTP_PASSWORD` → SMTP. Else skip mail. |
| `resend` | Resend only; logs and skips if `RESEND_API_KEY` missing. |
| `smtp` | SMTP only; logs and skips if SMTP env incomplete. |
| `none` | Never send mail from this path (n8n webhook unchanged). |

Explicit `resend` / `smtp` **do not** fall back to the other provider.

---

## Addressing: From, To, Reply-To

| Role | Source | Notes |
|------|--------|--------|
| **From** | `MAIL_FROM` env (verified mailbox) with a **quoted display name** | Resend accepts `"Name <email@domain.com>"` on a verified domain ([send API](https://resend.com/docs/api-reference/emails/send-email)). **Operator** contact mail uses display name = submitter. **User confirmations** use display name **Re: Treat Yourself** on the same mailbox. The **address** is always parsed from `MAIL_FROM` (never client-supplied). |
| **To (operator)** | `CONTACT_NOTIFY_TO` or default `CONTACT_EMAIL` | Fixed ops inbox; never from request body. |
| **Reply-To (visitor)** | Parsed submitter email (contact) | Lets operators reply in-thread to the visitor. Encoded as `"Display Name" <email>` when safe (`formatReplyToDisplayName` in `contact-notification.ts`). |

User-facing confirmations use **To** = submitter email, **From** = `"Re: Treat Yourself" <mailbox-from-MAIL_FROM>`, and **Reply-To** = site `CONTACT_EMAIL` so replies go to support.

---

## Environment variables

**Shared**

- **`MAIL_FROM`** — Required to send any mail from these paths. Format `Name <email@domain.com>` or plain address. Must be allowed by the provider (Resend verified domain; SMTP mailbox must exist).
- **`CONTACT_NOTIFY_TO`** — Optional. Defaults to `CONTACT_EMAIL` in `src/lib/constants.ts`. **Operator** inbox for contact notifications only.
- **`NEXT_PUBLIC_APP_URL`** — Used for absolute image URLs and links in confirmation HTML. Set in production to your public `https://` origin (no trailing slash required; code normalizes).

**Public POST abuse controls** (see `src/lib/rate-limit.ts`, `src/lib/request-guards.ts`)

- **`RATE_LIMIT_WINDOW_MS`** — Sliding window length in ms (default `60000`).
- **`RATE_LIMIT_MAX`** — Max requests per client IP per window per route (default `30`, capped at 500 in code). **In-memory** per Node process; behind multiple instances each process has its own counter (document for ops).
- **`DISABLE_SEC_FETCH_SITE_GUARD`** — Set to `true` to skip rejecting `Sec-Fetch-Site: cross-site` on the guarded JSON POST routes (useful for curl/Postman). Browsers sending same-origin or same-site POSTs keep normal behavior; missing header is allowed.

**Resend**

- **`RESEND_API_KEY`** — API key (`re_…`).

**SMTP**

- **`SMTP_HOST`**, **`SMTP_USER`**, **`SMTP_PASSWORD`**
- **`SMTP_PORT`** — Usually `587` (submission + STARTTLS) or `465` (SSL).
- **`SMTP_SECURE`** — `true` for port **465** (implicit TLS); **`false`** for **587** (STARTTLS). The app sets `requireTLS: true` when using port 587 with `secure: false` (Nodemailer recommendation for STARTTLS).

### Hetzner dev vs cPanel production

Some networks block outbound **465**. Use **587** + `SMTP_SECURE=false` there. Production on cPanel often documents **465** + SSL — set **`SMTP_SECURE=true`** and **`SMTP_PORT=465`**.

---

## Failure behavior

Operator mail, user confirmations, and n8n failures are **logged only** where the product path already returns success after the DB write; the API still returns **201** (or the route’s success status) so the submitter is not blocked by downstream mail.

User confirmations are **not** sent when validation fails, rate limit returns **429**, or `Sec-Fetch-Site` guard returns **403**.

---

## Forms hardening (server)

Public JSON POST handlers for **contact**, **newsletter**, **seeker-discovery**, and **retreat-submission** call `publicJsonPostGuards` first (rate limit, then optional `Sec-Fetch-Site` check).

Optional honeypot: body field **`company`** must be empty (Zod `.max(0)`). Client forms include a visually hidden field named `company` for real users; bots that fill it get **400**.

---

## Resend idempotency and retries

When `MAIL_PROVIDER` resolves to **Resend**, [`sendTransactionalEmail`](../../src/lib/mail/send-email.ts) sends an optional **`Idempotency-Key`** (per Resend: max **256** characters, **24h** dedupe window). Keys are stable per logical message (e.g. `contact-user/{inquiryId}`, `newsletter-user/{sha256(email)}`). On **429** or **5xx** / selected application errors, the client performs a **bounded retry** (four attempts, backoff 1s / 2s / 4s). See [`ADR-001-resend-idempotency-retry.md`](ADR-001-resend-idempotency-retry.md).

---

## Newsletter compliance

**Current product choice:** **Single opt-in** with an immediate **receipt** email on first successful subscribe (HTTP 201). Duplicate email (unique constraint) returns success without sending another confirmation. **Double opt-in** (token + confirm link + `confirmed_at`) is **not** implemented; add it if GDPR or list-hygiene policy requires explicit confirmation before marketing sends.

---

## n8n

`N8N_FORM_SUBMISSION_URL` remains optional and runs **after** the mail attempt. Workflows can still send mail or duplicate notifications; avoid duplicate operator emails if both SMTP/Resend and n8n send.

---

## GitHub Actions / cPanel deploy

Inject `MAIL_*`, `RESEND_API_KEY`, and `SMTP_*` into the Node app environment alongside existing secrets if you want mail in production. The workflow file does not add these by default — extend `ENV_JSON` in `.github/workflows/deploy.yml` when ready.
