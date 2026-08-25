# Components Index

**Document**: COMPONENTS_INDEX.md  
**Purpose**: Describe components + location + purpose  
**Change Frequency**: Constant (updated when code changes)

---

## Format

| Component | Location | Purpose |
|-----------|----------|--------|
| ... | ... | ... |

---

## Directory Structure (current — updated 2026-07-23)

```
/Retreat
├── docs/                    # Documentation (SSOT)
│   ├── 10_architecture/     # System design, ADRs, data model, automations
│   ├── 20_execution/        # Build plan, progress, components
│   └── 30_infrastructure/   # Domains, DNS, TLS, mail, CI/CD, DB
├── src/
│   ├── app/                 # Next.js App Router pages + API routes
│   ├── components/          # UI components (feature-based subfolders)
│   │   ├── layout/          # SiteChrome, Header, Footer, LegalLayout
│   │   ├── ui/              # StyledSelect, TrustBadge, NewsletterSignup, icons/
│   │   ├── retreat/         # RetreatCard, RetreatIntakeForm, RetreatListingsToolbar
│   │   ├── facilitator/     # FacilitatorCard, FacilitatorDirectoryFilters,
│   │   │                    #   FacilitatorOnboardingForm, FacilitatorMatchingForm
│   │   ├── seeker/          # SeekerDiscoveryForm
│   │   ├── home/            # HomeQuickCapture, HomeRolePaths
│   │   ├── contact/         # ContactForm
│   │   └── admin/           # AdminShell, Pagination, StatusBadge
│   ├── lib/                 # Utilities, Supabase clients, mail, constants
│   ├── validation/          # Zod schemas (one file per form)
│   └── proxy.ts             # Next.js 16 middleware (host redirects, CSP, legal gate)
├── supabase/
│   └── migrations/          # SQL migrations
├── .claude/                 # Claude Code tooling (agents, prompt-library)
├── scripts/                 # Scope/validation/GitHub scripts
├── public/                  # Static assets
├── .env.public              # Committed public env vars (NEXT_PUBLIC_*)
├── .env.example             # Env template (no real secrets)
└── app.js                   # cPanel/Passenger entrypoint
```

---

## Components (`src/components/`)

### layout/
| Component | Location | Purpose |
|-----------|----------|---------|
| SiteChrome | `src/components/layout/SiteChrome.tsx` | Root layout wrapper; renders Header + Footer around page content |
| Header | `src/components/layout/Header.tsx` | Sticky site header; logo; main nav; primary CTA |
| Footer | `src/components/layout/Footer.tsx` | Link columns, newsletter signup, logo |
| LegalLayout | `src/components/layout/LegalLayout.tsx` | Prose wrapper for Privacy, Terms, Cookies |

### ui/
| Component | Location | Purpose |
|-----------|----------|---------|
| StyledSelect | `src/components/ui/StyledSelect.tsx` | Reusable styled `<select>` wrapper |
| TrustBadge | `src/components/ui/TrustBadge.tsx` | Verified/unverified trust badge UI; `retreatTrustVariant` helper |
| NewsletterSignup | `src/components/ui/NewsletterSignup.tsx` | Email capture form; JSON POST to `/api/newsletter`; honeypot |
| retreat-icons | `src/components/ui/icons/retreat-icons.tsx` | SVG icon set for retreat categories and seeker/facilitator UX |

### retreat/
| Component | Location | Purpose |
|-----------|----------|---------|
| RetreatCard | `src/components/retreat/RetreatCard.tsx` | Card UI for retreat listings; listing page maps DB rows via `src/lib/retreats/queries.ts` |
| RetreatIntakeForm | `src/components/retreat/RetreatIntakeForm.tsx` | Retreat owner intake; POST `/api/retreat-submission`; honeypot |
| RetreatListingsToolbar | `src/components/retreat/RetreatListingsToolbar.tsx` | Filter/sort controls for the retreat directory |

### facilitator/
| Component | Location | Purpose |
|-----------|----------|---------|
| FacilitatorCard | `src/components/facilitator/FacilitatorCard.tsx` | Card UI for facilitator directory listing |
| FacilitatorDirectoryFilters | `src/components/facilitator/FacilitatorDirectoryFilters.tsx` | Search/filter controls for facilitator directory |
| FacilitatorOnboardingForm | `src/components/facilitator/FacilitatorOnboardingForm.tsx` | Facilitator intake questionnaire; POST `/api/facilitator-onboarding` |
| FacilitatorMatchingForm | `src/components/facilitator/FacilitatorMatchingForm.tsx` | Facilitator–retreat matching form |

### seeker/
| Component | Location | Purpose |
|-----------|----------|---------|
| SeekerDiscoveryForm | `src/components/seeker/SeekerDiscoveryForm.tsx` | Multi-step seeker questionnaire; POST `/api/seeker-discovery`; honeypot |

### home/
| Component | Location | Purpose |
|-----------|----------|---------|
| HomeQuickCapture | `src/components/home/HomeQuickCapture.tsx` | Homepage quick-capture form |
| HomeRolePaths | `src/components/home/HomeRolePaths.tsx` | Three role-based entry points (seeker / owner / facilitator) |

### contact/
| Component | Location | Purpose |
|-----------|----------|---------|
| ContactForm | `src/components/contact/ContactForm.tsx` | Contact page form; JSON POST to `/api/contact`; honeypot `company` |

### admin/
| Component | Location | Purpose |
|-----------|----------|---------|
| AdminShell | `src/components/admin/AdminShell.tsx` | Admin page wrapper with nav |
| Pagination | `src/components/admin/Pagination.tsx` | Generic pagination controls |
| StatusBadge | `src/components/admin/StatusBadge.tsx` | Submission/match status chip |

---

## Server data helpers (`src/lib/`)

| Module | Location | Purpose |
|--------|----------|---------|
| Retreat directory queries | `src/lib/retreats/queries.ts` | `listPublishedRetreats`, `getRetreatBySlug` — Supabase server client, RLS-safe reads |

---

## Update Rule

When adding a new component:

1. Add row to this table  
2. Update [`FEATURE_IMPLEMENTATION_STATUS.md`](FEATURE_IMPLEMENTATION_STATUS.md) if user-visible behavior changes  
3. Update STRUCTURE_MAP.md if new domain/architecture (when that doc is maintained)
