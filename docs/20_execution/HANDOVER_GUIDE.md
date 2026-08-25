# Handover guide

**Audience:** the team receiving and operating this codebase.
**Purpose:** what the system is made of, how to run it day to day, and how the admin panel and operator APIs work. Real secret values are transferred separately via a secure channel (password manager) — never in this repository.

## 1. Technical asset inventory

Most of what a new operator needs is discoverable directly from this repository.

| System | Known facts (in-repo) | Source |
| --- | --- | --- |
| **Supabase** | Project ref **`ruzxlccdoywshavwtulc`**, region **eu-central-1 (Frankfurt)**, URL `https://ruzxlccdoywshavwtulc.supabase.co`. Private storage bucket **`facilitator-media`**. | `.env.public`, `docs/30_infrastructure/SUPABASE_EU.md`, `STORAGE.md` |
| **Mail** | `MAIL_PROVIDER=auto` (Resend → SMTP fallback); SMTP `mail.retreatyourself.network:587` STARTTLS. Public support address: `grow@retreatyourself.network`. | `docs/10_architecture/CONTACT_MAIL.md`, `docs/30_infrastructure/MAIL.md` |
| **Hosting / deploy** | cPanel + **CloudLinux Passenger**, custom `app.js`; server IP `69.72.149.237`; deploys over SSH to `~/apps/<APP_NAME>`, CloudLinux `nodevenv/…/24`; runtime env injected via **CloudLinux Selector**. | `docs/30_infrastructure/CPANEL_PASSENGER.md`, `app.js` |
| **CI/CD** | GitHub Actions drives build, migration, and deploy on every push to `main`. Variable/secret *names* (not values) are documented in-repo. | `docs/30_infrastructure/CICD_ENV.md` |
| **Domains** | `retreatyourself.network` (canonical) + `.host` → owners, `.expert`/`.exchange` → facilitator portal. | `docs/30_infrastructure/DOMAINS.md` |
| **DNS** | `.network`: nameservers via the hosting provider; apex `A 69.72.149.237`. `.host`/`.expert`/`.exchange`: Namecheap BasicDNS. | `docs/30_infrastructure/DNS.md` |
| **TLS** | Let's Encrypt via cPanel AutoSSL. | `docs/30_infrastructure/TLS_SSL.md` |
| **n8n** | Optional. Wired via `N8N_FORM_SUBMISSION_URL` / `N8N_URL` + a webhook secret; the app no-ops if the URL is unset. | `docs/30_infrastructure/`, `docs/10_architecture/N8N_AUTOMATION_MATRIX.md` |
| **Admin panel** | URL: **`https://retreatyourself.network/admin/login`**. Single shared password. Covers facilitator vetting, retreat listings, matches, and seeker/facilitator responses. Full usage guide: §4 below. | `src/app/admin/`, `src/lib/admin/auth.ts` |
| **Data model / features** | Full code ↔ feature ↔ migration matrix. | `FEATURE_IMPLEMENTATION_STATUS.md`, `docs/10_architecture/DATA_MODEL.md`, `supabase/migrations/` |

## 1b. Email mailboxes

**Agreed addresses:** `grow@retreatyourself.network` = sender + public contact; `team@retreatyourself.network` = internal team notifications; both intended to eventually forward to one shared inbox.

The system works without a dedicated `grow@`/`team@` mailbox: sending as `grow@` uses the existing `noreply@` mailbox for SMTP auth (cPanel lets an authenticated mailbox send as any local address on the domain), and mail to `grow@`/`team@` with no dedicated mailbox is caught by cPanel's default address.

| Address | Purpose |
| ------- | ------- |
| `noreply@retreatyourself.network` | SMTP auth mailbox (sending) |
| `grow@retreatyourself.network` | Sender + public contact |
| `team@retreatyourself.network` | Team notifications |

Technical reference: [`docs/30_infrastructure/MAIL.md`](../30_infrastructure/MAIL.md) (contact routing & recipients).

## 2. Runbooks

- **Deploy:** [`docs/DEPLOYMENT.md`](../DEPLOYMENT.md)
- **Mail behavior:** [`docs/10_architecture/CONTACT_MAIL.md`](../10_architecture/CONTACT_MAIL.md)

## 3. Architecture SSOT

| Topic | Document |
| ----- | -------- |
| Feature ↔ code matrix | [`FEATURE_IMPLEMENTATION_STATUS.md`](FEATURE_IMPLEMENTATION_STATUS.md) |
| n8n vs app automation | [`docs/10_architecture/N8N_AUTOMATION_MATRIX.md`](../10_architecture/N8N_AUTOMATION_MATRIX.md) |
| Data model | [`docs/10_architecture/DATA_MODEL.md`](../10_architecture/DATA_MODEL.md) |

## 4. Admin & operator access

**Admin UI:** go to **`/admin/login`** and enter the operator secret value as the password (the whole admin area uses this single shared secret — there are no per-user accounts). The admin dashboard (`/admin`) covers facilitator responses/vetting, retreats, matches, and seeker responses.

### 4a. Operator APIs (manual publishing & matching)

- **`POST /api/operator/publish-retreat-submission`** — JSON `{ "submissionId": "<uuid>" }`; promotes an approved intake submission to `retreats` and revalidates the relevant cache tags. Publish runs through an atomic Postgres RPC (`publish_retreat_submission`), not separate unwrapped DB calls.
- **`POST /api/operator/create-match`** — JSON body per [`src/validation/operatorPublish.ts`](../../src/validation/operatorPublish.ts); creates `matches` rows and sends seeker/facilitator mail.

Both require the operator secret on the server and caller auth via `Authorization: Bearer …` or `x-operator-secret`.

Example (curl):

```bash
curl -sS -X POST "$ORIGIN/api/operator/publish-retreat-submission" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPERATOR_SECRET" \
  -d '{"submissionId":"YOUR_SUBMISSION_UUID"}'
```

## 4b. Facilitator vetting workflow

**Where:** Admin → **Facilitator Responses** (`/admin/facilitator-responses`), open a submission with **View**.

**Lifecycle — a facilitator is never public until vetted:**

```
Pending  ──vet (checklist)──▶  Vetted  ──publish──▶  Published
   │                              │                      │
   └────────── Reject ◀───────────┴──────────────────────┘   (Reset returns a row to Pending)
```

| State | Meaning | What you can do |
| ----- | ------- | --------------- |
| **Pending** | New submission, not yet checked | Complete the checklist → **Vet & approve**; or **Reject** |
| **Vetted** | Passed the checklist; safe to list | **Publish to directory**; **Update vetting**; or **Reject** |
| **Published** | Live in the public directory | Toggle Open-to-work / Verified; **Withdraw** (→ back to Pending) |
| **Rejected** | Declined | Cannot be published until reset |

**Vetting checklist (all three required before "Vet & approve" enables):**

1. **CV / documents reviewed** — the panel shows whether a CV/PDF is attached.
2. **Referral contacts checked** — the panel shows whether referrals were provided and whether the facilitator gave consent to contact them.
3. **Promotion / listing consent confirmed** — confirm the facilitator agreed to be listed publicly.

The checklist (who confirmed what, plus optional notes and a timestamp) is saved as an auditable record on the submission and an `events` row. **Publishing is blocked by the system** until a submission is vetted — the API returns *"Vet this facilitator before publishing"* otherwise, so a never-checked facilitator can't reach the directory by mistake.

**Withdraw / reset** returns a published facilitator to Pending and clears the public directory row (no public exposure) and the stored vetting, so it must be re-vetted before re-publishing.
