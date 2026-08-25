# Re: Treat Yourself — Deployment Guide

**Purpose**: Checklist for deploying with Supabase, custom domain, and n8n.  
**Primary target**: cPanel Node.js (Passenger) with GitHub Actions + rsync.  
**Alternative**: Railway (kept below for reference).

---

## Overview

| Component | Recommended Setup |
|-----------|-------------------|
| **Hosting (primary)** | cPanel Node.js app (Passenger) on your shared/VPS host |
| **Hosting (alt)** | Railway (PaaS) |
| **Database** | Supabase (PostgreSQL) |
| **Domain** | Your domain (e.g. retreatyourself.network) |
| **Orchestration** | n8n (optional, for contact form → email) |

---

## Prerequisites

- [ ] GitHub repo connected and pushed
- [ ] Railway account
- [ ] Supabase project
- [ ] Domain (DNS managed by your registrar or Cloudflare)
- [ ] n8n instance (optional; contact form works without it)
- [ ] **cPanel deploy:** `jq` installed on the server (used by the workflow to read/update `deploy-config.json` in the releases dir)

---

## 1. Supabase Setup

### 1.1 Create project (if not done)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose org, name (e.g. `retreat-prod`), region, DB password
3. Wait for provisioning

### 1.2 Get credentials

In Supabase Dashboard → **Settings** → **API**:

