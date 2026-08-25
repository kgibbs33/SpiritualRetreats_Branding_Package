# Supabase (EU / GDPR)

**Vault:** `docs/30_infrastructure` · **Last verified:** 2026-06-15
**Related:** [CICD_ENV.md](CICD_ENV.md) · [CONTACT_MAIL.md](../10_architecture/CONTACT_MAIL.md)

The platform's database is hosted on Supabase in the **EU** for GDPR data residency.

## Projects

| Project | Ref | Region | Role |
|---------|-----|--------|------|
| **GDPR Website** | `ruzxlccdoywshavwtulc` | Central EU (Frankfurt, eu-central-1) | **Active** — all reads/writes |
| Website (legacy) | `tzmnvbuhnugaiefpdfhp` | SE Asia (Singapore, ap-southeast-1) | **Paused** — unreachable, no data flow |

Per Supabase guidance (Context7 `/supabase/supabase`): each project is deployed into the region chosen at creation and all data remains in that region; ensuring the correct region is the customer's responsibility. The active project is EU, so data residency is satisfied.

### Evidence (verified 2026-06-15)

- The app's active `NEXT_PUBLIC_SUPABASE_URL` (in `.env.public` and `.env.local`) is the EU project.
- Live row counts via service-role REST on the EU project: events 50, contact_inquiries 17, seeker_discovery_responses 16, retreat_submissions 13, facilitator_onboarding_responses 9, newsletter_subscriptions 15.
- The Singapore project's REST host does not resolve (paused).
- The Supabase CLI is linked to the EU project; the pooler URL is `aws-1-eu-central-1`.

## API keys

Uses the **2026 Supabase API key format**:

- `sb_publishable_…` — public client key (replaces the legacy `anon` JWT). In `.env.public` as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `sb_secret_…` — secret/service key (replaces the legacy `service_role` JWT). Server-only; injected at runtime by the deploy as both `SUPABASE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (legacy alias) — see [CICD_ENV.md](CICD_ENV.md).

Never expose the secret key to the client.

## Schema notes

- The `facilitator_onboarding_responses` table was extended (June 2026, SCOPE-026–030) with profile fields: photo, location (`city`/`region`/`country`), CV PDF, `website_url`/`linkedin_url`/`instagram_url`, and `referrals` (jsonb) + `referral_consent`. All admin-only (RLS enabled, no policies). Full column list in [`DATA_MODEL.md`](../10_architecture/DATA_MODEL.md).
- Private Storage bucket `facilitator-media` holds facilitator headshots + CV PDFs; details in [`STORAGE.md`](STORAGE.md).

## Residual cleanup

- The paused Singapore project can be deleted once confirmed unneeded.
- Keep the CLI linked to EU (`supabase link --project-ref ruzxlccdoywshavwtulc`).

## Verify

```bash
supabase projects list            # confirm linked project = ruzxlccdoywshavwtulc (EU)
supabase migration list --linked  # remote migrations on the EU project
```
