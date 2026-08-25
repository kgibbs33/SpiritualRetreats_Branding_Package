# Data Model

**Document**: DATA_MODEL.md  
**Purpose**: Define schema, actor system, and entity relationships  
**Change Frequency**: When schema changes

---

## Actor System (Critical)

The platform uses a **unified actor model**. Never create separate tables per role.

All identities exist in one base table. New roles extend via type registry, not schema changes.

---

## Supported Actor Types

| Type | Description | Primary Use |
|------|-------------|-------------|
| `seeker` | Person seeking retreat | Discovery track |
| `facilitator` | Teacher, guide, practitioner | Supply track |
| `retreat_owner` | Operator of retreat center | Supply track |
| `supplier` | Service/product provider | Future |
| `subscriber` | Newsletter/interest only | Discovery |
| `partner` | Distribution channel | Future |
| `venue_owner` | Physical space owner | Future |
| `affiliate` | Performance referrer | Future |
| `sponsor` | Brand/financial supporter | Future |
| `investor` | Capital provider | Future |
| `other` | Catch-all | Future |

**Rule**: To add a new role, add to `actor_types` registry and create `actor_type_data` fields. Do NOT modify `actors` or `actor_profiles` schema.

---

## Core Tables

### actors

Stores identity. One row per person/organization.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| email | text | Unique, required |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| status | enum | active, suspended, deleted |
| source | text | Form/flow that created (e.g. seeker_questionnaire) |

### actor_profiles

Shared profile data across roles. Denormalized for common fields.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| actor_id | uuid | FK → actors |
| display_name | text | |
| first_name | text | |
| last_name | text | |
| phone | text | |
| avatar_url | text | |
| bio | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

One-to-one with actors (1:1).

### actor_types

Registry of role types. Extensible.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| code | text | Unique (seeker, facilitator, etc.) |
| name | text | Human-readable |
| description | text | |
| schema_version | int | For type_data migrations |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### actor_type_assignments

Links actors to roles. One actor can have multiple roles.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| actor_id | uuid | FK → actors |
| actor_type_id | uuid | FK → actor_types |
| created_at | timestamptz | |
| metadata | jsonb | Optional type-specific flags |

### actor_type_data

Type-specific fields. Polymorphic; structure varies by type.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| actor_id | uuid | FK → actors |
| actor_type_id | uuid | FK → actor_types |
| data | jsonb | Type-specific structure |
| schema_version | int | Matches actor_types.schema_version |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Unique per (actor_id, actor_type_id).

---

## Entity Tables (MVP)

### contact_inquiries

General contact form submissions (questions, partnerships, general inquiries). Not part of Retreat Match flow.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| name | text | Required |
| email | text | Required |
| subject | text | Optional (general, partnership, other) |
| message | text | Required |
| created_at | timestamptz | |

### retreats (public directory)

**Implemented** in [`supabase/migrations/20260428000000_retreats_public_listings.sql`](../../supabase/migrations/20260428000000_retreats_public_listings.sql). Purpose: **published card + detail** data for `/retreat-listings` and `/retreat/[slug]`, with stable `slug` and RLS so **`anon` / `authenticated`** can `SELECT` only rows where `status = 'published'`.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| slug | text | Unique URL segment |
| title | text | |
| type | text | Card category (yoga, meditation, wellness, …) |
| location | text | Display location |
| dates_display | text | Human-readable dates line |
| price_display | text | Human-readable price line |
| image_path | text | Path under `public/` (e.g. `/images/...`) |
| rating | numeric | Optional |
| review_count | int | Optional |
| badge | text | Optional (e.g. Staff Pick) |
| description | text | Optional body for detail page |
| status | text | `draft` or `published` |
| sort_order | int | Grid ordering |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Note:** Broader catalog fields (owner FK, date range types, capacity, price numerics) may be added later or linked from `retreat_submissions`; `matches.retreat_id` should align to this `id` when matching ships.

### matches

Manual match records. Links seeker to retreat.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| seeker_actor_id | uuid | FK → actors |
| retreat_id | uuid | FK → retreats |
| status | enum | pending, sent, accepted, declined, expired |
| matched_by | text | Operator identifier |
| matched_at | timestamptz | |
| notified_at | timestamptz | |
| notes | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### events

Event log for form submissions, notifications, state changes.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| event_type | text | e.g. form_submitted, match_sent |
| actor_id | uuid | Optional FK |
| entity_type | text | e.g. retreat, match |
| entity_id | uuid | Optional |
| payload | jsonb | Event details |
| created_at | timestamptz | |

