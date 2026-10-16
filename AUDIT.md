# AUDIT — Website Change Brief v0.1 (13 October 2026)

> **Branch:** `milestone-4-website-update` (from `milestone-3-retreats` `c4a5079`)
> **Brief file:** `Light_Path_Retreats_Website_Change_Brief_v0.1_DRAFT.docx`

---

## 1. Brief item status

### Part B — Global changes
| Ref | Item | Status | File(s) | Note |
|-----|------|--------|---------|------|
| G-01 | Header logo | ALREADY DONE | `src/components/layout/BrandLogo.tsx` | M1 replaced with LPR emblem + horizontal lockup |
| G-02 | Header nav | TO DO (Phase B) | `src/components/layout/Header.tsx` | Out of Phase A scope |
| G-03 | "Book Your Retreat" button | TO DO (Phase B) | Header | Placeholder `/#search` |
| G-04 | Retired menu items | ALREADY DONE | `next.config.ts` | 301 redirects already set for most |
| G-05 | Brand name everywhere | ALREADY DONE | M1 + M2 | Grep returns 0 legacy hits |
| G-06 | Guest/Retreat Planner wording | TO DO | `src/` | See §2 below — `seeker(s)` still present in about page |
| G-07 | Tagline | TO DO | Footer, metadata | Add `Lighting the way to spiritual retreats worldwide.` |
| G-08 | Images | BLOCKED | `public/images/` | Marketing team to supply; existing images from CREDITS.md |
| G-09 | Footer company line | TO DO | `src/components/layout/Footer.tsx` | See D6 |
| G-10 | Development credit | ALREADY DONE | Footer | Already changed to Xforria (M1) |
| G-11 | Social links | TO DO | Config | Hide when empty |
| G-12 | Footer columns | TO DO (Phase B) | Footer | Out of Phase A scope |
| G-13 | Legal links | TO DO | `/privacy`, `/terms`, `/cookies` | See D9 |
| G-14 | Metadata canonical/OG | TO DO | `src/app/layout.tsx`, all pages | `metadataBase` already set; confirm `lightpathretreats.com` |
| G-15 | Banned claims removal | TO DO | Various | See §2 |
| G-16 | Demo content removal | TO DO | Migration B (archives 6 demos) | Written, NOT YET APPLIED. Wait for team approval. |
| G-17 | Homepage supa error | NOT APPLICABLE | Already fixed | Homepage uses service-role client gracefully |
| G-18 | Retreat intake form → GHL | TO DO | `src/components/retreat/RetreatIntakeForm.tsx` | See D10 — GHL embed not yet live |
| G-19 | Newsletter | ALREADY DONE | `src/components/ui/NewsletterSignup.tsx` | Uses brand name |
| G-20 | Mobile | ALREADY DONE | All pages | Header/menu responsive; need Playwright check |

### Part C — Existing pages (partial; full table below)
| Ref | Item | Status |
|-----|------|--------|
| H-01 | Hero copy | TO DO (Phase B) |
| H-04 | Stats strip | ALREADY DONE | Removed in M1 |
| H-05 | "Explore by type" | NOT APPLICABLE | Was replaced with search bar in M3 |
| H-06 | "Curated for right now" | ALREADY DONE | Removed in M3 |
| H-07 | "Not a search engine" | ALREADY DONE | Removed in M1 |
| H-08 | Testimonials | ALREADY DONE | Removed in M1/M3 |
| FR-01/02 | /find-your-retreat, /retreat-listings redirect | TO DO (Phase B) | Out of Phase A scope |
| FR-03 | Retreat detail pages | ALREADY DONE | M3; ratings hidden when null |
| RP-01–10 | Retreat Planners page | TO DO (Phase B) | New page /retreat-planners |
| FF-01–05 | Facilitator page | TO DO (Phase B) | New page /find-a-facilitator |
| MR-01 | /make-your-retreat redirect | TO DO (Phase B) | |

