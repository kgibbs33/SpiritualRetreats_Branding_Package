# cPanel / CloudLinux Passenger (hosting internals + outage runbook)

**Vault:** `docs/30_infrastructure` · **Last verified:** 2026-06-17
**Related:** [CICD_ENV.md](CICD_ENV.md) · [MAIL.md](MAIL.md) · [DEPLOYMENT.md](../DEPLOYMENT.md)

How the app actually runs on the cPanel/CloudLinux host, and how to recover the recurring failure modes.

## Serving model

- **App server:** `app.js` — a custom Next.js server (`next().getRequestHandler()` over `http.createServer`). Production runs this, not `next start`. (`getRequestHandler()` does execute `src/proxy.ts`, so middleware/redirects are NOT bypassed.)
- **Runtime:** CloudLinux Node.js Selector + **Passenger** under **LiteSpeed**. Node 24.
- **Release layout:** `~/apps/retreat-yourself-releases/<short_sha>-<timestamp>/`, one CloudLinux app entry per release. `deploy-config.json` in that dir tracks `current` / `previous` / `successful` / `failed`. The deploy keeps the last 3 successful + most recent failed.
- **Node binary per release:** `~/nodevenv/apps/retreat-yourself-releases/<release>/24/bin/node`.

## The `.htaccess` has TWO blocks (this is the key fact)

`~/public_html/.htaccess` drives serving. It contains two independently-managed blocks:

```
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot  "/home/retreatyourself/apps/retreat-yourself-releases/<release>"
PassengerBaseURI  "/"
PassengerNodejs   "/home/retreatyourself/nodevenv/apps/retreat-yourself-releases/<release>/24/bin/node"
PassengerAppType  node
PassengerStartupFile app.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
# DO NOT REMOVE OR MODIFY. CLOUDLINUX ENV VARS CONFIGURATION BEGIN
<IfModule Litespeed>
SetEnv SUPABASE_SECRET_KEY ...
SetEnv MAIL_FROM noreply@retreatyourself.network
... (runtime env)
</IfModule>
# DO NOT REMOVE OR MODIFY. CLOUDLINUX ENV VARS CONFIGURATION END
```

