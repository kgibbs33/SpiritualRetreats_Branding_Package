# Component Map

**Document**: COMPONENT_MAP.md  
**Purpose**: Platform UI components—purpose, behavior, and usage  
**Change Frequency**: When component inventory or behavior changes

---

## Component Inventory

### Cards

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **Retreat card** | Preview retreat in directory | Image, title, type, dates, trust label, CTA; links to detail |
| **Category card** | Browse by intention | Image, label (e.g. "Mindful Journey"), CTA; links to Discover with filter |
| **Facilitator card** | Preview facilitator | Avatar, name, credentials snippet; used on retreat detail |
| **Story card** | Narrative content | Image, headline, excerpt; links to story/detail |

### Filters

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **Filter bar** | Narrow directory results | Type dropdown, date picker, budget range, location; applies on change or Apply |
| **Filter chip** | Active filter indicator | Removable; shows current filter state |
| **Sort dropdown** | Order results | Relevance, Date, Price; immediate apply |

### Forms

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **Interest form** | Quick capture | Email, optional name, intent; single submit |
| **Path survey** | Intention capture | 3–5 questions; radio/select; Next → Questionnaire |
| **Questionnaire** | Seeker preferences | Multi-step; sections: type, budget, dates, requirements; Progress + Back/Next |
| **Onboarding form** | Facilitator profile | Sections: profile, credentials, experience; progressive |
| **Retreat submission form** | Retreat details | Title, description, type, location, dates, capacity, price; validation |
| **Enrollment form** | Creator signup | Email, intent; minimal for MVP |
| **Contact form** | General inquiries | Name, email, subject, message; redirect copy for retreat owners/facilitators |

### Lists

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **Directory list** | Retreat listing | Grid of retreat cards; responsive columns |
| **Filtered list** | Results after filter | Same as directory; empty state when no results |

### Profile Layouts

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **Facilitator profile block** | On retreat detail | Avatar, name, bio, credentials, experience; trust strip |
| **Retreat meta block** | On retreat detail | Type, dates, location, capacity, price range |

### Modals

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **Filter modal** | Mobile filter UI | Drawer or overlay; Apply/Clear |
| **Confirmation modal** | Destructive actions | — (Phase 2 if needed) |

### Dashboards

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **Ops view** | Manual matching | Seekers list, retreats list, match creation; Phase 2 |
| **Creator program view** | Program progress | Steps, status; Phase 2 |

### Badges

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **Trust label** | Credibility signal | Text badge on retreat card/detail (e.g. "Verified," "Featured") |
| **Type label** | Retreat category | Pill/badge for yoga, meditation, etc. |
| **Credential badge** | Facilitator cert | Small label (e.g. "RYT-200") |

### States

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **Loading** | In-progress | Skeleton or spinner; preserve layout |
| **Empty** | No results | Message + CTA (e.g. broaden filters, Find Your Path) |
| **Error** | Failure | Message + retry where applicable |
| **Success** | Post-submit | Thank-you page; confirmation copy |
| **Disabled** | Invalid form | Submit disabled; inline validation |

### Layout Blocks

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **Header** | Global nav | Logo, Discover, Find Path, Create, Facilitators, About |
| **Hero** | Landing impact | Full-width image, headline, primary CTA |
| **Story strip** | Narrative | 1–2 sentences, optional image |
| **Footer** | Site closure | Links, newsletter, legal (conditional on LEGAL_PAGES_VISIBLE) |
| **Progress indicator** | Multi-step forms | Step X of Y; visual progress bar or steps |
| **Legal layout** | Legal page wrapper | Prose-style content; Privacy, Terms, Cookies |

---

## Component → Page Mapping

| Page | Components Used |
|------|-----------------|
| Home | Header, Hero, Story strip, Category grid, Retreat cards, Trust strip, Footer |
| Discover | Header, Filter bar, Sort, Directory list, Retreat cards, Footer |
| Retreat Detail | Header, Hero, Retreat meta, Facilitator profile block, Trust labels, CTA, Footer |
| Find Your Path | Header, Path survey, Progress indicator, Footer |
| Questionnaire | Header, Questionnaire form, Progress indicator, Footer |
| Facilitator Onboarding | Header, Onboarding form, Progress indicator, Footer |
| Retreat Submission | Header, Retreat submission form, Footer |
| Creator Enrollment | Header, Enrollment form, Footer |
| Thank You | Header, Success state, Footer |
| Contact | Header, Contact form, Footer |
| Privacy / Terms / Cookies | Header, Legal layout, Footer |

---

## Design Token Reference

| Token | Use |
|-------|-----|
| Spacing scale | 4, 8, 12, 16, 24, 32, 48, 64, 96 |
| Border radius | 4px (inputs), 8px (cards), 16px (modals) |
| Shadow | sm, md, lg for cards/modals |
| Transition | 200–300ms for hover, focus |
| Breakpoints | 640, 768, 1024, 1280 |

---

## Related Documents

- [UX_ARCHITECTURE.md](./UX_ARCHITECTURE.md) — Page structure and flows
- [FEATURE_SYSTEM.md](./FEATURE_SYSTEM.md) — Feature set
