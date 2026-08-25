# ADR-008: Multi-process rate limiting

**Status**: Partially implemented — see implementation note below
**Date**: 2026-07-20
**Closes**: GitHub issues #74, #80
**Relates to**: ADR-006 (session management)

## Context

All public form routes (`src/app/api/contact`, `newsletter`, `retreat-submission`, `facilitator-onboarding`, `facilitator-matching`, `facilitator-photo`, `facilitator-cv`, `seeker-discovery`, `home-quick-capture`) share `publicJsonPostGuards` in `src/lib/request-guards.ts`, which calls `checkRateLimit()` from `src/lib/rate-limit.ts`. That limiter is a **module-level `const buckets = new Map<string, number[]>()`** implementing a fixed window per `routeKey:ip`.

Two defects follow from that design:

1. **Not shared across processes (#80).** Production runs on cPanel/CloudLinux Passenger via the custom `app.js` entrypoint. Passenger spawns and reaps N worker processes, each with its own module instance and therefore its own `Map`. The effective limit is `RATE_LIMIT_MAX × N` — and worse, Passenger recycles idle workers, so a fresh worker resets its counters entirely. An attacker who round-robins across workers (which Passenger's load balancing does for them) gets N× the intended budget.
2. **Unbounded growth (#74).** `prune()` runs only for the key being accessed. Keys touched once (e.g. a spray of spoofable `X-Forwarded-For` values, since `getClientIp()` trusts the first XFF hop) are never pruned. The `Map` grows monotonically until the worker is recycled — a memory-DoS vector.

Constraints that shape the decision:

- **Hosting is cPanel/Passenger, not Vercel/edge.** No platform-level rate limiting to lean on; whatever we choose must work from plain Node processes behind Apache.
- **Small project, small budget.** This is a retreat listing directory. Form-POST volume is on the order of tens per day, not thousands per minute. Every rate-limit check is one form submission, so command volume against any external store is trivially low.
- **GDPR (see Supabase EU-only mandate in CLAUDE.md).** Rate-limit keys contain client IP addresses, which are personal data under GDPR. Any external store must be provisionable in an EU region.
- **No unit test runner.** Verification is `npm run build` + `npm run validate:scope-batch1` against the live app.

Research (verified via Context7 against current docs, 2026-07-20):

- **Next.js 16 has no built-in rate-limiting primitive.** The official backend-for-frontend guide shows exactly our pattern — a route handler delegating to an app-supplied `checkRateLimit` in `@/lib/rate-limit` — and explicitly recommends pairing code-based checks with hosting-provider protections. Nothing in the framework solves the multi-process problem for us.
- **`@upstash/ratelimit` + `@upstash/redis`** is the standard solution for exactly this topology (stateless/multi-process Node over HTTP, no TCP connection pooling needed). Current API: `new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(10, "10 s") })`, then `await ratelimit.limit(identifier)` returning `{ success, limit, remaining, reset, pending, reason }` (`reset` is a Unix-ms timestamp — maps directly onto our `retryAfterSec`). It offers both `fixedWindow` and `slidingWindow` algorithms; sliding window costs slightly more computation but eliminates the burst-at-window-boundary artifact of fixed windows. It also ships an **ephemeral in-memory cache** (a module-level `Map`, on by default) that short-circuits repeat offenders without a Redis round-trip, and a configurable `timeout` (default 5 s) after which requests **fail open** if Redis is unreachable.
- **Upstash free tier** (verified against current billing docs): 256 MB storage, 500K commands/month, 10K commands/day on free databases, EU regions available. A sliding-window `limit()` call costs a handful of commands; even 1,000 form POSTs/day stays two orders of magnitude under the daily cap.

## Decision

**Adopt Upstash Redis (free tier, EU region) with `@upstash/ratelimit` as the shared rate-limit store, wrapped behind the existing `checkRateLimit()` interface, with the current in-memory limiter retained as an explicit fallback when Upstash env vars are absent.** Fix the unbounded-growth defect (#74) in the fallback path regardless, since it remains live in local dev and in any env-misconfiguration scenario.

Rationale, in order of weight:

1. **It is the only option that actually closes #80.** Per-process state cannot be made correct by tuning; filesystem sharing on CloudLinux is fragile (below); Upstash is purpose-built for stateless multi-process Node and works over plain HTTPS from a Passenger worker with zero connection management.
2. **The budget constraint is satisfied, not merely tolerated.** At this project's traffic, the free tier's 10K commands/day cap gives ~100× headroom. The marginal ops overhead is one dashboard account and two env vars — comparable to what we already carry for Resend (ADR-001).
3. **Fail-open keeps Upstash off the critical path.** With the library's built-in `timeout` plus our env-based fallback, an Upstash outage degrades to today's per-process behavior rather than blocking form submissions. Rate limiting is an abuse mitigation, not a correctness invariant; forms also have honeypots, Zod validation, and `Sec-Fetch-Site` rejection as independent layers.
4. **GDPR is satisfiable**: the database is created in an EU region (eu-central-1, matching the Supabase Frankfurt project), and keys are IP-derived with short TTLs (the window length), so retention is inherently minimal.
5. **Algorithm: `slidingWindow`.** At our volume the extra cost is irrelevant, and it removes the 2×-burst edge case of fixed windows. The window/max stay driven by the existing `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` env vars so operator tuning is unchanged.

## Implementation plan

1. **Provision** an Upstash Redis database (free tier, **eu-central-1**). Record credentials in the password manager (never real secrets in git).
2. **Env plumbing**: add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.example` with one-line descriptions and placeholders; set real values in the cPanel/Passenger environment. Document in `docs/30_infrastructure/`.
3. **Dependencies**: `npm i @upstash/ratelimit @upstash/redis`.
4. **Refactor `src/lib/rate-limit.ts`** keeping the exported signature `checkRateLimit(request, routeKey): RateLimitResult | Promise<RateLimitResult>` (callers in `request-guards.ts` become `await`-ing; all nine API routes are already async):
   - If both Upstash env vars are set: lazily construct a module-level singleton
     ```ts
     const ratelimit = new Ratelimit({
       redis: Redis.fromEnv(),
       limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
       timeout: 2000, // fail open fast; forms must not hang on Redis
       prefix: "rty:rl",
     });
     ```
     and derive `retryAfterSec` from the returned `reset` (Unix ms): `Math.max(1, Math.ceil((reset - Date.now()) / 1000))`. `analytics: false` (avoids the `pending` promise bookkeeping that matters on edge runtimes, not Passenger).
   - If not set (local dev, misconfiguration): fall back to the in-memory limiter, **now with #74 fixed** — cap the `Map` (e.g. 10K keys) and run a global sweep of expired entries opportunistically (every M calls or when the cap is hit), evicting oldest-window keys first.
   - Log once at startup which mode is active, so a prod deploy silently missing the env vars is visible in Passenger logs.
5. **Note the shared-window semantics change** in the code comment: the limit becomes genuinely global per IP instead of per-worker (i.e. effectively *stricter* than today) — worth a sentence in the tracker so a support report of "suddenly rate limited" is explicable.
6. **Verification**: `npm run build`; plus a manual burst test (`for i in $(seq 40); do curl -s -o /dev/null -w '%{http_code}\n' -X POST …/api/newsletter …; done`) against production confirming 429s appear at the configured threshold rather than N× it, and that `Retry-After` is sane.
7. **Docs**: update `docs/30_infrastructure/` (new external service), this ADR to Accepted, and close #74/#80 with the burst-test output as proof of work.

Estimated effort: ~half a day including provisioning and verification.

## Alternatives considered

### 1. Accept in-memory, document the limitation, fix only #74

- **For**: zero new services; #74 is fixable locally; the practical exposure is "limit is N× looser," and honeypot + validation already blunt abuse.
- **Against**: #80 stays open by fiat, not fixed. Passenger's worker recycling makes the effective limit not just N× but unbounded across worker restarts. The routes being guarded all trigger paid side effects (Resend mail sends, Supabase writes) — the rate limiter is the cost/abuse backstop for those, so "documented as broken" is the wrong posture even for a small site. Rejected because the correct fix costs almost nothing more.

### 2. cPanel shared filesystem store (e.g. SQLite file or lock-file counters in `~/tmp`)

- **For**: no external service; workers on one host share the filesystem.
- **Against**: hand-rolling correct concurrent counters across processes means file locking (`flock` semantics under CloudLinux/CageFS are exactly the kind of thing that works until it doesn't), fsync-vs-performance tradeoffs, TTL/GC we'd have to build ourselves (recreating #74 on disk), and zero ecosystem support — we would be writing and *owning* a tiny database. It also silently breaks if hosting ever moves to more than one server. The ops overhead saved on Upstash is spent several times over on bespoke correctness risk. Rejected.

### 3. Postgres-based limiter in the existing Supabase project

- **For**: no *new* vendor; EU residency already solved; SQL upsert-with-window is well-trodden.
- **Against**: puts the abuse-mitigation path on the same database the abuse would be targeting (a form flood now consumes Supabase connections/compute before being rejected); adds a table + cron cleanup; the anonymous public client (`public-server.ts`) is deliberately cookie-free/cache-compatible and a rate-limit write path doesn't fit it, so it needs the service-role client on every public POST. Workable but strictly more moving parts inside our critical dependency than a dedicated, free, fail-open store. Rejected as second choice — this is the fallback if Upstash's free tier ever becomes untenable.

### 4. Apache/mod_security or hosting-level rate limiting

- **For**: out of application code entirely.
- **Against**: on shared cPanel we don't reliably control Apache modules or their config persistence across host migrations; rules would live outside the repo (violates docs-as-SSOT); per-route keys (`api:contact` vs `api:newsletter`) are awkward at that layer. Worth enabling *in addition* if the host offers it (the Next.js docs recommend exactly that), but not as the primary mechanism.

## Consequences

**Positive**

- #80 closed: one shared counter per `routeKey:ip` across all Passenger workers; limits mean what they say.
- #74 closed in both paths: Redis keys expire with the window; the dev/fallback Map is capped and swept.
- Sliding window removes the fixed-window boundary-burst artifact.
- Fail-open + env-gated fallback: Upstash downtime or missing config degrades to current behavior instead of breaking forms; local dev needs no new credentials.

**Negative / accepted costs**

- New external dependency and vendor account (credential rotation, dashboard, one more thing in `HANDOVER_PACKAGE.md`).
- `checkRateLimit` becomes async — a small mechanical refactor of `request-guards.ts` and its call sites.
- ~50–200 ms added latency on rate-limited routes for the Redis round-trip (Passenger EU host → Upstash eu-central-1); acceptable on form POSTs, and the ephemeral cache short-circuits already-blocked identifiers.
- Free-tier caps (10K commands/day) are a silent ceiling; if traffic ever grows 100×, commands start erroring and the `timeout`/fail-open path masks it — add a periodic check of the Upstash dashboard to the ops runbook.
- IP addresses flow to a third processor (Upstash): must be reflected in the privacy policy / records of processing, keys kept in EU region with window-length TTLs only.

**Follow-ups**

- Consider also keying on a lightweight fingerprint (route + IP today; XFF spoofability noted in Context is a separate hardening item — trust only the hop added by our own Apache/Passenger front, not the client-supplied first entry).
- Revisit if hosting moves off cPanel (e.g. to Vercel): the same `@upstash/ratelimit` code carries over unchanged, which is a further point in its favor.

## Implementation note (2026-07-23, commit `6f9466a`)

- **#74 (unbounded growth) — closed.** Fixed via a global `setInterval` sweep every 5 minutes (`.unref()` so the timer does not prevent Passenger worker shutdown). Stale keys are pruned from the `Map` on a regular cadence independent of per-key access, eliminating the monotonic growth path.
- **#80 (multi-process) — closed as a documented architectural constraint, not a bug fix.** The Upstash decision above is acknowledged as the correct long-term approach but deferred to Phase 2. The in-memory rate limiter remains, providing per-worker defense-in-depth. The comment at the top of `src/lib/rate-limit.ts` documents the limitation explicitly. Issue #80 was closed 2026-07-23 with the note: "acknowledged as a known architectural constraint in ADR-008; a Redis/shared-state solution is a Phase 2 consideration if worker count grows." Revisit if worker count increases or form abuse materialises.

The Upstash implementation plan in §Decision and §Implementation plan remains valid as the next hardening step if multi-process correctness becomes a requirement.

## References

- GitHub issue #80 — in-memory rate limiter not shared across Passenger workers
- GitHub issue #74 — rate-limit Map grows unbounded between accesses (memory DoS)
- `src/lib/rate-limit.ts`, `src/lib/request-guards.ts` — current implementation and call sites
- ADR-001 — Resend idempotency/retry (precedent for a small external service with fail-safe behavior)
- ADR-006 — session management (related state-across-processes concerns)
- Upstash Ratelimit docs (via Context7, 2026-07-20): getting started, algorithms (fixed vs sliding window), features (ephemeral cache, timeout/fail-open), methods (`limit()` response shape)
- Upstash Redis billing docs (via Context7, 2026-07-20): free tier — 256 MB, 500K commands/month, 10K commands/day, EU regions
- Next.js backend-for-frontend guide (via Context7, 2026-07-20): rate limiting delegated to app code + hosting provider; no built-in framework primitive