- **PASSENGER block** — tells LiteSpeed to spawn the Node app. **Without it, every request is a LiteSpeed 404.** Written when the app is *created/registered* (`cloudlinux-selector create`) or via the cPanel "Setup Node.js App" UI.
- **ENV VARS block** — runtime environment. Written by `cloudlinux-selector set --env-vars` (the deploy's "Inject env vars" step). **`set` only writes this block — it does NOT write the Passenger block.**

## Outage 2026-06-17: 404 across the whole site

**Symptom:** every URL (site, `/api/health`, role redirects) returned LiteSpeed `404`. `~/public_html/.htaccess` was `0 bytes` (later, env-block only).

**Root cause:** the cPanel account **main domain was changed to `retreatyourself.network`** (from `.host`). That broke the Node app's domain/registration, so the **PASSENGER block was lost**. Subsequent deploys ran `cloudlinux-selector set` (env injection), which rewrote/created the **ENV block only** and never restored the Passenger block → still 404. Reverting the mail-env change did not help, confirming the env vars were not the cause.

**Contributing red herring:** the mail env injection failed separately first — `MAIL_FROM`'s quotes/`<>` broke the deploy `jq` step and the `.htaccess` `SetEnv` line (see [MAIL.md](MAIL.md)). Fixed with a bare `MAIL_FROM` + `env:` block, but the Passenger-block loss was the real outage.

### Recovery

1. **Diagnose:**
   ```bash
   ssh retreatyourself 'wc -c ~/public_html/.htaccess; grep -c "PASSENGER CONFIGURATION BEGIN" ~/public_html/.htaccess'
   ```
   `0` Passenger blocks → the app won't be served.
2. **Restore the Passenger block (preferred):** cPanel → **Setup Node.js App** → the `retreatyourself.network` app → **Restart** / **Save** (regenerates the Passenger block above the env block). If the app entry is missing, **recreate** it: app root `apps/retreat-yourself-releases/<current release>`, startup file `app.js`, Node `24`.
3. **Env is preserved:** `cloudlinux-selector set` populates the ENV block (Supabase + mail). Confirm with `cloudlinux-selector get --json --interpreter nodejs --domain retreatyourself.network`.

> **Do not redeploy** while the Passenger registration is broken — each deploy's `set` rewrites only the env block and leaves the site 404. Stabilize the app registration first.

## Watching: intermittent health-check failures, first seen 2026-08-10

**Not yet root-caused. Logged here so a recurrence is recognized as a pattern, not investigated from scratch each time.**

Two distinct deploy-time failures in one session, both self-healing on a plain re-run with no code change:

1. **10:22 UTC** — `Add cPanel Server to Known Hosts` failed: `ssh-keyscan` couldn't reach `s15256.fra1.stableserver.net` on port 22, 3 attempts, 10s apart. Confirmed the host *was* reachable from outside GitHub's network at the same time — looked like a runner-specific transient (GitHub Actions runner IPs are ephemeral; a re-run gets a fresh one). Re-run succeeded immediately.
2. **11:40 UTC** — `Health Check` failed differently and more interestingly: **every** poll (6 attempts, then a `cloudlinux-selector stop`/`start` cycle, then 6 more) returned **HTTP 200**, but the response body evidently did not contain `"ok"` (the script's failure branch, which prints `got HTTP $STATUS`, only fires when the body check *also* fails — so this was a 200 with the wrong body, not a dead server). Ruled out as a regression before retrying: the diff for that deploy never touched `src/app/api/health/`, `npm run build` was green both in CI and locally, and production was never actually at risk — the failure is after the traffic switch, so the existing release kept serving throughout, and the pipeline's own rollback (added after the 17 June outage, above) fired correctly. Plain re-run succeeded cleanly on the next attempt.

**What a 200-with-wrong-body implies, if it recurs enough to investigate:** something serving 200 that isn't the Next.js app's own `/api/health` route — a Passenger "still starting" placeholder some configurations serve at 200 during a slow boot, a LiteSpeed/host-level error page misconfigured to return 200, or a CDN/edge cache serving a stale response during the DNS/switch window. Not distinguishable from the GitHub Actions log alone — would need an SSH session live during the failure window to `curl -v localhost` directly on the box, which no one has had reason to do since it self-resolved both times.

**If this becomes frequent rather than rare:** the concrete next step is adding the actual response body (not just the status) to the `##[error]` line in `deploy.yml`'s `Health Check` step, so the next occurrence is diagnosable from the log alone instead of requiring a live SSH session during the failure window.

## Zombie / stale `lsnode` processes (recurring)

Child Node processes from **old releases** sometimes don't terminate and linger as `lsnode` processes, interfering with serving. Usual fix: kill them and restart the current app.

```bash
ssh retreatyourself 'ps -eo pid,ppid,stat,etime,cmd | grep -i lsnode | grep -v grep'
# kill the stale PIDs (from non-current releases), then restart current:
ssh retreatyourself 'kill -9 <PID> <PID>; touch ~/apps/retreat-yourself-releases/<current>/tmp/restart.txt'
```

Note: killing zombies only helps if the **Passenger block is present**. If `.htaccess` is also missing it (the outage above), restore that first.

## Inspecting live state

The correct command to read the running app's configuration (including all env vars) is:

```bash
ssh retreatyourself 'cloudlinux-selector get --json --interpreter nodejs --domain retreatyourself.network'
```

This returns the full app registry: each release entry under the `24.17.0` → `users.retreatyourself.applications` key, with `app_status`, `env_vars`, `startup_file`, `virtualenv`, and `domain`. The shorter form `cloudlinux-selector get --json` (no `--interpreter nodejs`) still works but wraps everything in a large `available_versions` envelope. The `--domain` flag is optional but reduces noise.

> **Critical:** `env` in an SSH shell does **not** show Passenger-injected vars. The `SetEnv` directives in `.htaccess` are interpreted by LiteSpeed/Passenger and injected only into the Node.js process. A plain SSH session has a different environment. To confirm what the running app actually sees, read `.htaccess` directly or use `cloudlinux-selector get`.

### Current state (verified 2026-07-23)

Three releases on disk (`~/apps/retreat-yourself-releases/`):

| Release dir | Commit | Deployed | Status | Notes |
|-------------|--------|----------|--------|-------|
| `d2fdda3-20260617165558` | d2fdda3 | 2026-06-17 16:55 | stopped | Failed: quoted `MAIL_FROM` broke `.htaccess` |
| `d2fdda3-20260617170635` | d2fdda3 | 2026-06-17 17:06 | stopped | Second attempt, fixed `MAIL_FROM` |
| `fb9f7fd-20260617171121` | fb9f7fd | 2026-06-17 17:11 | **started** | The revert; currently active |

The Passenger block points to `fb9f7fd-20260617171121`. The two `d2fdda3` entries are stale and can be removed once a newer deploy lands.

## Env injection caveat (for the deploy)

`.github/workflows/deploy.yml` "Inject env vars into CloudLinux Selector" builds the env JSON with `jq` and applies it via `cloudlinux-selector set`. Rules learned the hard way:

- Pass secret/var values via a step **`env:` block** and reference `$VAR` in `jq --arg` — never inline `${{ }}` (values with quotes/`<>`/spaces break the shell).
- Keep env **values free of `<` `>` and quotes** (they break the `.htaccess` `SetEnv` line). E.g. `MAIL_FROM` bare.
- `set` overwrites the whole env set and only writes the ENV block; it does not manage the Passenger block.
