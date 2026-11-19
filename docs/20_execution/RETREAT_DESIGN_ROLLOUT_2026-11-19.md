# Retreat directory design update, 19 November 2026

## Scope

Updated only the `milestone-4-website-update` branch behind the existing milestone Vercel URL. `main` and `lightpathcollective.com` are not part of this change.

- Responsive forest/cream/gold retreat search page, horizontal result cards and an intentional empty state.
- Existing server-side search and published/live qualification gates retained, with working GET filters and results pagination.
- Detail content component with gallery, description, available inclusions/exclusions/programme fields, departure requests and enquiry controls.
- Existing public/admin access split retained. RequestPlaceForm sends the same endpoint and payload as before; the wrapper gains dialog semantics and scoped presentation styling.
- Public list and detail reads exclude the exact mock-seed slugs documented in demo-records.ts. No rows are deleted, archived or edited. Admin reads remain unchanged.
- No invented prices, reviews, verified claims, availability or venue imagery was added. The design-demo fixtures and generated concept images were not included in this branch.

## Inventory caveat

At verification time, the public database returned no eligible real retreats after known mock seeds were excluded. The directory therefore displays an honest empty state. Old seeded detail URLs return 404 to public visitors. A populated real detail page cannot be verified until a genuine published/live record is available.

## Verification

TypeScript check passes. Targeted lint has no errors; two existing-style native-image performance warnings remain in the gallery. The real-project preview was visually checked at desktop and 390px. Hosted searches/empty states, zero horizontal overflow at 1440/390/320px, and a seeded detail 404 were checked. The populated detail component, gallery, correct night count, availability label and existing enquiry modal were checked locally with a temporary marked test fixture that was removed before deployment. No real enquiry, booking or payment was submitted.

## Rollback

Previous milestone commit: `847f4a8bed5c2da70fe768e941b0c5d915bfa8ec`.
Previous milestone deployment: `dpl_GNdzjVgpZVdX5Vm1X6gciHruqpMY`.
Previous immutable deployment URL: https://spiritual-retreats-branding-package-8nrkei9a3-xforria.vercel.app

To revert this design in source, revert its single commit on `milestone-4-website-update` and push that branch. This creates a new branch preview and updates its alias without changing `main`. For an immediate URL rollback, reassign only the milestone branch alias to the previous deployment in Vercel. Do not promote the old preview to production. The old deployment is retained; no database rollback is needed because no database mutation was made.
