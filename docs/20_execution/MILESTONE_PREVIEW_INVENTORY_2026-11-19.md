# Milestone preview inventory and daily read, 2026-11-19

Owner approved four preview listings and the daily read through a thumbs-up to the November 19 preview/keep-alive offer. Prior offer disclosed possible small Vercel Pro overage. Only milestone-4-website-update is in scope.

- Four static snapshots: Madeira, Brazil, Tulum, Peru. They are review material, not verified inventory.
- Enabled only with VERCEL_ENV=preview and VERCEL_GIT_COMMIT_REF=milestone-4-website-update.
- No photographs impersonate the actual retreats. Placeholders say photos pending.
- Details retain unresolved capacity, facilities, operator, terms and consent caveats.
- No booking or enquiry form on the four snapshots. No database changes.
- Preview listing/detail metadata is noindex/nofollow.
- Live production/main code is unchanged.

Daily schedule: supabase-daily-read, 09:17 UTC, 15-minute jitter. Preview schedules start inactive and must be enabled explicitly for this branch. GET /api/supabase-keepalive checks the preview branch and CRON_SECRET before sending three no-store public-role SELECT id LIMIT 1 requests to the exact Frankfurt project. It never returns record data or uses a secret/admin Supabase key. CRON_SECRET is sensitive and scoped only to this preview branch.

Supabase says a few daily database requests usually avoid automatic pausing, but it does not guarantee that outcome. This is not a backup and does not prevent intentional deletion or a platform incident.

References:
- https://supabase.com/docs/guides/platform/free-project-pausing
- https://vercel.com/docs/schedules/configuration
- https://vercel.com/docs/schedules/handle-runs
- https://vercel.com/docs/schedules/http-api

Local checks: TypeScript passes; lint no errors. Four details 200, pending notices present, no request/enquiry buttons, noindex. Search Madeira returns one card. Desktop 1440px and mobile 390px/320px have no overflow. Missing auth keep-alive returns 401. No forms submitted.

To stop future reads, disable supabase-daily-read for the milestone preview branch via Vercel Schedules. Removing the static schedule and redeploying the branch removes it. No production schedule should be enabled for this task.
