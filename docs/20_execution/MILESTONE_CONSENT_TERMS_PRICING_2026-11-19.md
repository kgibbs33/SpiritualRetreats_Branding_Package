# Milestone legal, consent and price review, 19 November 2026

Scope: only `milestone-4-website-update` and its requested Vercel preview alias. No production deployment, main-branch write, billing activation, operator messages or existing submission edits.

## Supplied documents

- Retreat Planner Terms v1.0, 13 November 2026, 21 pages.
- Venue Terms v1.0, 13 November 2026, 15 pages.
- Facilitator Terms v1.0, 16 November 2026, 14 pages.
- Internal venue sales fact sheet, 16 November 2026, 4 pages.
- Internal planner sales fact sheet, 16 November 2026, 5 pages.

The three agreements are published in full as HTML and original PDFs. The two internal sales fact sheets are not published. No contractual clauses or prices have been silently rewritten. Existing Privacy Policy remains marked pending approval.

## Price reconciliation

| Item | Supplied agreement | Previous site | Milestone correction |
| --- | --- | --- | --- |
| Planner Bronze | EUR 12.22/month or EUR 122.22/year per listing, section 6.1 | No clear membership price; generic packages | Explicit membership cards |
| Planner Silver/Gold | Monthly, instead of Bronze; price delegated to website, section 6.2 | Generic package amounts with unclear period/role | Membership pricing marked to confirm, not guessed |
| Planner founding offer | First 500 listings registered before 31 December 2026; Bronze free throughout 2027; commission still applies; paid Bronze from 2028 with notice | Broad free-listing promise | Limits, tier, commission and transition stated |
| Planner commission | 15% of full ticket price from first payment, sections 5.10-12 | 15%, but wrong deposit and payout timing | 15% retained; correct base, timing, Stripe fees, merchant identity |
| Retainer | 40%, only more than 6 weeks ahead and ticket >= EUR 300, unless full payment chosen | 20% minimum chosen by planner | 40%, threshold and full-payment exceptions stated |
| Full payment | 100% within 6 weeks, tickets < EUR 300, or planner choice | Omitted exceptions | Added |
| Guest window cancellation | EUR 30 plus actual processing costs deducted; commission returned less EUR 30, section 5.14 | EUR 30 only, window appeared universal | Processing costs and eligibility stated |
| Planner cancellation | EUR 150 when at least one platform booking; waiver exceptions; invoiced due 14 days; commission kept; guests refunded in full within 14 days, 5.17/A/B | Missing fee | Added with exceptions |
| Extra commission | 15% on room upgrades/transfers added through platform; invoice due 14 days, 5.13A | Missing | Added |
| Excluded extras | Optional treatments, activities, extra nights/travel outside retreat dates carry no commission, 5.13A | Missing | Added |
| Stripe fees | Variable card/currency fees at Stripe rates; 4.5% is illustrative only | Unclear example | Corrected and expressly illustrative |
| Venue Bronze | EUR 199/year, one venue, 8.2 | No accurate membership summary | Added |
| Venue Silver | EUR 499/year, one venue, 8.3 | Generic packages | Added |
| Venue Gold | EUR 1,190/year, up to five approved venues, 8.4 | Generic packages | Added |
| Venue commission | None, 3.2 | Incorrect 15% | Removed; no commission or booking fee |
| Venue founding offer | First 100 approved venues; Bronze free only until 31 March 2027; offer closes then or at capacity; first charge 1 April; reminder by 15 February; cancel by 1 March | Full 2027 free for registrations before end 2026 | Replaced with contractual conditions |
| Venue upgrades | Difference for remaining membership year; renewal unchanged, 8.9 | Omitted | Added summary, full agreement retained |
| Facilitator | EUR 12.99/month or EUR 129.90/year; no commission; one person/profile, 8/10 | EUR 12.22/month or EUR 122/year; starts day one | Corrected prices and billing after approval/payment |
| Refunds/renewals | Memberships non-refundable; role-specific deadlines | Incomplete | Added and linked to complete terms |
| Tax | Membership/fee amounts are before applicable tax | Incomplete | Clearly stated; no tax rate invented |
| Promotion packages | User separately supplied Bronze EUR 49.99, Silver EUR 122.22, Gold EUR 499 on 19 November | Same amounts, unverified inclusions/period | Not displayed: user subsequently instructed at 22:15 UTC to follow the PDFs only; no document supports the generic package amounts |

