# Operator invitation flow, 20 November 2026

Status: local build and isolated fixture tests pass. NOT pushed/deployed. Schema NOT applied. Wait for explicit schema approval, then an authorized writable route or owner-applied SQL, before live enablement.

## Scope

Milestone preview only. One listing per invitation, seven-day expiry, admin revocation. Submitted fields and private hero/four gallery photos are saved as revisions pending review. No operator email, payment, booking, direct edit to existing records, auto-publication, or production/main change.

Admin approval records review only, it does not publish text or photos. Publishing is a separate deliberate step and is not built here.

## Storage

Proposed additive SQL: `supabase/migrations/202611200947_operator_invites.sql`.
Three new RLS-protected tables: invitations, assets and revisions. No direct anon/authenticated access; server service role only. Existing private retreat-media bucket for images. No updates to original retreat or retreat_submissions rows.

Invitation token is generated server-side, only a SHA256 hash is stored. Link uses URL fragment, removed on opening; browser session storage keeps the scoped token for reload. Request header authorization; no token query-string logging. Anyone with a valid link can edit that assigned draft, clearly disclosed in UI.

Photo validation: file MIME/signature, 5 MB/24 MP bounds, decode and re-encode, metadata removal, alt/credit/permission/rights confirmation, private authorized image route. Cross-invitation photo access denied. At most five selected slots per revision, 30 stored photo revisions per invitation, 20 submitted revisions per day. Existing listing status and approved media do not change.

## Local verification

Production build and TypeScript pass. ESLint 0 errors, 16 warnings, two new ordinary img warnings for private preview/admin rendering.

`/downloads/light-path-work/test-operator.mjs` uses an external-network-blocking local fixture. Checks scope, fragment removal, save/reload, private images, rights, bad image content, cross-invitation access, confirmation, CSRF, unauthenticated admin, pending review, review-only approval, expiry and revocation. No live database or storage test writes.

Desktop and 390px mobile screenshots inspected, including admin photo and approval controls. Generated plain test image is labelled as a fixture, not a venue.

## Infrastructure check and pause

Read-only management credential could not apply schema. Failed attempts returned read-only transaction and schema permission errors. No tables were created. Browser sign-in was submitted before parent pause arrived, but no project page/SQL editor was opened. Browser closed on pause. Do not retry migration or sign-in without fresh parent direction and owner approval.

Read-only verification: operator tables absent; existing 11 retreat and 17 retreat submission row hashes unchanged. Project also has 17 seeker responses, 45 facilitator onboarding responses, 27 contact inquiries, 33 newsletter subscriptions, two retreat departures. It holds operator contacts and prospective-guest personal information, mixed with some test records. It is not a disposable sandbox. Booked/paid guest status was not established.
