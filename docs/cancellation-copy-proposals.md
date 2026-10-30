# Cancellation & Commission Copy — Audit & Proposals

**Date:** 30 Oct 2026 · **Status:** AUDIT ONLY — no site file was changed in this step.
Every proposed number/rule below is **not agreed yet** and must not ship without written team sign-off.

## New rule (source: team discussion, NOT yet approved in writing)
- If a **Retreat Planner cancels** a retreat, the guest gets a **full refund** and Light Path's **15% commission is reversed** on that booking.
- Proposed: a **€150 fee** for unjustified planner cancellations, payable by the planner (not agreed yet).
- "Force majeure" (unavoidable event outside the planner's control) recognised **with evidence** (not agreed yet).
- Vouchers always optional; guest may choose full refund, new dates, or a comparable retreat (not agreed yet).

---

## 1. `src/app/how-it-works/page.tsx`

### 1a — lines 54–63 (`4. {w}-hour cancellation window` + note)
**CURRENT:**
> "You can cancel free of charge within {w} hours of booking. After that, the planner's own cancellation policy applies — shown clearly on each retreat page."
> "Placeholder pending legal review: the 15% Light Path fee becomes non-refundable after the 72-hour window."

**PROPOSED:**
> "You can cancel free of charge within 72 hours of booking *(72 hours — not agreed yet)*. After that, the planner's own cancellation policy applies — shown clearly on each retreat page."
> "Placeholder pending team approval: if a Retreat Planner cancels the retreat, you get a full refund and Light Path's commission on your booking is reversed *(full refund + fee reversal — not agreed yet)*. A €150 fee for unjustified planner cancellations has been proposed *(€150 — not agreed yet)*. Force majeure cancellations are considered with evidence *(not agreed yet)*; vouchers are always optional and you may choose a refund, new dates or a comparable retreat *(not agreed yet)*."

### 1b — lines 68–71 (`5. The planner is paid`)
**CURRENT:**
> "Your payments go to the retreat planner after the {w}-hour cancellation window has passed."

**PROPOSED:**
> "Your payments go to the retreat planner after the cancellation window has passed. If the planner cancels, the payment is refunded to you in full *(full refund on planner cancellation — not agreed yet)*."

## 2. `src/app/retreat-planners/page.tsx`

### 2a — lines 63–67 (Fees paragraph)
**CURRENT:**
> "Free to list for 2027 when you register before the end of 2026. When a guest books, Light Path Retreats takes 15% of the ticket price from the first payment. You receive the rest, less card fees, once the 72-hour cancellation window has passed."

**PROPOSED:**
> "Free to list for 2027 when you register before the end of 2026. When a guest books, Light Path Retreats takes 15% of the ticket price from the first payment. You receive the rest, less card fees, once the cancellation window has passed. If you cancel the retreat, the guest is refunded in full and Light Path's 15% commission on that booking is reversed *(rule not agreed yet)*."

### 2b — lines 70–74 (legal-review placeholder)
**CURRENT:**
> "Placeholder pending legal review: the 15% fee is non-refundable after the 72-hour window. Planners handle guest refunds from their remaining balance under their own policy."

**PROPOSED:**
> "Placeholder pending team approval: if you cancel, guests receive a full refund and the 15% commission on that booking is reversed *(not agreed yet)*. A €150 fee for unjustified planner cancellations is proposed *(not agreed yet)*. Cancellation for force majeure, with evidence, is under review *(not agreed yet)*. Vouchers are always optional for guests *(not agreed yet)*."

### 2c — lines 77–81 (worked example)
**CURRENT:**
> "Example: on a EUR 2,000 ticket, the guest pays a EUR 400 deposit (20%). EUR 300 is our fee and EUR 100 goes to you. The remaining payments go to you."

**PROPOSED:**
> (unchanged example, add one sentence) "If the retreat is cancelled by the planner, the guest's deposit is refunded in full and the EUR 300 fee is reversed *(not agreed yet)*."

## 3. `src/content/legal/terms.tsx`

### 3a — lines 28–35 (Liability)
**CURRENT:**
> "…Retreat owners and facilitators are responsible for their own services and policies, including cancellation policies."

**PROPOSED:**
> "…Retreat Planners are responsible for their own services and policies, including cancellation policies. Light Path's platform rule on planner cancellations (full guest refund and commission reversal) will be stated here once agreed in writing *(platform rule — not agreed yet)*."

### 3b — lines 40–45 (Responsibilities)
**CURRENT:**
> "Retreat cancellation policies are set by each retreat; we do not impose a platform-level cancellation policy."

**PROPOSED:**
> "Retreat cancellation policies are set by each retreat. A platform-level rule for planner-initiated cancellations — full guest refund and commission reversal — is proposed and pending written approval *(not agreed yet)*."

## 4. `src/config/site.ts` (pricing block, lines 33–43)
**CURRENT VALUES:** `guest_minimum_deposit_pct: 20`, `lightpath_fee_pct: 15`, `cancellation_window_hours: 72`, `examples: {ticket_eur:2000, deposit_eur:400, lightpath_fee_eur:300, planner_from_deposit_eur:100}`.
**PROPOSED ADDITIONS (wired nowhere yet):** `planner_cancel_fee_eur: 150` and `force_majeure: "with evidence"` as config values with `// not agreed yet` comments, to be consumed only when the rule is approved.

## 5. Other places mentioning cancellation/commission (checked, no change proposed)
- `src/app/find-a-venue/page.tsx` — "15% commission" sentence (line ~48): only describes the venue listing commission; no planner-cancellation claim. Also covers "first 100 venues free 2027" (not part of this rule).
- `src/app/find-a-facilitator/page.tsx` — "No commission on your bookings" (facilitators): unaffected by the planner-cancellation rule.
- `src/components/retreat/RequestPlaceForm.tsx`, `src/components/retreat/RetreatIntakeForm.tsx`, `src/components/seeker/SeekerDiscoveryForm.tsx`, `src/app/api/admin/departures/route.ts`, `src/app/admin/(protected)/retreats/[id]/page.tsx` — only form/admin mechanics; no public cancellation/commission copy.
- `src/content/legal/privacy-content.ts` — generated from draft 3; no cancellation/commission wording.

## FLAGS
1. `how-it-works` placeholder currently says the fee "becomes non-refundable after the 72-hour window" — under the new rule this must become "reversed if the PLANNER cancels". The current sentence does **not** say the commission is kept when the planner cancels, but it also does not cover planner cancellation at all — it must be rewritten before the rule lands.
2. `retreat-planners` "Planners handle guest refunds from their remaining balance under their own policy" — **conflicts** with the new rule (full refund on planner cancellation, commission reversed). This is the closest any current sentence comes to implying the commission/fee survives a planner cancellation. Replace per 2b.