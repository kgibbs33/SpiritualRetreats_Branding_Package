# CI/CD environment (GitHub Actions)

**Vault:** `docs/30_infrastructure` · **Last verified:** 2026-06-17
**Related:** [SUPABASE_EU.md](SUPABASE_EU.md) · [MAIL.md](MAIL.md) · [CPANEL_PASSENGER.md](CPANEL_PASSENGER.md) · [DEPLOYMENT.md](../DEPLOYMENT.md) · [DOMAINS.md](DOMAINS.md)

**Two deploy pipelines:**

| Pipeline | File | Trigger | Target |
|---|---|---|---|
| Production | `.github/workflows/deploy.yml` | Push to `main` | cPanel/CloudLinux/Passenger (`retreatyourself.network`) |
| Staging | `.github/workflows/staging.yml` | Push to `develop` | Coolify/Hetzner (`retreatyourself.innerflect.tech`) |

See [COOLIFY_STAGING.md](COOLIFY_STAGING.md) for the full staging setup.

The production deploy workflow builds, runs Supabase migrations, syncs to the cPanel server over SSH, and injects runtime env via the CloudLinux selector.

> **Mail env** (`MAIL_PROVIDER`, `MAIL_FROM`, `CONTACT_NOTIFY_TO`, `SMTP_HOST/PORT/SECURE/USER` as Variables; `SMTP_PASSWORD` as a Secret) was added to the injection step — see [MAIL.md](MAIL.md).
> **Injection rules learned the hard way** (see [CPANEL_PASSENGER.md](CPANEL_PASSENGER.md)): pass values through a step `env:` block (not inline `${{ }}`), keep values free of quotes/`<>` (e.g. bare `MAIL_FROM`), and note that `cloudlinux-selector set` writes only the `.htaccess` **env** block — the **Passenger** block is managed by app creation, not the deploy.

## Repository Variables (non-secret)

| Variable | Value | Used for |
|----------|-------|----------|
| `SUPABASE_PROJECT_ID` | `ruzxlccdoywshavwtulc` (EU) | `supabase link` + `db push` (migrations target) |
| `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` (EU) | Present, but **unused by the workflow** — see note below |
| `APP_DOMAINS` | `retreatyourself.network` | First/primary domain for SSL + app URL + health check |
| `APP_NAME` | `retreat-yourself` | Release directory naming |
| `NEXT_PUBLIC_LEGAL_PAGES_VISIBLE` | `true` | Gate for legal pages in `proxy.ts` |
| `SSH_HOST` / `SSH_PORT` / `SSH_USERNAME` | `s15256.fra1.stableserver.net` / `22` / `retreatyourself` | Deploy SSH target |

## Repository Secrets

| Secret | Used for |
|--------|----------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI auth for migrations (account PAT) |
| `SUPABASE_DB_PASSWORD` | `supabase link --password` (EU DB) |
| `SUPABASE_SECRET_KEY` | Runtime: injected as `SUPABASE_SECRET_KEY` + `SUPABASE_SERVICE_ROLE_KEY` |
| `SSH_PRIVATE_KEY` | Deploy SSH |

## Where each Supabase value comes from

| Concern | Source | Targets |
|---------|--------|---------|
| Migrations (`supabase link` + `db push`) | `vars.SUPABASE_PROJECT_ID` + `secrets.SUPABASE_ACCESS_TOKEN` + `secrets.SUPABASE_DB_PASSWORD` | EU project |
| Runtime server key | `secrets.SUPABASE_SECRET_KEY` → injected into the Node app | EU project |
| Build-time public client (`NEXT_PUBLIC_SUPABASE_URL`, publishable key) | **committed `.env.public`** (not the workflow) | EU project |

All three layers resolve to the EU instance — verified 2026-06-15.

## Note: `SUPABASE_PUBLISHABLE_KEY` variable is dead

The build reads the public URL and publishable key from committed **`.env.public`**, not from the GitHub variable. The `SUPABASE_PUBLISHABLE_KEY` repo variable is therefore **unused by the workflow**. Both currently hold the same EU value, so it is harmless, but:

> **`.env.public` is the source of truth for the public client.** If keys are rotated, update `.env.public` (and rebuild) — updating only the GitHub variable has no effect. Consider deleting the unused variable to avoid confusion.

## Runtime env vars on the server (complete inventory as of 2026-07-23)

