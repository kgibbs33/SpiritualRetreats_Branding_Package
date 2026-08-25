# Re-Treat Yourself

**RE:TREAT SUPPORTING YOUR RETREAT** — A validation engine for a global retreat ecosystem connecting seekers, facilitators, retreat owners, and future actor types.

---

## Project Status

**Phase**: Foundational MVP  
**Goal**: Validate demand, supply, and matching feasibility

---

## Documentation

All documentation lives in `/docs`. Start there.

```
docs/
├── 00_business/     # Strategy, experiments, funnel, metrics
├── 10_architecture/ # System design, data model, automations
├── 20_execution/    # Build plan, progress, components
└── README.md        # Doc hierarchy guide
```

---

## Repository Structure

```
/
├── docs/              # Single source of truth (SSOT)
├── src/
│   ├── app/           # Next.js App Router — pages + /api routes
│   ├── components/    # UI components, organized by domain (seeker/, retreat/, facilitator/, admin/, layout/, ui/)
│   ├── lib/           # Utilities, Supabase clients, mail, constants, rate limiting
│   └── validation/    # Zod schemas for forms and API input
├── supabase/
│   └── migrations/    # SQL migrations (schema + one RPC)
├── n8n/               # Reserved for workflow exports — currently empty; the
│                      # actual n8n instance is external, not self-hosted here
└── public/            # Static assets
```

---

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 24 LTS (see `package.json` `engines`, `.nvmrc`) |
| Data | Supabase (PostgreSQL, EU/Frankfurt) |
| Orchestration | n8n (optional, external — see `N8N_FORM_SUBMISSION_URL`) |
| Frontend | Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript 5, Tailwind CSS 4 |
| Email | SMTP (cPanel/Exim) or Resend, selected via `MAIL_PROVIDER` |

---

## Quick Start

1. See **`.env.example`** for every variable the project uses (documented by section, including Section G starter lines for `.env.local`).
2. **`.env.public`** holds committed `NEXT_PUBLIC_*` defaults (loaded via `next.config.ts`).
3. Create **`.env.local`** (`cp .env.example .env.local`, then fill secrets — never commit it). Omit keys that `.env.public` already provides unless you intentionally override them.
4. Optional contact email: configure **Resend** or **cPanel SMTP** (`MAIL_PROVIDER`, `MAIL_FROM`, …) — see **`docs/10_architecture/CONTACT_MAIL.md`**.
5. Run migrations: `supabase db push` (creates `contact_inquiries`, `events`, `seeker_discovery_responses`, `newsletter_subscriptions`, `retreat_submissions`, `retreats`, `facilitator_onboarding_responses`, `facilitator_matching_requests`, `facilitators`, `matches`, plus the `publish_retreat_submission` RPC)
6. `npm install && npm run dev`

Ship history: see [CHANGELOG.md](CHANGELOG.md).

---

## Deployment

Two pipelines, two targets:

- **Production** (`main` branch → `retreatyourself.network`) — `.github/workflows/deploy.yml`. Builds, runs Supabase migrations, and deploys to cPanel/CloudLinux Passenger: one release directory per deploy (`<short_sha>-<timestamp>`), tracked in a `deploy-config.json` on the server (current/previous/last-3-successful/most-recent-failed — the server needs `jq`). After syncing files and adapting `node_modules` for CloudLinux, the workflow dry-run-verifies the app starts, switches Passenger traffic to the new release (`tmp/restart.txt`), then checks `GET /api/health` twice — once right after the switch, and again after cleanup, so a green run actually proves the site is up at the end of the job (see `docs/20_execution/internal/DEPLOY_PIPELINE_FIX_PLAN_2026-08.md` for why the second check exists — a real production outage on 8–9 Aug 2026 happened because the old pipeline only checked once, before its own last mutating step). On health-check failure, the workflow records the failure and triggers `rollback.yml`, which reverts to the last known-good release. Old release *directories* are cleaned up after each successful deploy, but their CloudLinux app registration is deliberately left alone — see the fix-plan doc for why deregistering them was actually the root cause of that outage.
- **Staging** (`develop` branch → `retreatyourself.innerflect.tech`) — `.github/workflows/staging.yml`, triggers a Coolify webhook; Coolify (Hetzner) builds via Nixpacks and runs the container. See `docs/30_infrastructure/COOLIFY_STAGING.md`.

For full setup (repository variables, secrets, `jq`): **`docs/DEPLOYMENT.md`**. Quick reference: **`docs/DEPLOYMENT_CHECKLIST.md`**.

---

## Workflow

Before writing code: read relevant docs.  
After writing code: update docs.

Never leave docs outdated.
