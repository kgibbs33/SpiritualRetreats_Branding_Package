# UX Architecture

**Document**: UX_ARCHITECTURE.md  
**Purpose**: Platform structure blueprint—navigation, pages, flows, and layout logic  
**Change Frequency**: When information architecture or flows change

---

## Routing note (canonical URLs, 2026-04)

Permanent redirects live in [`next.config.ts`](../../next.config.ts). Use these **canonical** paths in new UI and internal links:

| Legacy / alias | Canonical |
|----------------|-----------|
| `/discover` | `/retreat-listings` |
| `/find-your-path` | `/retreat-discovery-form` |
| `/create` | `/make-your-retreat` |
| `/facilitators` | `/facilitators-portal` |
| `/about/how-it-works` | `/trust` |

Source of truth for implementation status: [`docs/20_execution/FEATURE_IMPLEMENTATION_STATUS.md`](../20_execution/FEATURE_IMPLEMENTATION_STATUS.md).

---

## 1. Navigation Tree

```
RE:TREAT
│
├── Home (/)
│
├── Contact (/contact)
│
├── Legal (when NEXT_PUBLIC_LEGAL_PAGES_VISIBLE=true)
│   ├── Privacy Policy (/privacy)
│   ├── Terms & Conditions (/terms)
│   └── Cookie Policy (/cookies)
│
├── Discover (/discover)
│   ├── All Retreats (default listing)
│   ├── [Filter by type] (yoga, meditation, wellness, spiritual, fitness)
│   └── Retreat Detail (/discover/[id])
│
├── Find Your Path (/find-your-path)
│   ├── Step 1: Path Survey (3–5 intention questions)
│   ├── Step 2: Questionnaire (preferences, budget, dates)
│   └── Thank You (/thank-you/seeker)
│
├── Create Your Retreat (/create)
│   ├── Enrollment (/create/enroll)
│   ├── Program Steps (/create/steps)
│   └── Thank You (/thank-you/creator)
│
├── For Facilitators (/facilitators)
│   ├── Interest / Onboarding (/facilitators/onboard)
│   ├── Retreat Submission (/facilitators/submit-retreat)
│   └── Thank You (/thank-you/facilitator)
│
├── About (/about)
│   ├── How It Works (/about/how-it-works)
│   └── Our Story (/about/our-story)
│
└── [Global elements]
    ├── Footer (links, newsletter, legal)
    └── Role CTAs (Seeker | Facilitator | Creator)
```

**Design rationale**: Modular, role-aware. Each actor type has a clear pathway. Discovery is separate from conversion flows.

---

## 2. Page Hierarchy

### Tier 1: Entry & Discovery

| Page | Route | Primary Purpose |
|------|-------|-----------------|
| Home | `/` | Emotional hook, route to Discover / Find Path / Create / Facilitators |
| Discover | `/discover` | Directory of retreats; filters, sort, cards |
| Retreat Detail | `/discover/[id]` | Single retreat view; trust signals, CTA to Find Your Path |

### Tier 2: Conversion Flows

| Page | Route | Primary Purpose |
|------|-------|-----------------|
| Find Your Path (survey) | `/find-your-path` | 3–5 intention questions → pre-populate questionnaire |
| Questionnaire | `/questionnaire` | Multi-step seeker preferences (budget, dates, type, requirements) |
| Facilitator Onboarding | `/facilitators/onboard` | Profile, credentials, experience |
| Retreat Submission | `/facilitators/submit-retreat` | Retreat details, dates, capacity, pricing |
| Creator Enrollment | `/create/enroll` | Interest, basic info |
| Program Steps | `/create/steps` | Guided retreat creation |

### Tier 3: Support & Closure

| Page | Route | Primary Purpose |
|------|-------|-----------------|
| Contact | `/contact` | General inquiries; redirects for retreat owners/facilitators |
| Privacy Policy | `/privacy` | Data collection, use, storage, rights (when legal pages visible) |
| Terms & Conditions | `/terms` | Platform use, booking clarification, liability (when legal pages visible) |
| Cookie Policy | `/cookies` | Cookie use and consent (when legal pages visible) |
| How It Works | `/about/how-it-works` | Process explanation; trust |
| Our Story | `/about/our-story` | Brand narrative |
| Thank You (seeker) | `/thank-you/seeker` | Confirmation, next steps |
| Thank You (facilitator) | `/thank-you/facilitator` | Confirmation, next steps |
| Thank You (creator) | `/thank-you/creator` | Confirmation, next steps |

---

## 3. Content Block System

