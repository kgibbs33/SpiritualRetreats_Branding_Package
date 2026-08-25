# Feature System

**Document**: FEATURE_SYSTEM.md  
**Purpose**: Platform feature set by domain with rationale and priority  
**Change Frequency**: When scope or priorities change

---

## Feature Domains

| Domain | Purpose |
|--------|---------|
| User acquisition | Attract and capture seekers, facilitators, creators |
| Matching | Connect seekers to retreats |
| Discovery | Enable browsing and finding retreats |
| Conversion | Drive form completion and next actions |
| Trust | Surface credibility and reduce hesitation |
| Admin/operations | Support manual matching and ops |
| Automation | Trigger emails and workflows |

---

## User Acquisition Features

| Feature | Purpose | User Benefit | Business Benefit | Complexity | Priority |
|---------|---------|--------------|------------------|------------|----------|
| **Find Your Path survey** | Capture intention before full questionnaire | Lower friction; feels personalized | Better qualification data; higher completion | Medium | MVP |
| **Seeker interest form** | Capture email + basic intent | Quick first step | Lead capture | Low | MVP |
| **Seeker questionnaire** | Capture preferences, budget, dates | Get matched to relevant retreats | Qualified leads for matching | Medium | MVP |
| **Facilitator interest form** | Capture facilitator intent | Quick expression of interest | Supply pipeline | Low | MVP |
| **Facilitator onboarding** | Full profile, credentials, experience | List retreats; receive matches | Supply validation; credibility | Medium | MVP |
| **Creator enrollment** | Capture creator intent | Join Make Your Retreat | Creator acquisition | Low | MVP |
| **Newsletter signup** | Capture subscribers | Stay informed | Demand pipeline | Low | MVP |
| **Social proof blocks** | "X seekers found their path" | Reduces hesitation | Conversion lift | Low | Phase 2 |
| **Referral program** | Invite friends | Incentive | Acquisition | High | Later |

**Map to tracks**: Find Your Path + questionnaire → Track 1; Facilitator forms → Track 2; Creator enrollment → Track 3. Newsletter → cross-track.

---

## Matching Features

| Feature | Purpose | User Benefit | Business Benefit | Complexity | Priority |
|---------|---------|--------------|------------------|------------|----------|
| **Manual match creation** | Operator selects seeker + retreat | Receive relevant match | Validates matching viability | Low (ops process) | MVP |
| **Match notification (seeker)** | Email with retreat details | Learn about match | Drives conversion | Low (n8n) | MVP |
| **Match notification (facilitator)** | Email with seeker summary | Learn about interest | Facilitator response | Low (n8n) | MVP |
| **Match record storage** | Persist match state | — | Audit, analytics | Low | MVP |
| **Auto-match suggestions** | Algorithm suggests matches | — | Operator efficiency | High | Phase 2 |
| **Accept/decline workflow** | In-platform response | — | Track conversion | Medium | Phase 2 |

**Map to tracks**: Matching validates Track 1 + 2 fit. MVP manual; Phase 2 algorithm.

---

## Discovery Features

| Feature | Purpose | User Benefit | Business Benefit | Complexity | Priority |
|---------|---------|--------------|------------------|------------|----------|
| **Retreat directory** | Public listing of retreats | Browse options | Demand validation; SEO | Medium | MVP |
| **Retreat cards** | Card view with key info | Quick scan | — | Low | MVP |
| **Retreat detail page** | Full retreat view | Evaluate before engaging | — | Low | MVP |
| **Filter by type** | yoga, meditation, wellness, etc. | Narrow results | — | Low | MVP |
| **Filter by dates** | Date range | Find available retreats | — | Low | MVP |
| **Filter by budget** | Price range | Match budget | — | Low | MVP |
| **Sort by relevance/date/price** | Order results | Prioritize options | — | Low | MVP |
| **Category grid** | Browse by intention | Discovery by goal | Canyon Ranch pattern | Low | MVP |
| **Saved searches** | Save filter combo | Return easily | — | Medium | Phase 2 |
| **Comparison** | Compare retreats | Decision support | — | High | Later |

**Map to tracks**: Directory supports Track 1 (seekers browse) and Track 2 (facilitators see listings). Maldives-style filtering; Six Senses modular discovery.

---

## Conversion Features

