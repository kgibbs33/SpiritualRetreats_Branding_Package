# Mail / Email (SCOPE-008)

**Vault:** `docs/30_infrastructure` · **Last verified:** 2026-07-23
**Related:** [CICD_ENV.md](CICD_ENV.md) · [CPANEL_PASSENGER.md](CPANEL_PASSENGER.md) · [CONTACT_MAIL.md](../10_architecture/CONTACT_MAIL.md) · [ADR-001](../10_architecture/ADR-001-resend-idempotency-retry.md)

Transactional email (form confirmations to users, ops notifications to the team) is sent from the app via `src/lib/mail/`.

## Provider: SMTP (cPanel mailbox)

`MAIL_PROVIDER=auto` resolves to **SMTP** because no `RESEND_API_KEY` is set (Resend would win if it were). Mail goes through the cPanel mail server (Exim) using a real mailbox.

| Setting | Value |
|---------|-------|
| `MAIL_PROVIDER` | `auto` (→ SMTP) |
| `SMTP_HOST` | `mail.retreatyourself.network` (resolves to the app server) |
| `SMTP_PORT` / `SMTP_SECURE` | `587` / `false` (STARTTLS upgrade, `requireTLS`, TLS ≥ 1.2) |
| `SMTP_USER` | `noreply@retreatyourself.network` (real cPanel mailbox) |
| `SMTP_PASSWORD` | the mailbox password (GitHub secret) |
| `MAIL_FROM` | `noreply@retreatyourself.network` — **bare address, see gotcha below** |
| `CONTACT_NOTIFY_TO` | `ops@retreatyourself.network` (team notifications; accepted via cPanel default address) |

The `noreply@retreatyourself.network` mailbox was created in cPanel (possible because `.network` is now the account main domain — see [CPANEL_PASSENGER.md](CPANEL_PASSENGER.md)).

## ⚠️ Gotcha: `MAIL_FROM` must be a bare address

Set `MAIL_FROM` to the **bare email address** (`noreply@retreatyourself.network`), NOT the display-name form `"Re:Treat Yourself" <noreply@…>`.

- The app adds the display name itself: `src/lib/mail/send-email.ts` (`BRAND_MAIL_FROM_DISPLAY` + `resolveSmtpFrom`) produces `"Re: Treat Yourself" <addr>` from whatever address is in `MAIL_FROM`. So bare and quoted are functionally identical.
- The quoted form's `"` and `<>` characters **break the cPanel `.htaccess` `SetEnv` generation** during deploy env injection, which caused a production outage on 2026-06-17. Keep it bare. (It also broke the GitHub Actions `jq` step when interpolated inline — fixed by passing values via a step `env:` block.)

## Where the values live (and which one wins)

| Location | Role |
|----------|------|
| GitHub Actions **Variables** (`MAIL_PROVIDER`, `MAIL_FROM`, `CONTACT_NOTIFY_TO`, `SMTP_HOST/PORT/SECURE/USER`) + **Secret** (`SMTP_PASSWORD`) | Source of truth for production; injected at deploy time |
| `.github/workflows/deploy.yml` "Inject env vars" step | Writes them into the cPanel Node app (CloudLinux selector → `.htaccess` env block) |
| `.env.frankfurt` (local, gitignored) | Local/reference prod config + used for the SMTP test |
| `.env.example` | Documented defaults |

Note: in `.env.frankfurt` `MAIL_FROM` may still be the quoted form for local use — production uses the **bare** GitHub variable.

## Verified working (2026-06-17)

Direct `nodemailer` test using the `.network` mailbox creds:
- `transporter.verify()` → ok (auth + connection)
- `sendMail()` to `noreply@retreatyourself.network` and `ops@retreatyourself.network` → `250 OK` from Exim, `accepted`, `rejected: []`