### Part D — New pages
| Ref | Item | Status | Note |
|-----|------|--------|------|
| AB-01–03 | About page | TO DO | See D8 (team section) |
| V-01–07 | Find a Venue | TO DO (Phase C) | Not in Phase A |
| FA-01–05 | Find a Facilitator | TO DO (Phase C) | Not in Phase A |
| PW-01–03 | Partner With Us | TO DO (Phase C) | Not in Phase A |
| ED-01 | Education | TO DO (Phase C) | Not in Phase A |

### Part E — Shared components
| Ref | Item | Status | Note |
|-----|------|--------|------|
| E-01–06 | Inquire, Report, Reviews, Marketing, Cancellation, Founding banner | TO DO (Phase C+) | Not in Phase A |

### Part F — Redirects (Phase B)
| Old URL | New | Status |
|---------|-----|--------|
| /find-your-retreat | /#search | ALREADY 301? Yes (reverts to original pattern — no redirect needed yet) |
| /retreat-listings | /#search | KEEP for now — search UI lives there |
| /for-retreat-owners | /retreat-planners | TO DO |
| /facilitators-portal | /find-a-facilitator | TO DO |
| /why-work-with-us | /retreat-planners | TO DO |
| /make-your-retreat | /education | TO DO |
| /retreat-intake-form | GHL (placeholder) | TO DO |
| /facilitator-onboarding | /find-a-facilitator#membership | TO DO |
| /facilitator-matching-form | /find-a-facilitator | TO DO |
| /retreat-discovery-form | Confirm with team | TO DO |

---

## 2. Visible occurrences of banned/legacy terms

### Terms to remove (public-facing only)
| Term | Locations | Count |
|------|-----------|-------|
| `seeker(s)` | `src/app/about/page.tsx:10,18,33`, `src/app/about/our-story/page.tsx:10` | 4 |
| `retreat owners` / `retreat owner` | `src/app/about/page.tsx:10`, `src/app/how-it-works/page.tsx:138` | 2 |
| `organiser` | `src/app/how-it-works/page.tsx:98` | 1 |
| `verified` (badge/claim) | `src/app/admin/(protected)/facilitator-responses/` (admin-only — NOT public) | 3 |
| `2–4 retreats` | `src/app/find-your-retreat/page.tsx:263` | 1 |
| `Owner` role | `src/components/home/HomeRolePaths.tsx` (UNUSED — orphaned, safe) | N/A |

### Internal names — MUST NOT be renamed
| Name | Reason |
|------|--------|
| `retreats.status = 'published'` | DB column, used in queries |
| `qualification_status` values | DB CHECK constraint |
| `form_type` values: `contact`, `seeker_discovery`, `retreat_submission`, etc. | Sent to GoHighLevel — changing would break GHL workflows |
| API routes: `/api/retreat-enquiry`, `/api/admin/retreats`, etc. | Stable API |
| Admin routes: `/admin/retreats`, `/admin/retreats/[id]`, etc. | Stable admin UI |

---

## 3. Page inventory

| Page | Form posts to | Inbound links from | Notes |
|------|--------------|-------------------|-------|
| `/how-it-works` | None (static) | Header nav, Footer | Still mentions "organiser", "retreat owner" |
| `/find-your-retreat` | Links to `/retreat-discovery-form` | Header (Find Your Path), homepage | Contains "2–4 retreats" text |
| `/privacy`, `/terms`, `/cookies` | None | Footer | Gated by `LEGAL_PAGES_VISIBLE=false` |
| `/retreat-discovery-form` | POSTs to form handler | find-your-retreat | Still live |
| `/retreat-intake-form` | POSTs to own API | join-our-community | Built-in form — to be replaced by GHL |
| `/facilitator-onboarding` | POSTs to own API | join-our-community | Built-in form |
| `/facilitator-matching-form` | POSTs to own API | facilitator portal | Built-in form |
| `/join-our-community` | Links to intake forms | Header CTA, Footer | Hub page |
| `/legal-pages-disabled` | None | Layout fallback | Shown when legal pages hidden |
| `/design` | None | Dev only | Returns 404 in production |
| `/venue-application` | POSTs to `/api/venue-submission` | join-our-community | Built-in form |

---

## 4. M3 search today

