# Matching operations (SCOPE-047)

Human-in-the-loop matching — not algorithmic auto-match in MVP.

## Inputs

| Source | Table / route | Notes |
|--------|---------------|-------|
| Full seeker questionnaire | `seeker_discovery_responses` | `/api/seeker-discovery` |
| Homepage quick capture | Same table | `answers.source = homepage-quick-capture` |
| Facilitator availability | `facilitator_matching_requests` | Rates in `hourly_rate_cents` / `daily_rate_cents` |
| Published retreats | `retreats` | Operator publish from submissions |

## Operator workflow

1. **Triage** — Admin dashboard → new seeker rows sorted by `created_at`.
2. **Read intention** — `purpose`, `answers`, reflections; quick-capture rows flagged via JSON source.
3. **Shortlist retreats** — Manual filter on category, region, budget; use `/admin` match tools where implemented.
4. **Facilitator side** — For owner–facilitator pairing, filter `facilitator_matching_requests` by `practice_areas`, `looking_for`, rates.
5. **Outreach** — Email/WhatsApp outside platform; log outcome in `events` / match records when created.

## Status state machines (SCOPE-039)

Three status fields drive the workflow. Transitions are **guarded server-side**
(an invalid jump returns 400):

| Entity | Field | States | Transitions |
|--------|-------|--------|-------------|
| Facilitator profile | `facilitator_onboarding_responses.status` | `new` → `reviewed` → `published` / `rejected` | publish promotes to the `facilitators` directory (SCOPE-038); reject/withdraw → withdraws the public row |
| Facilitator matching request | `facilitator_matching_requests.status` | `new` → `reviewed` → `matched` / `closed` | operator triage |
| Match | `matches.status` | `recorded` → `notified` → `closed` (re-open: `closed` → `notified`) | set on creation + via the admin UI |

**Match lifecycle in detail** (`POST /api/admin/matches`):

1. Insert as `recorded`.
2. Send the seeker + facilitator notification emails (`sendMatchNotificationToSeeker` / `...ToFacilitator`).
3. On success, advance to `notified` (so `recorded` only persists if mail fails).
4. Operator later moves it to `closed` (booked / declined / lapsed) via the
   **Update** column on `/admin/matches` — `PATCH /api/admin/matches/[id]`,
   which enforces the allowed transitions above and logs a
   `match_status_changed` event.

## Operator runbook (for Maria)

Everything is in the **admin dashboard** (`/admin`, login required).

1. **Review facilitators** — `/admin` → *Facilitator Responses*. Open a profile,
   check skills/credentials, then **Mark reviewed** → **Publish to directory**
   (or **Reject**). Publishing makes the public profile live (SCOPE-038);
   **Withdraw** removes it.
2. **Review retreats** — *Retreat Submissions* → **Approve & Publish** (or
   Reject). Approved retreats appear in the public directory.
3. **Create a match** — *Matches* → pick a seeker, a published retreat, and the
   facilitator's email + notes → **Create**. Both parties are emailed
   automatically and the match shows as **notified**.
4. **Track / close** — in the *Matches* table, use the **Update** buttons to
   **Close** a match once it's booked/declined, or **Re-open** if needed.
5. **What the system sends** — confirmation emails on every public form submit,
   plus the two match-notification emails on step 3. See `CONTACT_MAIL.md` for
   the provider config.

## SLAs (stakeholder)

- Seeker acknowledgement: transactional email on submit (requires Resend/n8n configured).
- Human reply target: **24 hours** (homepage copy).

## Phase 2 (SCOPE-059)

AI-assisted ranking — do not enable until consent, audit trail, and human override are defined.
