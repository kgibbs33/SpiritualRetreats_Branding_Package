# n8n automation ownership matrix

**Purpose:** Single source for whether **App** (Next.js + Supabase + mail) or **n8n** owns each workflow, to avoid duplicate emails and unclear ops behavior.

**Last reviewed:** 2026-05

## Legend

| Owner | Meaning |
| ----- | ------- |
| **App** | Primary implementation in repository; persists data and sends mail where applicable |
| **n8n optional** | Wire only if automation beyond the app is needed (CRM, Slack, alternate channels) |
| **Danger** | Using **both** App and n8n for the **same** recipient/event without dedupe — disable one path |

## Workflows WF-001–WF-007

| WF | Label | Owner | Notes |
| -- | ----- | ----- | ----- |
| WF-001 | Form handler / fan-out | **App** persists + mails first; **n8n optional** (`N8N_FORM_SUBMISSION_URL` etc.) | Do not duplicate user receipts via n8n unless intentionally |
| WF-002 | Seeker confirmation | **App** (`sendSeekerDiscoveryUserConfirmation`) | **n8n optional** duplicate |
| WF-003 | Facilitator welcome | **App** after facilitator onboarding succeeds | **n8n optional** |
| WF-004 | Retreat submission confirmation | **App** (`sendRetreatSubmissionUserConfirmation`) | **n8n optional** duplicate |
| WF-005 | Creator welcome | Not shipped in MVP creator flow — **stub** | **n8n optional** when creator track ships |
| WF-006 | Match notification (seeker) | **App** from operator match creation | **n8n optional** copies |
| WF-007 | Match notification (facilitator) | **App** same event | **n8n optional** |

## Operational rule

Before enabling n8n on a workflow that mirrors app mail: confirm **recipient lists** do not overlap with active app transactional sends unless n8n is intentionally additive (e.g. internal Slack only).
