# Coolify Staging Environment

**Vault:** `docs/30_infrastructure` · **Last verified:** 2026-07-23
**Related:** [CICD_ENV.md](CICD_ENV.md) · [CPANEL_PASSENGER.md](CPANEL_PASSENGER.md)

## Overview

| | Staging | Production |
|---|---|---|
| **URL** | `https://retreatyourself.innerflect.tech` | `https://retreatyourself.network` |
| **Branch** | `develop` | `main` |
| **Host** | Hetzner VPS (Coolify) | cPanel/CloudLinux (Passenger) |
| **Build** | Nixpacks (`nixpacks.toml`) | GitHub Actions + rsync |
| **DB** | Supabase EU (same project — `ruzxlccdoywshavwtulc`) | Supabase EU (same) |
| **Deploy trigger** | `.github/workflows/staging.yml` → Coolify webhook | `.github/workflows/deploy.yml` |

> **Database:** Staging and production share the same Supabase Frankfurt project for Phase 1.
> Separate staging DB is a Phase 2 concern once the client takes over.

---

## Architecture

```
Push to develop
      │
      ▼
GitHub Actions (staging.yml)
  └─ curl COOLIFY_WEBHOOK
      │
      ▼
Coolify (Hetzner VPS) — pulls repo, builds via Nixpacks
  ├─ setup:   nodejs_24
  ├─ build:   npm run build → npm prune --omit=dev
  └─ start:   NODE_ENV=production node app.js
      │
      ▼
Container on port 3000
      │
      ▼
✅ retreatyourself.innerflect.tech
```

---

## Git flow

```
feature/xxx ──┐
              ▼
           develop  ──→  [Coolify staging auto-deploys]
              │
              ▼ (PR + review)
            main    ──→  [GitHub Actions → cPanel production]
```

All work branches off `develop`, not `main`. PRs target `develop`. Once staging is verified, `develop` is merged to `main` for production.

---

## GitHub secrets required

These must be set in **repo Settings → Secrets → Actions** before the staging workflow can trigger a deploy:

| Secret | Where to find it | Status |
|---|---|---|
| `COOLIFY_WEBHOOK` | Coolify → Application → Webhooks tab → Deploy Webhook URL | ⚠️ **not yet set** |
| `COOLIFY_TOKEN` | Coolify → Keys & Tokens → API Token | ⚠️ **not yet set** |

To set them:
```bash
gh secret set COOLIFY_WEBHOOK --repo InnerFlect-Tech/Re-Treat-Yourself
gh secret set COOLIFY_TOKEN --repo InnerFlect-Tech/Re-Treat-Yourself
```

---

## Environment variables (set in Coolify app, not GitHub)

All runtime env vars are configured directly in the Coolify application's **Environment Variables** panel (not injected by the GitHub Actions workflow — Coolify handles that for container deployments).

| Var | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` (EU) | Same as production |
| `SUPABASE_SERVICE_ROLE_KEY` | same value | Alias |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ruzxlccdoywshavwtulc.supabase.co` | From `.env.public` (baked at build) |
| `NEXT_PUBLIC_APP_URL` | `https://retreatyourself.hetzner.innerflect.tech` | **Different from production** — canonical staging domain |
| `OPERATOR_SECRET` | staging admin password | Use a different value from prod |
| `SESSION_SECRET` | 32-byte random base64url | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `MAIL_PROVIDER` | `auto` | |
| `MAIL_FROM` | `noreply@retreatyourself.network` | Same mailbox is fine for staging |
| `CONTACT_NOTIFY_TO` | `ops@retreatyourself.network` or personal | |
| `SMTP_HOST` | `mail.retreatyourself.network` | |
| `SMTP_PORT` | `587` | |
| `SMTP_SECURE` | `false` | |
| `SMTP_USER` | `noreply@retreatyourself.network` | |
| `SMTP_PASSWORD` | cPanel mailbox password | |
| `PORT` | `3000` | Coolify sets this; app reads `process.env.PORT` |

> **`NEXT_PUBLIC_APP_URL`** must be set to the staging domain so SEO canonicals and metadata resolve correctly against the staging URL.

---

## Nixpacks build config (`nixpacks.toml`)

Located at repo root. Coolify auto-detects it. Key settings:

- `NIXPACKS_NODE_VERSION = "24"` — matches `.nvmrc`
- `npm run build` + `npm prune --omit=dev` in build phase
- `.next/cache` cached between builds (faster incremental rebuilds)
- `node app.js` as the start command (same entry point as production)

> **No `NEXT_DISABLE_SWC`** — the Hetzner VPS has a modern glibc, so SWC's native binaries work. This is deliberately different from the cPanel production server, which still needs `NEXT_DISABLE_SWC=1`.

---

## Coolify app settings (reference)

| Field | Value |
|---|---|
| Name | `Re-Treat Yourself — Staging` |
| Repository | `InnerFlect-Tech/Re-Treat-Yourself` |
| Branch | `develop` |
| Build pack | Nixpacks |
| Port | `3000` |
| Domains | `https://retreatyourself.innerflect.tech`, `https://retreatyourself.hetzner.innerflect.tech` |
| Health check path | `/api/health` |
| Project ID | `bedo5ej88rpa2gybm5r62qsm` |
| Environment ID | `n2vw3b8aa9ikr6qrnznf201j` |
| Application UUID | `bamuc7bt2pna04pi0izll5be` |
| Dashboard URL | `https://coolify.innerflect.tech/project/bedo5ej88rpa2gybm5r62qsm/environment/n2vw3b8aa9ikr6qrnznf201j/application/bamuc7bt2pna04pi0izll5be` |

---

## Supabase migrations on staging

Migrations are pushed to the **shared Supabase project** as part of the production deploy pipeline (`.github/workflows/deploy.yml`, `supabase db push` step on merge to `main`). Staging does not run its own migration step — it reads the same schema.

If a migration needs testing on staging before it goes to production, run it manually:
```bash
supabase link --project-ref ruzxlccdoywshavwtulc --password <DB_PASSWORD>
supabase db push
```

---

## Verify

```bash
# Confirm staging is live (both domains should respond)
curl -s https://retreatyourself.innerflect.tech/api/health | jq .
curl -s https://retreatyourself.hetzner.innerflect.tech/api/health | jq .

# Trigger a manual staging deploy (if webhook is configured)
gh workflow run staging.yml --repo InnerFlect-Tech/Re-Treat-Yourself --ref develop

# Check staging workflow runs
gh run list --repo InnerFlect-Tech/Re-Treat-Yourself --workflow=staging.yml
```