| Block | Description | Placement |
|-------|-------------|-----------|
| **Hero** | Full-width image + headline + primary CTA | Home |
| **Story strip** | 2–3 sentence narrative + imagery | Home, About |
| **Category grid** | Cards for retreat types (yoga, meditation, etc.) | Home, Discover |
| **Directory list** | Retreat cards with image, title, type, dates, trust label | Discover |
| **Filter bar** | Type, dates, budget, location, duration | Discover |
| **Path survey** | Radio/select for intention (3–5 questions) | Find Your Path |
| **Questionnaire step** | One section per step; progress indicator | Questionnaire |
| **Trust strip** | Certifications, experience, labels | Retreat Detail, Facilitator profile |
| **CTA block** | Single primary CTA + supporting text | Conversion pages |
| **Footer** | Links, newsletter, legal | All |

---

## 4. Conversion Flows

### Flow A: Seeker (Primary)

```
Home
  → Find Your Path (survey)
  → Questionnaire (multi-step)
  → Thank You
  → [Backend: store actor, event, email]
  → [Ops: manual match → notification]
```

**Exit points**: Survey abandonment, questionnaire abandonment. **Mitigation**: Progress save (Phase 2), minimal steps, clear value per step.

### Flow B: Facilitator

```
Home / For Facilitators
  → Interest form (email, basic)
  → Onboarding (profile, credentials)
  → Retreat Submission
  → Thank You
  → [Backend: store actor, retreat, events, emails]
```

**Exit points**: Onboarding length, retreat form complexity. **Mitigation**: Progressive disclosure; optional fields marked; progress indicator.

### Flow C: Creator

```
Home / Create Your Retreat
  → Enrollment
  → Program Steps (guided)
  → Launch submission
  → Thank You
  → [Backend: store actor, retreat draft → launched]
```

**Exit points**: Program length. **Mitigation**: Cohort-based (Phase 2); MVP: linear steps with clear milestones.

### Flow D: Discovery (Informational)

```
Home
  → Discover
  → [Filter / sort]
  → Retreat Detail
  → [CTA: Find Your Path]
```

**Goal**: Build interest; convert browsers to seekers via Find Your Path.

---

## 5. Layout Structure

### Home Page

```
[Header: Logo | Discover | Find Path | Create | Facilitators | About]
[Hero: Image + Headline + "Find Your Path" CTA]
[Story strip: 1–2 sentences]
[Category grid: 4–6 retreat type cards]
[Directory preview: 3–6 featured retreats]
[Trust strip: "How it works" summary]
[Footer CTA: Newsletter or secondary CTA]
[Footer: Links]
```

### Discover Page

```
[Header]
[Filter bar: Type | Dates | Budget | Location | Duration]
[Sort: Relevance | Date | Price]
[Directory list: Retreat cards, 2–3 columns]
[Pagination or load more]
[Footer]
```

### Retreat Detail

```
[Header]
[Hero image]
[Title, type, dates, location]
[Trust labels]
[Description]
[Facilitator summary + credentials]
[CTA: "Find Your Path" or "Get Matched"]
[Related retreats]
[Footer]
```

### Find Your Path

```
[Header]
[Progress: Step 1 of 2]
[Survey questions: 3–5]
[Next]
---
[Progress: Step 2 of 2]
[Questionnaire sections]
[Back] [Submit]
```

### Thank You

```
[Header]
[Icon / checkmark]
[Headline: "You're on your way"]
[Contextual next steps]
[Secondary CTA if any]
[Footer]
```

---

## 6. Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (&lt;640px) | Single column; filters collapsible; stacked cards |
| Tablet (640–1024px) | 2 columns for cards; filter drawer |
| Desktop (&gt;1024px) | Full layout; sidebar filters or top bar |

---

## 7. Accessibility Requirements

- Semantic HTML; ARIA where needed
- Keyboard navigation for all interactive elements
- Focus order matches visual flow
- Color contrast WCAG AA
- Form labels associated; error messages announced
- Skip link to main content

---

## 8. State Handling

| State | Treatment |
|-------|------------|
| Loading | Skeleton or spinner; preserve layout |
| Empty (no retreats) | Message + CTA to broaden filters or Find Your Path |
| Error | Inline message; retry option |
| Success | Thank you page; confirmation copy |
| Form validation | Inline, per field; submit disabled until valid |

---

## Related Documents

- [FEATURE_SYSTEM.md](./FEATURE_SYSTEM.md) — Feature set by domain
- [COMPONENT_MAP.md](./COMPONENT_MAP.md) — UI components