### Illustrative figures, not extra charges

Planner terms page 8 contains EUR 3,000 and EUR 10,000 ticket examples; EUR 1,200/EUR 4,000/EUR 3,000 payments; EUR 450/EUR 1,500/EUR 450 commissions; EUR 54/EUR 180/EUR 135 assumed card costs; EUR 696/EUR 2,320/EUR 2,415 remainders; EUR 1,800/EUR 6,000 balances. Page 9 cancellation example includes EUR 84 cancellation deduction, EUR 1,116 guest refund, EUR 420 commission returned, EUR 696 starting planner balance and EUR 0 final position. All appear in the full supplied agreements and original PDFs. The EUR 3,000 retainer example is also summarised on the planner page. These figures do not set a fixed Stripe fee.

## Questions for approval

1. Planner Silver and Gold monthly prices and inclusions are not set out in the PDF, which delegates them to the website. They remain unavailable with pricing awaiting confirmation. The user instructed at 22:15 UTC to follow the PDFs, so the generic promotion-package amounts are not used.
2. Planner Bronze yearly text calls EUR 122.22 ten months' price, while EUR 12.22 x 10 is EUR 122.20. The exact EUR 122.22 contractual price is preserved. Confirm whether the two-cent difference is intentional.
3. Venue founding signups remain allowed until 31 March, but the first cancellation deadline is 1 March and the stated reminder is 15 February. Clarify treatment of venues joining after those dates before billing is implemented.
4. Planner clause 1.5 requires Guest Terms. No Guest Terms were among the five attachments. Existing Privacy/Cookie policy approval is also still pending. These do not block visual review, but do matter before taking guest payments.

## Consent implementation

- Two distinct unchecked boxes immediately before submission in the planner, venue and facilitator forms.
- First box required in UI and enforced by API with strict boolean validation. It links to the correct role agreement and Privacy Policy in a new tab without discarding the form.
- Marketing is optional and false by default. Choosing false does not prevent submission.
- The existing private `events` table records `listing_consent_recorded` before creating the submission, with the generated submission UUID as `entity_id` and role-specific `entity_type`.
- Record includes server UTC timestamp, terms true, privacy-read true, terms path/version/PDF SHA-256, Privacy source SHA-256, both checkbox wordings, wording version, marketing true/false and marketing choice timestamp. No IP or user agent is collected.
- Consent-write failure stops the submission. A later submission failure may leave an audit event referencing an absent submission; it is not evidence of a successful signup. No prior events or submission rows are edited or deleted.
- Marketing boolean is passed to the existing webhook. No marketing subscription workflow or email campaign was activated.
- Read-only live schema check confirmed events has UUID linkage and JSON payload, RLS enabled, deny-public policy for anon/authenticated. No schema migration was needed.

## Readiness

Ready for milestone visual/content review after deployment and live checks. Not a booking/payment launch. Stripe Connect, checkout, recurring membership billing, tax, renewal reminders, cancellation/refund automation, launch-grade guest/member accounts and their policy enforcement remain separate work. No payment is taken or card collected by this change.

Tests use an isolated in-memory backend, with external network blocked. They verify required/optional choices, true/false/default stored values, version hashes/timestamps/linkage, and failure blocking. Live checks deliberately submit only invalid/missing-consent payloads, so they create no real applications or email notifications. No successful live submission is claimed.
