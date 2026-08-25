# Structure Map

**Document**: STRUCTURE_MAP.md  
**Purpose**: System anatomy — purpose, inputs, outputs, dependencies, future hooks  
**Change Frequency**: When architecture or domains change

---

## Domain Map

| Domain | Purpose | Inputs | Outputs | Dependencies | Future Hooks |
|--------|---------|--------|---------|--------------|--------------|
| **Discovery Engine** | Capture seeker demand, qualify leads | Forms, questionnaire | Qualified leads, actor records, events | Supabase, n8n, email | Search, filters, recommendations |
| **Facilitator Network** | Onboard facilitators, collect supply | Facilitator forms, retreat forms | Facilitator profiles, retreat listings | Supabase, n8n, email | Credibility scoring, verification |
| **Retreat Creation Layer** | Guide creators to launch retreats | Creator enrollment, program steps | Retreat drafts, launched retreats | Supabase, n8n, email | Program content, cohorts |
| **Trust Layer** | Credibility, documentation, labels | Certifications, reviews (future) | Trust labels, badges | Supabase | Reviews, verification workflow |
| **Matching Engine** | Connect seekers to retreats | Qualified seekers, retreat inventory | Matches, notifications | Supabase, n8n, email | Algorithm, scoring |
| **Communication Layer** | Notifications, confirmations | Events, triggers | Emails, internal alerts | n8n, email provider | SMS, in-app, templates |
| **Actor System** | Identity, roles, profiles | All user inputs | actors, profiles, type_data | Supabase | Auth, SSO, multi-role UI |

---

## Discovery Engine

**Purpose**: Validate demand by capturing seeker intent and preferences.

**Inputs**:
- Seeker interest form (email, basic intent)
- Onboarding questionnaire (preferences, budget, dates, requirements)

**Outputs**:
- Actor record (type: seeker)
- actor_type_data (seeker schema)
- Event log entries
- Confirmation email

**Dependencies**:
- Supabase (actors, actor_profiles, actor_type_assignments, actor_type_data, events)
- n8n (WF-001, WF-002)
- Email provider

**Future Expansion Hooks**:
- Search/filter on preferences
- Recommendation engine
- Saved searches
- Comparison tools

---

## Facilitator Network

**Purpose**: Validate supply by onboarding facilitators and capturing retreat listings.

**Inputs**:
- Facilitator interest form
- Facilitator onboarding (profile, credentials, experience)
- Retreat submission form (dates, capacity, type, pricing)

**Outputs**:
- Actor records (facilitator, retreat_owner)
- Retreat records
- Event log entries
- Welcome/confirmation emails

**Dependencies**:
- Supabase (actors, retreats, events)
- n8n (WF-001, WF-003, WF-004)
- Email provider

**Future Expansion Hooks**:
- Credibility verification workflow
- Retreat approval workflow
- Availability calendar
- Multi-retreat management

---

## Retreat Creation Layer

**Purpose**: Acquire retreat creators and validate creator acquisition.

**Inputs**:
- Creator enrollment form
- Program step submissions (guided creation)

**Outputs**:
- Actor record (retreat_owner or facilitator)
- Retreat draft → launched retreat
- Event log entries
- Welcome emails

**Dependencies**:
- Supabase (actors, retreats, events)
- n8n (WF-001, WF-005)
- Email provider

**Future Expansion Hooks**:
- Program content hosting
- Cohort scheduling
- Progress tracking
- Community features

---

## Trust Layer

**Purpose**: Surface credibility signals for seekers and operators.

**Inputs** (MVP):
- Facilitator certifications (from onboarding)
- Retreat owner credentials
- Manual trust labels (operator-assigned)

**Outputs**:
- Trust labels on directory listings
- Badges on facilitator profiles
- Documentation links

**Dependencies**:
- Supabase (actor_type_data, retreats)
- Manual operator workflow

**Future Expansion Hooks**:
- Verification workflow (document upload, review)
- Third-party credential verification
- Reviews and ratings
- Community endorsement

---

## Matching Engine

**Purpose**: Connect qualified seekers to relevant retreats.

**Inputs**:
- Qualified seeker (from Discovery Engine)
- Retreat inventory (from Facilitator Network, Retreat Creation Layer)
- Operator match decision

**Outputs**:
- Match record
- Notification emails (seeker + facilitator)
- Event log entries

**Dependencies**:
- Supabase (matches, actors, retreats)
- n8n (WF-006, WF-007)
- Email provider
- Manual operator

**Future Expansion Hooks**:
- Scoring algorithm
- Auto-match suggestions
- Decline/accept workflow
- Calendar integration

---

## Communication Layer

**Purpose**: Deliver professional, timely notifications.

**Inputs**:
- Event triggers (form submission, match created)
- Template variables (actor data, entity data)

**Outputs**:
- Transactional emails
- Internal operator notifications
- Event log (email_sent)

**Dependencies**:
- n8n workflows
- Email provider (SMTP/Resend/SendGrid)
- Supabase (for fetching data)

**Future Expansion Hooks**:
- SMS
- In-app notifications
- Template A/B testing
- Localization

---

## Actor System

**Purpose**: Unified identity and role management.

**Inputs**:
- All form submissions that create/update users
- Role assignments

**Outputs**:
- actors
- actor_profiles
- actor_type_assignments
- actor_type_data

**Dependencies**:
- Supabase (schema)
- No external services

**Future Expansion Hooks**:
- Supabase Auth integration
- SSO (Google, etc.)
- Multi-role dashboard
- Profile merging (same person, multiple roles)
