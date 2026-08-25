# Automations

**Document**: AUTOMATIONS.md  
**Purpose**: Define n8n workflows and automation rules  
**Change Frequency**: When workflows change

---

## Automation Principles

1. **n8n = orchestration only**: Business logic (validation, storage) lives in code/Supabase.
2. **Webhook-triggered**: Forms and events trigger n8n via webhook.
3. **Idempotent**: Workflows must tolerate duplicate triggers.
4. **Fail gracefully**: On email failure, log and retry; do not block storage.

---

## As-built notifications (SCOPE-052)

The catalogue below is the target n8n design. **As built**, notifications run
in-code (mail layer), with n8n as an optional add-on:

**Per public form, on submit:**

| Form | User confirmation | Team notification | Optional n8n |
|------|-------------------|-------------------|--------------|
| Contact | ✅ | ✅ `sendContactInquiryMail` (richer) | ✅ `form_type: contact` |
| Newsletter | ✅ | ✅ generic | — |
| Seeker discovery | ✅ | ✅ generic | ✅ `form_type: seeker_discovery` |
| Retreat submission | ✅ | ✅ generic | ✅ `form_type: retreat_submission` |
| Facilitator onboarding | ✅ | ✅ generic | — |
| Facilitator matching | ✅ | ✅ generic | — |

- **Team notification** = `sendTeamSubmissionNotification` ([`src/lib/mail/team-notification.ts`](../../src/lib/mail/team-notification.ts)) → email to `CONTACT_NOTIFY_TO` (fallback `CONTACT_EMAIL` = `service@retreatyourself.network`). Non-blocking (failures logged, never thrown), idempotency-keyed `team-<form>/<recordId>`.
- **Optional n8n webhook** — when `N8N_FORM_SUBMISSION_URL` is set, the contact / seeker / retreat-submission routes also POST `{ form_type, data, idempotency_key }` to it. Fire-and-forget; absence of the env var disables it. This is the integration seam for the catalogue workflows below.
- **Match notifications** — `POST /api/admin/matches` emails both the seeker and the facilitator (SCOPE-039).

## Workflow Catalogue (MVP)

### WF-001: Form Submission Handler

**Trigger**: Webhook POST from form/API  
**Payload**: `{ form_type, actor_id?, data, idempotency_key }`

**Steps**:
1. Validate payload structure
2. Check idempotency (skip if already processed)
3. [Storage handled by API before webhook]
4. Log event in Supabase `events` table
5. Branch by form_type:
   - `contact` → Email inquiry to service@retreatyourself.network; internal notification to ops
   - `seeker_questionnaire` → WF-002
   - `facilitator_onboarding` → WF-003
   - `retreat_submission` → WF-004
   - `creator_enrollment` → WF-005
6. Trigger internal notification (email to ops)

**Error handling**: Retry 3x, then dead-letter to log.

---

### WF-002: Seeker Confirmation Email

**Trigger**: From WF-001 when form_type = seeker_questionnaire

**Steps**:
1. Fetch actor email from Supabase
2. Fetch seeker preferences from actor_type_data
3. Compose confirmation email (professional, simple)
4. Send via email provider
5. Log event: `email_sent`, type `seeker_confirmation`

**Template variables**: name, preferences_summary, next_steps

---

### WF-003: Facilitator Welcome Email

**Trigger**: From WF-001 when form_type = facilitator_onboarding

**Steps**:
1. Fetch actor email
2. Compose welcome + next steps (retreat form link)
3. Send email
4. Log event: `email_sent`, type `facilitator_welcome`

---

### WF-004: Retreat Submission Confirmation

**Trigger**: From WF-001 when form_type = retreat_submission

**Steps**:
1. Fetch retreat owner email
2. Compose confirmation (retreat details, listing status)
3. Send email
4. Log event: `email_sent`, type `retreat_confirmation`

---

### WF-005: Creator Enrollment Welcome

**Trigger**: From WF-001 when form_type = creator_enrollment

**Steps**:
1. Fetch actor email
2. Compose welcome + program overview
3. Send email
4. Log event: `email_sent`, type `creator_welcome`

---

### WF-006: Match Notification (Seeker)

**Trigger**: Webhook when operator creates match

**Payload**: `{ match_id, seeker_actor_id, retreat_id }`

**Steps**:
1. Fetch seeker email, retreat details
2. Compose match notification (retreat summary, CTA)
3. Send email
4. Update match: notified_at
5. Log event: `match_notification_sent`

---

### WF-007: Match Notification (Facilitator/Owner)

**Trigger**: Same as WF-006, parallel branch

**Steps**:
1. Fetch retreat owner email, seeker summary (anonymized)
2. Compose notification (seeker interest summary, CTA)
3. Send email
4. Log event: `match_notification_facilitator_sent`

---

## Email Templates

- **Tone**: Professional, warm, concise
- **Structure**: Greeting → Summary → CTA → Footer
- **Branding**: Simple; no heavy imagery for MVP
- **Unsubscribe**: Include in footer (mandatory)

---

## Contact Form Handler (M1)

When form_type = `contact`, n8n workflow:
1. Email inquiry (name, email, subject, message) to service@retreatyourself.network
2. Internal notification to ops

---

## Internal Notifications

Ops team receives:
- New contact inquiry
- New seeker qualified
- New facilitator onboarded
- New retreat submitted
- New creator enrolled
- Match created (optional; may be in separate channel)

**Channel**: Email to ops inbox. Single digest or per-event — TBD.

---

## PHASE 2 HOOKS (Not Implemented)

- SMS notifications
- In-app notifications
- Slack/Discord integration
- Retry queues with backoff
- Template versioning
- A/B testing for emails