---

## As-Built Intake Tables

The actor model above is the target schema. The live site currently writes each
public form to its own flat table. These are the tables in production today.

### seeker_discovery_responses (SCOPE-022)

Captures the seeker discovery questionnaire (`src/components/seeker/SeekerDiscoveryForm.tsx`,
`POST /api/seeker-discovery`, validated by `src/validation/seekerDiscovery.ts`,
migration `20260417000000_seeker_discovery.sql`).

| Column | Type | Source field | Notes |
|--------|------|--------------|-------|
| id | uuid | — | PK, `gen_random_uuid()` |
| full_name | text | Step 0 name | Required |
| email | text | Step 0 email | Required, indexed |
| phone_whatsapp | text | Step 0 WhatsApp | Optional |
| travel_dates | text | Reflection logistics | Optional |
| travel_dates_flexible | boolean | Reflection logistics | Default false |
| destination_region | text | Reflection logistics | Optional |
| budget_range | text | Q7 budget | Mirror of `answers.budget` for querying |
| purpose | text | Q1 mainIntention | Mirror of `answers.mainIntention` for querying |
| answers | jsonb | Q1–Q7 | Full structured answers, shape below |
| reflection_intention | text | Reflection | "What intention are you bringing?" |
| reflection_great_retreat | text | Reflection | "What would make this a truly great retreat?" |
| reflection_special_requests | text | Reflection | Dietary / accessibility / etc. |
| idempotency_key | text | client UUID | Unique; dedupes double submits |
| created_at | timestamptz | — | Default `now()`, indexed |

**`answers` JSON shape** (keys are stable; single-selects are option slugs,
`practices` is a string array (SCOPE-050)):

```json
{
  "mainIntention": "healing",
  "relaxationHealingTransform": "transform",
  "groupOrPrivate": "private",
  "locationInspiration": "ocean",
  "duration": "week",
  "practices": ["yoga", "breathwork", "somatic"],
  "budget": "1000-2500"
}
```

**Question-flow review (SCOPE-022 acceptance).** The flow leads with pain and
outcome before modalities, then narrows to personal fit:

| Order | Question | Field | Dimension |
|------:|----------|-------|-----------|
| Q1 | What brings you to a retreat? | mainIntention | Pain / motivation |
| Q2 | What kind of shift are you seeking? | relaxationHealingTransform | Desired outcome |
| Q3 | Solo or shared? | groupOrPrivate | Personal fit |
| Q4 | Where does your soul want to go? | locationInspiration | Personal fit |
| Q5 | How long? | duration | Personal fit |
| Q6 | What practices call to you? | practices | Modality (after pain/outcome) |
| Q7 | Budget? | budget | Personal fit |
| Reflection | Intention / great retreat / special requests | reflection_* | Pain + outcome (free-text) |

Modalities (Q6) come **after** the pain (Q1) and outcome (Q2) questions, with
free-text intention captured again at the reflection step — satisfying the
"pain-points / outcomes / personal-fit before modalities" requirement.

### facilitator_onboarding_responses (SCOPE-026, SCOPE-027)

Facilitator intake (`src/components/facilitator/FacilitatorOnboardingForm.tsx`,
`POST /api/facilitator-onboarding`, validated by
`src/validation/facilitatorOnboarding.ts`). **RLS enabled with no policies** —
anon/authenticated clients have zero access; only the service-role API routes
read or write. Private by construction.