**Components:**
- `RetreatSearchBar` (`src/components/home/RetreatSearchBar.tsx`) — homepage hero bar
- `RetreatListingsToolbar` (`src/components/retreat/RetreatListingsToolbar.tsx`) — filter bar on `/retreat-listings`
- `retreat-filters.ts` (`src/lib/retreats/retreat-filters.ts`) — zod schema + parse
- `queries.ts` (`src/lib/retreats/queries.ts`) — server-side SQL via admin client

**Smallest way to render on homepage with `id="search"`:** Import `RetreatSearchBar` (already used) or simply wrap it in `<section id="search">`. The filter bar on `/retreat-listings` can be lifted to the homepage with the same component. Both read URL params so any page can host them.

**Filters available:** `q`, `destination` (country/region), `month` (YYYY-MM), `type` (category), `budget` (under_1000..3500_plus), `duration` (weekend..flexible), `sort` (soonest/price_asc/price_desc)

---

## 5. Email, address, phone, social appearances

**Public-facing config values (from D5 — now in `src/config/site.ts`):**
- `support_email`: `contact@lightpathretreats.com`
- `contact_number`: `""` (empty → hidden)
- `address`: `1954 Airport Road, Suite 1338, Atlanta, GA 30341, USA`

**Current hard-coded appearances:**
- `src/components/layout/Footer.tsx`: company line (uses env var `NEXT_PUBLIC_LEGAL_ENTITY_NAME`), mailto link (empty if env unset), no address
- `src/lib/constants.ts`: `CONTACT_EMAIL` from `NEXT_PUBLIC_CONTACT_EMAIL`
- `src/components/contact/ContactForm.tsx`: no address/phone embedded

**Sender/recipient emails (report — DO NOT CHANGE):**
- `src/lib/mail/send-email.ts`: uses Resend API key from env
- `src/lib/mail/team-notification.ts`: sends to `NEXT_PUBLIC_CONTACT_EMAIL`
- `src/lib/mail/contact.ts`: sends user confirmation + team copy
- No hard-coded sender addresses in code — all from env vars / Resend config

---

## 6. GoHighLevel form_type list

All form types sent via `fireFormWebhook()` (`src/lib/webhooks.ts`):
1. `contact`
2. `seeker_discovery`
3. `retreat_submission`
4. `venue_submission`
5. `facilitator_onboarding`
6. `facilitator_matching`
7. `newsletter` (via `/api/newsletter`)
8. `home_quick_capture` (via `/api/home-quick-capture`)
9. `booking_request` (via `/api/retreat-enquiry`)
10. `retreat_enquiry` (via `/api/retreat-enquiry`)

**DO NOT rename these** — changing breaks GHL workflows.

---

## 7. Part F redirect risks

1. **`/find-your-retreat` → `/#search`**: The questionnaire was a secondary option. Redirect is low-risk.
2. **`/retreat-listings` → `/#search`**: This is the live search page. Redirecting it before the homepage has search built in would break the search experience. Hold until Phase B.
3. **`/retreat-intake-form` → GHL**: No GHL form URL configured yet. The current built-in form works. Do not redirect until the GHL form is ready.
4. **Disabled legal pages**: Currently gated behind `LEGAL_PAGES_VISIBLE=false`. If legal pages are redirected before being rewritten, users get 404s.
5. **`/for-retreat-owners` currently 301s to `/join-our-community`** — will need to change to `/retreat-planners`.

---

## 8. Proposed order

### Phase A (this commit)
- D1: Deposit (config, terms wording)
- D2: Card fees (wording)
- D3: 15% commission non-refundable + placeholder
- D4: Payment management "coming soon"
- D5: `src/config/site.ts` config
- D6: Footer company line + address
- D7: Terminology: guests, Retreat Planners, approved
- D8: Team section in /about
- D9: Legal layout component
- D10: GHL embed component

### Phase B (next)
- Navigation rewrite (G-02, G-03), homepage rebuild (H-01–H-12), new page shells

### Phase C
- /retreat-planners, /find-a-venue, /find-a-facilitator, /partner-with-us, /education

### Phase D+
- Inquire form, Reviews, Payments (Stripe), Marketing packages, Founding banner