| Variable | Where to find | Use |
|----------|---------------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Client + server |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` *(preferred)* or `NEXT_PUBLIC_SUPABASE_ANON_KEY` *(legacy)* | Publishable / anon key | Client + server Supabase clients |
| `SUPABASE_SECRET_KEY` *(preferred)* or `SUPABASE_SERVICE_ROLE_KEY` *(legacy)* | Secret key (bypasses RLS) | API routes only; deploy workflow injects both names from one GitHub secret. |

**Important**: Never expose the service role / secret key to the client.

### 1.3 Run migrations

From project root:

```bash
# Install Supabase CLI if needed: npm i -g supabase
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>
supabase db push
```

**Project ref**: Supabase Dashboard → Settings → General → Reference ID.

### 1.4 Verify tables

In Supabase → Table Editor, confirm:

- `events`
- `contact_inquiries`

---

## 2. cPanel Node.js + GitHub Actions (primary)

This section covers the current production deployment: Node.js app managed by cPanel’s Application Manager (Passenger) and synced from GitHub via `deploy.yml`.

### 2.1 Application directories and release layout

Deployments use **one CloudLinux Node.js app entry per release**. On the server:

- **Releases directory**: `~/apps/<APP_NAME>-releases/` — **only release directories and `deploy-config.json`** belong here (no other folders or ad‑hoc files).
- **Release dir name**: `<short_sha>-<timestamp>` (e.g. `a1b2c3d-20250227120000`), so each release is tied to a commit and is a separate app root.
- **Deploy config** (single file in the releases dir): `deploy-config.json` holds all metadata: `format_version`, `current` and `previous` (app-root paths for live and last-working), `successful` (array of up to 3 app-root paths, newest first), and `failed` (most recent failed app-root, for debug). Cleanup keeps only releases listed in that config. The server must have **`jq`** installed for the workflow to read and update the config. If the file is missing, the workflow creates it from legacy `current`/`previous`/`successful`/`failed` files when present.

Each release directory contains a full copy of the app (including `.next/`) after CI deploys. The workflow keeps **last 3 successful** deployments and **only the most recent failed** deployment; all other release dirs are removed by cleanup. Per CloudLinux docs, `cloudlinux-selector get` lists only existing (non-destroyed) app entries; `destroy` removes an app from the selector list.

### 2.2 cPanel Node.js app (CloudLinux Selector)

The workflow **creates** a Node.js app entry per release via CloudLinux Selector (no manual “Create Application” needed for each deploy). For reference, a single app uses:

- **Node.js version**: 24 LTS (selector `--version 24`). This repo targets the current Node.js LTS; ensure CloudLinux/cPanel has Node 24 available.
- **Application root**: one of `~/apps/<APP_NAME>-releases/<release_dir>`.
- **Application startup file**: `app.js`.

Environment variables are injected by the workflow (see Repository secrets below); do not commit them. The workflow sets `NODE_ENV=production` for the CloudLinux app entry so Next.js runs in production mode on the server.

### 2.3 GitHub Actions deploy flow

The workflow `.github/workflows/deploy.yml`:

- **Triggers:** Push to `main`, or **on demand** (Actions → InnerFlect Deploy - Re:Treat Yourself → Run workflow).
- **Build:** Node 24 LTS, `npm ci`, lint/tests, `npm run build`, then `npm prune --omit=dev`. Runs Supabase migrations (`supabase db push`) using the Variables and Secrets below.
- **Domains:** Fetches **APP_DOMAINS** from cPanel on the server via `uapi --output=json DomainInfo list_domains` (parked, addon, main); raw response is logged.
- **Deploy sequence:**
  1. **Clean up at start:** Read `deploy-config.json` (create from legacy `current`/`previous`/`successful`/`failed` files if missing). Remove release dirs not in `successful` and not in `failed`. Destroy their CloudLinux app entries and delete the dirs.
  2. **Create app entry** for this release: `~/apps/<APP_NAME>-releases/<short_sha>-<timestamp>`, then **stop** it (created disabled; CloudLinux has no “create stopped” option).
  3. **Sync** files (including production `node_modules`) with rsync; no npm is run on the server (dependencies are installed in CI and pruned to production-only before sync).
  4. **Inject** env vars into this release’s app via CloudLinux Selector `set`.
  5. **Verify** env (e.g. `ENV_API_KEY` present via `cloudlinux-selector get`).
  6. **Switch deployment:** **Stop all** Node apps for this domain under the releases dir (same app-uri), then **start** the new app. Update `deploy-config.json`: set `previous = current`, `current =` new app root. **Touch** the new app’s `tmp/restart.txt` so Passenger restarts at the new root.
  7. **Health check:** `GET /api/health` on the first domain; passes only on HTTP 200 with response body containing `"ok"` (so only the Node app passes, not static public_html or a debug index.html).
  8. **On success:** Update `deploy-config.json`: prepend this release to `successful` (keep max 3). Then clean up: remove any release dir not in `successful` and not in `failed`; destroy those app entries and delete the dirs.
  9. **On health-check failure:** Update `deploy-config.json`: set `failed` to this release's app root. Trigger rollback. Rollback reverts traffic to `previous` but **leaves the failed deployment on disk** for debug; the next deploy's cleanup keeps only that one failed (or a newer failure).

If the server still serves the old app after a deploy (paths are correct but activation doesn’t switch traffic), the workflow first tries a stop-then-start retry. If that’s not enough, the host may need to reload Apache so it picks up the new app: as root, run `/usr/local/cpanel/scripts/rebuildhttpdconf` then `/usr/local/cpanel/scripts/restartsrv_httpd --graceful` (or ask your host to do so after each deploy).

**SSH "Connection closed by remote host" (exit 255):** The server may close SSH under load or rate-limiting. The workflow retries the "Prepare release dir and clean up" step up to 3 times with a 10s delay, and runs that step in a single SSH session (mkdir + cleanup) to reduce connection churn. If it still fails, ask your host about `MaxSessions`/`MaxStartups` and whether GitHub Actions IPs are limited.

**503 or 404 with blank stderr:** The health check uses the **first domain** in `APP_DOMAINS` (e.g. the cPanel site hostname). If another domain (e.g. `retreatyourself.exchange`) returns 404 for `/api/health`, that domain may not be set to use the Node app in cPanel (Setup Node.js App → ensure the app is attached to that domain, or use the first domain for health). For 503 and an empty `stderr.log` in the release dir, run the diagnostic script from your machine: `ssh <user>@<host> 'bash -s' < scripts/diagnose-server.sh` and paste the output; also check `~/nodejsapp/logs` on the server (cPanel Node.js log location).

**Repository variables** (Settings → Secrets and variables → Actions → Variables):

| Variable | Purpose |
|----------|--------|
| `SSH_HOST` | cPanel server hostname or IP (e.g. `s15256.fra1.stableserver.net`) |
| `SSH_PORT` | SSH port, usually `22` |
| `SSH_USERNAME` | cPanel account username (same as your login) |
| `APP_NAME` | App name for paths (e.g. `retreat-yourself`); deploys go to `~/apps/<APP_NAME>-releases/` |
| `APP_DOMAINS` | **Optional.** Comma-separated list of domains for deploy and health check (e.g. `retreatyourself.exchange,decisive-purple-kangaroo.69-72-149-237.cpanel.site`). If set, the workflow uses this and skips fetching domains via cPanel `uapi` (useful when `uapi` returns empty over SSH). The **first** domain is used for the health check URL. |
| `NODEVENV_APP_NAME` | Legacy/optional. Earlier versions used a shared nodevenv (`~/nodevenv/<name>/24`); the current workflow activates CloudLinux’s per‑app virtualenv based on the application root (`~/nodevenv/apps/<APP_NAME>-releases/<release_dir>/24/…`), matching CloudLinux docs. |
| `SUPABASE_PROJECT_ID` | Supabase Project Ref (Dashboard → Settings → General → Reference ID) |

**Repository secrets** (Settings → Secrets and variables → Actions → Secrets):

| Secret | Purpose |
|--------|--------|
| `SSH_PRIVATE_KEY` | Full PEM private key for SSH access to the server |
| `SUPABASE_ACCESS_TOKEN` | Supabase Cloud PAT (for `supabase link` and migrations) |
| `SUPABASE_DB_PASSWORD` | Supabase database password (for `supabase db push`) |
| `SUPABASE_SECRET_KEY` | Supabase Secret key (service role). Injected as `SUPABASE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` so server code works with either env name. |
| `ENV_API_KEY` | Optional; injected into Node app env if set. |
| `N8N_WEBHOOK_SECRET` | Optional; injected into Node app env for n8n webhook verification. |

You can use separate GitHub environments (e.g. `production`, `staging`) with different variables or duplicate the workflow for multiple branches. The deploy job has `actions: write` so it can trigger the rollback workflow when the health check fails. Fix any ESLint errors locally with `npm run lint` so the job can succeed.

### 2.4 Instant rollback (revert to last working; keep failed for debug)

The workflow `.github/workflows/rollback.yml`:

- **When it runs:** Manually (Actions → Instant Rollback → Run workflow), or **automatically** when deploy’s health check fails (deploy job fails; rollback is triggered and can succeed independently).
- **What it does:** Reverts to the **last working deployment** (the app-root in `previous`). It stops the current (failed) app, starts the previous app, updates `current`, The **failed deployment is left on the server** (not destroyed or removed) for inspection; the next deploy's cleanup keeps only the most recent failed release.
- **Requirements:** Same variables and `SSH_PRIVATE_KEY` as deploy. Rollback needs at least two deployments (so `previous` exists); otherwise it exits with a clear error.

### 2.5 Test the deployment

After a successful workflow run:

- Browse to the cPanel app URL for prod and staging.
- Verify:
  - Home, Discover, Contact, and legal pages load.
  - Contact form writes to `contact_inquiries` and `events` in Supabase.
  - n8n receives webhooks if `N8N_FORM_SUBMISSION_URL` is set.

---

## 2.6 Domains & redirects (production / cPanel)

**Canonical site domain:** `https://retreatyourself.network` (set in `.env.public` as `NEXT_PUBLIC_APP_URL`; CI `APP_DOMAINS` repo variable = `retreatyourself.network`, which the deploy treats as the primary/first domain for SSL + app URL).