| Column | Type | Source field | Notes |
|--------|------|--------------|-------|
| id | uuid | — | PK |
| full_name | text | Full name | Required |
| email | text | Email | Required, lowercased, indexed |
| phone | text | Phone | Optional |
| city | text | Location → City | SCOPE-027, optional, coarse location |
| region | text | Location → Region/state | SCOPE-027, optional |
| country | text | Location → Country | SCOPE-027, optional |
| website_url | text | Links → Website | SCOPE-029, optional, http(s) (Zod-validated) |
| linkedin_url | text | Links → LinkedIn | SCOPE-029, optional, host-checked `linkedin.com` |
| instagram_url | text | Links → Instagram | SCOPE-029, optional, host-checked `instagram.com` |
| referrals | jsonb | Referee contacts | SCOPE-030, optional array of `{name,email,relationship}` (≤2); third-party data, admin-only |
| referral_consent | boolean | Referee consent checkbox | SCOPE-030, default false; facilitator affirmed referees' permission (GDPR accountability; `created_at` = consent time) |
| practice_areas | text[] | Skills & practices multi-select | SCOPE-031, default `{}`; shared taxonomy with `facilitator_matching_requests.practice_areas`; **GIN-indexed** for skill-containment search (SCOPE-036) |
| practice_focus | text | Practice focus (free text) | Optional, additional detail beyond `practice_areas` |
| credentials | text | Credentials & experience | Optional |
| message | text | Anything else | Optional |
| photo_path | text | Profile photo | SCOPE-026; object path in private `facilitator-media` bucket, served via signed URL |
| cv_path | text | CV / credentials PDF | SCOPE-028; object path `facilitators/cv/<uuid>.pdf` in the same private bucket; admin-only, served via **forced-download** signed URL |
| status | text | Review workflow | SCOPE-038; `new` → `reviewed` → `published` / `rejected` (default `new`), indexed |
| created_at | timestamptz | — | Default `now()`, indexed |

### facilitators (SCOPE-038 — published directory, display SSOT)

Curated, **public-safe** subset promoted from `facilitator_onboarding_responses`
by an operator/admin publish step (`upsertPublishedFacilitatorFromOnboarding`).
RLS: `anon`/`authenticated` may `SELECT` **only `status = 'published'`**. Never
contains email / phone / CV / referrals — safe by construction. See
[ADR-005](ADR-005-facilitator-published-profiles.md).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| source_onboarding_id | uuid | UNIQUE FK → `facilitator_onboarding_responses`; upsert key (re-publish in place) |
| slug | text | UNIQUE; the directory link (`/facilitators/<slug>`, SCOPE-035) |
| display_name | text | From `full_name` |
| headline | text | Operator-curated tagline |
| bio | text | Operator-curated (falls back to a `credentials` snippet) |
| city / region / country | text | Coarse location |
| practice_areas | text[] | Skills; **GIN-indexed** for search (SCOPE-036) |
| open_to_work | boolean | SCOPE-036/037; default true; directory availability filter + open-to-work-first sort; admin-settable |
| verified | boolean | SCOPE-044; default false; admin-set; drives the Verified directory badge (parity with retreats' `trust_tier`/`verified_at`) |
| verified_at | timestamptz | SCOPE-044; when marked verified (nullable) |
| website_url / linkedin_url / instagram_url | text | Public links |
| photo_path | text | Private bucket path; directory serves via signed URL |
| status | text | `draft` / `published`; anon reads published only (RLS), indexed |
| created_at / updated_at / published_at | timestamptz | |

Location is **coarse only** (city / region / country — no street address) for
GDPR data minimisation, and never exposed publicly: a future facilitator
directory (SCOPE-035) decides what, if anything, to surface with consent.

---

## Type-Specific Data Structures (actor_type_data.data)

### seeker

```json
{
  "preferred_retreat_types": ["yoga", "meditation"],
  "budget_min": 500,
  "budget_max": 2000,
  "preferred_dates": ["2025-03", "2025-04"],
  "location_preference": "any",
  "special_requirements": "text",
  "questionnaire_completed_at": "ISO8601"
}
```

### facilitator

```json
{
  "certifications": ["RYT-200", "Reiki Level 2"],
  "years_experience": 5,
  "specializations": ["yoga", "meditation"],
  "website_url": "https://...",
  "social_links": {},
  "onboarding_completed_at": "ISO8601"
}
```

### retreat_owner

```json
{
  "venue_name": "text",
  "venue_capacity": 20,
  "location": "text",
  "website_url": "https://...",
  "onboarding_completed_at": "ISO8601"
}
```

---

## Indexes (Recommended)

- actors: email (unique), status
- actor_type_assignments: (actor_id, actor_type_id) unique
- actor_type_data: (actor_id, actor_type_id) unique
- retreats: owner_actor_id, status, retreat_type, start_date
- matches: seeker_actor_id, retreat_id, status
- events: event_type, created_at, actor_id

---

## Polymorphic Relationships

- `owner_actor_id` on retreats → actors (via actor_type_assignments for retreat_owner/facilitator)
- `seeker_actor_id` on matches → actors (via actor_type_assignments for seeker)

Cross-type matching: seekers match to retreats owned by retreat_owners or facilitators. Actor model supports both without schema change.