| Feature | Purpose | User Benefit | Business Benefit | Complexity | Priority |
|---------|---------|--------------|------------------|------------|----------|
| **Multi-step questionnaire** | Progressive disclosure | Less overwhelm | Higher completion | Medium | MVP |
| **Progress indicator** | Show steps remaining | Reduce drop-off | Completion rate | Low | MVP |
| **Path survey → questionnaire link** | Pre-populate from survey | Faster completion | Better data | Low | MVP |
| **Form validation** | Catch errors before submit | Clear feedback | Data quality | Low | MVP |
| **Idempotent submission** | Prevent duplicate submits | No double-send | Data integrity | Low | MVP |
| **Thank-you pages** | Confirm completion | Closure | — | Low | MVP |
| **Confirmation emails** | Professional confirmation | Assurance | Deliverability signal | Low | MVP |
| **Secondary CTAs** | Newsletter, social | Optional engagement | Pipeline | Low | Phase 2 |

**Map to tracks**: All flows. Progress indicator and validation directly support SUCCESS_METRICS completion targets.

---

## Trust Features

| Feature | Purpose | User Benefit | Business Benefit | Complexity | Priority |
|---------|---------|--------------|------------------|------------|----------|
| **Trust labels on retreats** | Operator-assigned labels | Credibility at a glance | Quality signal | Low | MVP |
| **Facilitator credentials** | Certifications, experience | Assess facilitator | Credibility (80% coverage target) | Low | MVP |
| **How It Works page** | Explain process | Understand flow | Trust | Low | MVP |
| **Professional copy tone** | Warm, clear | Feel confident | Brand alignment | — | MVP |
| **Impact statements** | "X seekers found their path" | Social proof | Conversion | Low | Phase 2 |
| **Reviews/ratings** | User feedback | Peer validation | — | High | Later |
| **Verification workflow** | Verify credentials | — | Trust layer | High | Later |

**Map to tracks**: Trust labels and credentials support EXPERIMENTS credibility targets. Aman-style emotional trust via copy.

---

## Admin / Operations Features

| Feature | Purpose | User Benefit | Business Benefit | Complexity | Priority |
|---------|---------|--------------|------------------|------------|----------|
| **Internal notifications** | Ops notified on new leads | — | Operator awareness | Low (n8n) | MVP |
| **Manual match workflow** | Create matches | — | Core validation | Low (spreadsheet or minimal UI) | MVP |
| **Event log** | Audit trail | — | Debugging, analytics | Low | MVP |
| **Minimal ops view** | View seekers, retreats, matches | — | Operational efficiency | Medium | Phase 2 |
| **CRM integration** | Sync to CRM | — | Sales pipeline | High | Later |

**Map to tracks**: Manual matching and notifications are core MVP. Minimal ops view is Phase 2 hook.

---

## Automation Features

| Feature | Purpose | User Benefit | Business Benefit | Complexity | Priority |
|---------|---------|--------------|------------------|------------|----------|
| **Form submission webhook** | Trigger on form submit | — | Orchestration | Low | MVP |
| **Seeker confirmation email** | WF-002 | Confirmation | Professional UX | Low | MVP |
| **Facilitator welcome email** | WF-003 | Next steps | Onboarding | Low | MVP |
| **Retreat confirmation email** | WF-004 | Confirmation | — | Low | MVP |
| **Creator welcome email** | WF-005 | Program overview | — | Low | MVP |
| **Match notifications** | WF-006, WF-007 | Both parties notified | Conversion | Low | MVP |
| **Retry on failure** | n8n retry | — | Reliability | Low | Phase 2 |
| **SMS notifications** | — | — | — | Medium | Later |

**Map to tracks**: All flows. Defined in AUTOMATIONS.md.

---

## Feature Priority Summary

| Priority | Features |
|----------|----------|
| **MVP** | Find Your Path, questionnaire, interest forms, facilitator onboarding, retreat submission, creator enrollment, directory, filters, trust labels, manual match, all email automations |
| **Phase 2** | Auto-match suggestions, accept/decline, saved searches, social proof, impact statements, minimal ops view |
| **Later** | Referral, comparison, reviews, verification, CRM, SMS |

---

## Justification Rule

Every feature maps to at least one of:

- **User value**: Direct benefit to seeker, facilitator, or creator
- **Business goal**: Supports validation, metrics, or operations
- **Reference pattern**: Borrowed from Canyon Ranch, Six Senses, Maldives, Aman, or Retreat Guru

Features without such mapping are excluded.