**cPanel account note:** the account's *main domain* is still `retreatyourself.host` (changing the account main domain is a WHM/root operation). `.network` must be added as a **shared-docroot domain/alias** via cPanel → *Domains → Create A New Domain*, then issue a cert via *SSL/TLS Status → Run AutoSSL*. DNS for `.network` already points to the server (`69.72.149.237`).

### Role-domain redirects (SCOPE-003 / SCOPE-004)

Implemented **in the app** at [`src/proxy.ts`](../src/proxy.ts) (`HOST_REDIRECTS`), **not** in cPanel. See [ADR-004](10_architecture/ADR-004-host-based-role-redirects.md). Every path on a source host permanently (`308`) redirects to a fixed landing page on the canonical domain.

| Source domain | Destination | Status |
|---|---|---|
| `retreatyourself.host` (+ `www`) | `https://retreatyourself.network/for-retreat-owners` | confirmed (owners) |
| `retreatyourself.expert` (+ `www`) | `https://retreatyourself.network/facilitators-portal` | **provisional — pending Andrew** (coaches/experts) |
| `retreatyourself.exchange` (+ `www`) | `https://retreatyourself.network/facilitators-portal` | **provisional — pending Andrew** (facilitators/marketplace) |

Verify (after deploy):

```bash
curl -sI -H 'Host: retreatyourself.host'     https://retreatyourself.network/any/path | grep -i '^location'  # → .network/for-retreat-owners
curl -sI https://retreatyourself.expert/any/path  | grep -i '^location'                                       # → .network/facilitators-portal
```

> **Why in the app, not cPanel:** a cPanel *Redirect* writes into `public_html/.htaccess`, which the deploy rewrites for Passenger — so it is **clobbered on every deploy** (this happened 2026-06-15; the cPanel wildcard also appended the request path, producing malformed URLs). The `proxy.ts` map is versioned, deploy-safe, and path-complete. **Remove any leftover cPanel `.host` Redirect** so it cannot conflict.

> ⚠️ **Retarget `.expert` / `.exchange`** once Andrew confirms destinations — edit `HOST_REDIRECTS` in `src/proxy.ts`.

---

## 3. Railway Setup (alternative)

### 3.1 Create project