The SMTP path is proven. **End-to-end confirmed (2026-07-23):** contact form submitted on live production (`retreatyourself.network`), team notification and user confirmation both arrived in `retreatyourself@retreatyourself.network` within seconds. SCOPE-008 complete (issue #9 closed with evidence).

> **Diagnostic note:** `env | grep MAIL` in an SSH shell returns nothing, because Passenger-injected vars are only visible to the Node.js process. To confirm production mail config, read `.htaccess` or use `cloudlinux-selector get` — see [CPANEL_PASSENGER.md](CPANEL_PASSENGER.md).

## Deliverability follow-ups

- Confirm **SPF + DKIM** are published for `retreatyourself.network` (its DNS is on the host nameservers). Without them, mail may land in spam.
- `ops@retreatyourself.network` is accepted via cPanel's default address; consider a real mailbox or forwarder so team notifications land somewhere intentional.

## Contact routing & recipients (SCOPE-009)

Three different addresses are involved in the contact flow, and they currently do **not** align:

| Address | Role | Where set | Exists? |
|---------|------|-----------|---------|
| `retreatyourself@retreatyourself.network` | Main / catch-all inbox | cPanel default address | ✅ real cPanel mailbox — all unrouted mail lands here |
| `noreply@retreatyourself.network` | SMTP sender / `From` | `MAIL_FROM`, `SMTP_USER` | ✅ real cPanel mailbox |
| `ops@retreatyourself.network` | Team/ops notification recipient (current) | `CONTACT_NOTIFY_TO` env | ⚠️ **no dedicated mailbox** — falls through to catch-all (`retreatyourself@`) |
| `grow@retreatyourself.network` | User-facing support address (privacy page + confirmation emails) | `CONTACT_EMAIL` in `src/lib/constants.ts` | ✅ mailbox created 2026-07-23 |

Routing logic:
- **Team notification** (`src/lib/mail/contact-notification.ts`): `process.env.CONTACT_NOTIFY_TO ?? CONTACT_EMAIL` → currently `ops@retreatyourself.network` until `CONTACT_NOTIFY_TO` is updated (see item 3 below, GitHub #135).
- **User confirmation** (`src/lib/mail/transactional-confirmations.ts`): shows `CONTACT_EMAIL` (`grow@retreatyourself.network`, updated 2026-08-09) as the support contact.

**Earlier fix (2026-06-18):** user-facing support moved from the stale `service@retreatyourself.community` to a `.network` address (`src/lib/constants.ts`); privacy page renders it from the constant (mailto), so it can't drift.

### Decision (Andrew, 2026-06-18)

- **Sender + public address:** `grow@retreatyourself.network` (replaces `noreply@`).
- **Team notifications:** `team@retreatyourself.network` (replaces `ops@` — he disliked "ops"/"oops").
- **Delivery:** one **shared inbox** (both forward there) — to be set up.
- `service@` kept only as a fallback if `grow@` proves unworkable.

### How this works WITHOUT creating new mailboxes (interim)

No `grow@`/`team@` mailbox is required for the system to function now:

- **Sending as `grow@`:** keep `SMTP_USER` = the existing **`noreply@retreatyourself.network`** mailbox for SMTP **auth**, and set `MAIL_FROM` = `grow@retreatyourself.network`. The nodemailer `From` header is independent of the auth user (verified via Context7 `/nodemailer/nodemailer`), and cPanel/Exim lets an authenticated mailbox send as any **local `.network`** address. So mail goes out **From `grow@`** with no `grow@` mailbox.
- **Receiving `grow@` / `team@`:** with no dedicated mailbox or forwarder, cPanel's **default address** catches mail to these addresses in the main/system account inbox. Nothing is lost in the interim; it just isn't a dedicated monitored box yet.

### Completed — 2026-07-23

Both mailboxes created via `uapi Email add_pop` (SSH). Passwords stored in `.secrets` (gitignored).

| Mailbox | Status |
|---------|--------|
| `grow@retreatyourself.network` | ✅ Created 2026-07-23 |
| `team@retreatyourself.network` | ✅ Created 2026-07-23 |

**Still to do:**
1. Connect both to the agreed shared inbox (forwarder or mail client config).
2. Send a contact-form test and confirm delivery.
3. Update GitHub Actions Variables: `MAIL_FROM` → `grow@retreatyourself.network`, `CONTACT_NOTIFY_TO` → `team@retreatyourself.network` (GitHub #135).
4. ~~Update `CONTACT_EMAIL` in `src/lib/constants.ts` → `grow@retreatyourself.network`.~~ **Done 2026-08-09.**

## Verify

```bash
# from a checkout with .env.frankfurt present (uses nodemailer):
node -e '/* build transport from SMTP_* and verify()+sendMail() */'   # see git history for the test script
# server side: confirm the mailbox exists
ssh retreatyourself 'uapi Email list_pops | grep noreply@retreatyourself.network'
```