All vars below are injected via the CloudLinux selector `set` step during deploy and land in `.htaccess` `SetEnv` (read only by the Passenger-spawned Node process, **not** by a plain SSH shell):

| Var | Value / origin | Notes |
|-----|---------------|-------|
| `NODE_ENV` | `production` | Standard |
| `SUPABASE_SECRET_KEY` | GitHub secret → `sb_secret_…` | EU Frankfurt project |
| `SUPABASE_SERVICE_ROLE_KEY` | same value | Alias for back-compat |
| `MAIL_PROVIDER` | `auto` | Resolves to SMTP (no Resend key set) |
| `MAIL_FROM` | `noreply@retreatyourself.network` | Bare; see [MAIL.md](MAIL.md) |
| `CONTACT_NOTIFY_TO` | `ops@retreatyourself.network` | Team notifications; decision pending on `team@` |
| `SMTP_HOST` | `mail.retreatyourself.network` | cPanel Exim |
| `SMTP_PORT` | `587` | STARTTLS |
| `SMTP_SECURE` | `false` | STARTTLS (not TLS-on-connect) |
| `SMTP_USER` | `noreply@retreatyourself.network` | cPanel mailbox |
| `SMTP_PASSWORD` | GitHub secret | cPanel mailbox password |
| `UV_THREADPOOL_SIZE` | `2` | Reduces libuv threadpool from default 4; conserves memory on shared hosting |
| `NEXT_DISABLE_SWC` | `1` | Disables SWC (Rust transpiler); forces Babel fallback. Required on CloudLinux because the system glibc is too old for SWC's native binaries |
| `ENV_API_KEY` | *(empty)* | Placeholder; not currently read by the app |
| `N8N_WEBHOOK_SECRET` | *(empty)* | For n8n automation webhooks; not currently in use |
| `DEPLOY_ID` | `<short-sha>-<timestamp>` e.g. `92f3a69-20260723` | Release directory name — matches `~/apps/retreat-yourself-releases/<DEPLOY_ID>/` on server |
| `DEPLOY_SHA` | Full git SHA of the deployed commit | Cross-reference with `git show <sha>` to see exactly what's running |

**Not currently set (gaps):**

| Missing var | Impact |
|-------------|--------|
| `CONTACT_EMAIL` | Falls back to the hardcoded constant in `src/lib/constants.ts` (`grow@retreatyourself.network`). Currently harmless, but should be in the env for parity and configurability. |
| `COOLIFY_WEBHOOK` | Staging deploy workflow (`staging.yml`) cannot trigger Coolify — must be set from Coolify app → Webhooks tab. |
| `COOLIFY_TOKEN` | Required alongside `COOLIFY_WEBHOOK`. Set from Coolify → Keys & Tokens. |

> `OPERATOR_SECRET` was missing at launch (2026-07-23) but has since been injected into the live Passenger process via `cloudlinux-selector set` and added to `deploy.yml`'s injection step — see issue #109 (closed).

## Version tracking

Every deploy injects `DEPLOY_ID` (short-sha + timestamp, matching the release directory) and `DEPLOY_SHA` (full git SHA) into the running process. Two ways to see what's live:

```bash
# JSON response from the health endpoint
curl https://retreatyourself.network/api/health
# → {"ok":true,"deploy":"92f3a69-20260723143052","sha":"92f3a69...full..."}

# Response header — visible on any page without a dedicated fetch
curl -sI https://retreatyourself.network | grep x-deploy-version
# → x-deploy-version: 92f3a69-20260723143052

# Cross-reference the SHA with git to see exactly what's deployed
git show <sha> --stat
```

`DEPLOY_ID` also maps directly to the release directory on the server: `~/apps/retreat-yourself-releases/<DEPLOY_ID>/`.

## Verify

```bash
gh variable list
gh secret list
grep -nE 'SUPABASE|NEXT_PUBLIC' .github/workflows/deploy.yml
grep -nE 'SUPABASE_URL|PUBLISHABLE' .env.public
# To read the live env on the server (SSH env cmd won't work — see CPANEL_PASSENGER.md):
ssh retreatyourself 'cloudlinux-selector get --json --interpreter nodejs --domain retreatyourself.network'
# Or read .htaccess directly:
ssh retreatyourself 'cat ~/public_html/.htaccess'
```
