# System Overview

**Document**: SYSTEM_OVERVIEW.md  
**Purpose**: High-level architecture and decision log  
**Change Frequency**: When architecture changes

---

## System Stack

| Layer | Technology | Role |
|-------|------------|------|
| Data | Supabase (PostgreSQL) | Central data memory, SSOT |
| Orchestration | n8n | Workflow automation, email triggers |
| Frontend | TBD (simple static or Next.js) | Site skeleton, forms |
| Email | Professional SMTP / Resend / SendGrid | Notifications, confirmations |
| Hosting | TBD (Vercel / Netlify) | Static site + edge functions if needed |

---

## Core Principles

1. **Supabase = SSOT**: All canonical data lives in Supabase. No duplicate state.
2. **n8n = Orchestration**: Workflows, integrations, notifications. Not business logic.
3. **Simple > Clever**: Manual operations are intentional. No complex admin panels.
4. **Extensible**: Actor model and schema support future roles without redesign.

---

## Data Flow (MVP)

```
User → Form (frontend) → API/Edge → Supabase
                              ↓
                         Event log
                              ↓
                         n8n webhook
                              ↓
                    Email + Internal notification
```

---

## Trust Hierarchy

```
10_architecture (HOW)
    > 20_execution (WHAT + WHEN)
    > code (implementation)
```

If code conflicts with docs → fix docs or flag discrepancy.

---

## Decision Log

### DL-001: Actor Model vs Separate Tables

**Problem**: How to support multiple roles (seeker, facilitator, retreat_owner, etc.) without schema explosion?

**Options**:
- A) Separate table per role (seeker, facilitator, retreat_owner)
- B) Unified actor table with polymorphic type system

**Choice**: B — Unified actor model

**Reason**: Platform will add roles over time. Separate tables create migration burden and prevent cross-role matching. Single identity table with `actor_types` and `actor_type_data` allows extension without schema redesign.

---

### DL-002: Manual Matching for MVP

**Problem**: Automate matching or manual?

**Options**:
- A) Algorithm-driven matching from day one
- B) Manual matching by operator

**Choice**: B — Manual matching

**Reason**: MVP validates demand/supply fit. Manual matching proves the model before investing in algorithm. Data structure supports future automation.

---

### DL-003: Form Processing Rule

**Problem**: What must happen on every form submission?

**Choice**: Validate → Idempotent store → Log event → Trigger email → Trigger notification.

**Reason**: Ensures no silent failure, no data loss, consistent UX, and operator awareness.

---

### DL-004: n8n vs Code for Orchestration

**Problem**: Where does automation live?

**Choice**: n8n for workflows, code for validation and storage.

**Reason**: n8n excels at integrations and visual workflows. Code excels at type safety and complex logic. Separation of concerns.

---

## PHASE 2 HOOKS (Documented, Not Implemented)

- Automated matching algorithm
- Payment/booking integration
- CRM integration
- Admin dashboard (beyond minimal ops)
- Affiliate tracking
- Multi-language
- Mobile app
- Advanced search/filters
- Reviews and ratings (beyond trust labels)