1. [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub** → Select your repo
3. Railway detects Next.js automatically

### 3.2 Configure build & start

Railway runs:

- **Build**: `npm install && npm run build`
- **Start**: `npm run start` (uses `PORT` from Railway)

No changes needed if using the default `package.json` scripts.

### 3.3 Environment variables

Railway → Your service → **Variables** tab.

Add (use **Raw Editor** to paste multiple):

```env
NODE_ENV=production

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
# Legacy: NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SECRET_KEY=sb_secret_...
# Legacy: SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Legal pages (set true when Vanuatu company finalised)
NEXT_PUBLIC_LEGAL_PAGES_VISIBLE=false

# Public URL (your production domain)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# n8n (optional — contact form stores in DB regardless)
N8N_FORM_SUBMISSION_URL=https://your-n8n/webhook/form-submission
```

**Critical**: All `NEXT_PUBLIC_*` vars are baked in at **build time**. If you change them, trigger a **new deploy** (not just restart).

### 3.4 Deploy

Click **Deploy** or push to the connected branch. Railway builds and starts the app.

### 3.5 Test the deployment

Use the default Railway URL (e.g. `https://your-app.up.railway.app`):

- [ ] Home loads
- [ ] Contact form submits (check Supabase `contact_inquiries` table)
- [ ] Legal pages load (when `NEXT_PUBLIC_LEGAL_PAGES_VISIBLE=true`)

---

## 4. Custom Domain

### 4.1 Add domain in Railway

1. Service → **Settings** → **Networking**
2. **+ Custom Domain**
3. Enter `yourdomain.com` and (if needed) `www.yourdomain.com`
4. Railway gives you a CNAME target (e.g. `xxx.up.railway.app`)

### 4.2 Configure DNS

At your domain registrar (or Cloudflare):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | `xxx.up.railway.app` (Railway CNAME) | 3600 |
| CNAME | @ | `xxx.up.railway.app` (or use A/ALIAS per registrar) | 3600 |

**Apex domain**: Some registrars use A records or ALIAS for root. Follow their docs. Railway supports apex via CNAME flattening where supported.

### 4.3 SSL

Railway issues Let's Encrypt SSL automatically. Once DNS propagates, HTTPS is enabled.

### 4.4 Update env vars

Set:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Trigger a **rebuild** so the new URL is baked in.

---

## 5. n8n (Contact form → email)

### 4.1 Create webhook

1. In n8n, create a workflow
2. Add **Webhook** node (POST)
3. Copy the webhook URL

### 4.2 Add to Railway

```env
N8N_FORM_SUBMISSION_URL=https://your-n8n.app/webhook/contact
```

### 4.3 Handle payload

Webhook receives:

```json
{
  "form_type": "contact",
  "data": {
    "name": "...",
    "email": "...",
    "subject": "...",
    "message": "...",
    "id": "uuid"
  },
  "idempotency_key": "contact-uuid-timestamp"
}
```

Add nodes to:

1. Email inquiry to `service@retreatyourself.network`
2. (Optional) Notify ops

---

## 6. Post-deploy checklist

- [ ] Home, Contact, Discover, Legal pages load
- [ ] Contact form → row in `contact_inquiries`
- [ ] Contact form → event in `events`
- [ ] n8n receives webhook (if configured)
- [ ] Custom domain resolves and has HTTPS
- [ ] No console errors in browser
- [ ] Mobile responsive

---

## 7. Troubleshooting

### Build fails

- Check Node version (Railway uses Node 24 LTS by default when `engines.node` is set; ensure compatibility)
- Ensure `npm run build` passes locally

### Contact form returns 500

- Verify Supabase env vars in Railway
- Check Supabase tables exist (`supabase db push`)
- Inspect Railway logs for `createAdminClient` or DB errors

### Domain not resolving

- DNS propagation can take up to 72 hours
- Use `dig yourdomain.com` or [dnschecker.org](https://dnschecker.org)

### NEXT_PUBLIC vars not updating

- Redeploy (rebuild), not just restart
- `NEXT_PUBLIC_*` are inlined at build time

---

## 8. Security notes

- Supabase secret key (`SUPABASE_SECRET_KEY` preferred; `SUPABASE_SERVICE_ROLE_KEY` legacy): Server-only, never in client
- `.env.local` and `.env` are gitignored
- Use Railway’s **Variables** for secrets
- Consider Supabase RLS for `contact_inquiries` if you add auth later

---

## 9. Quick reference

| Task | Command / Location |
|------|-------------------|
| Run migrations | `supabase link && supabase db push` |
| Local dev | `npm run dev` |
| Local build | `npm run build` |
| Env template | `.env.example` |
| Migrations | `supabase/migrations/*.sql` |

---

## Migration files

| File | Purpose |
|------|---------|
| `20240218000000_events.sql` | Event log table |
| `20240218000001_contact_inquiries.sql` | Contact form storage |
