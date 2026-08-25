# ADR-006: Secure admin session management

**Status**: Proposed
**Date**: 2026-07-20
**Closes**: GitHub issue #71
**Relates to**: ADR-008 (rate limiting)
**Context7**: `/vercel/next.js` — App Router authentication guide (stateless sessions: sign session data with a secret, store in an `httpOnly` cookie via `cookies()`; names `jose` and Iron Session as the compatible libraries); `/panva/jose` — `SignJWT`/`jwtVerify` with a symmetric HS256 secret (raw `Uint8Array` key imported via WebCrypto HMAC).

## Context

Admin authentication today is a single shared password (`OPERATOR_SECRET` env var). The login route `src/app/api/admin/auth/route.ts` verifies the submitted password with `verifyAdminPassword()` (`crypto.timingSafeEqual`, `src/lib/admin/auth.ts`) — and then stores **the raw password itself** as the value of the `admin_session` cookie:

```ts
cookieStore.set(ADMIN_COOKIE, password, {
  httpOnly: true,
  sameSite: "lax",          // note: "lax" in the actual code, not "strict"
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 8,      // 8 hours
});
```

Every subsequent request re-runs `verifyAdminPassword(cookieValue)` (`getAdminSession()` in `src/lib/admin/auth.ts`), which is consumed by `requireAdminSession()` in `src/app/admin/dashboard/page.tsx` and by nine admin API routes under `src/app/api/admin/*` (`stats`, `retreats`, `matches` + `[id]`, `retreat-submissions` + `[id]`, `facilitator-responses` + `[id]`, `seeker-responses`).

**The risk (issue #71):** the cookie *is* the credential. Any single leak — browser sync/extension exfiltration, a logged `Cookie:` header on the cPanel/Passenger/proxy chain, a stray `Set-Cookie` in a HAR file shared for debugging, an XSS bug that ever weakens `httpOnly`, a backup of a support screenshot — hands the attacker `OPERATOR_SECRET` itself, permanently. There is no expiry on the credential (only on the cookie, which the attacker can re-present forever), no way to invalidate leaked copies short of rotating the secret and redistributing it to the operator, and the same secret also guards the `api/operator/*` routes, so the blast radius exceeds the admin panel.

Secondary defects fixed in passing:
- `verifyAdminPassword` leaks the secret's length via the early `password.length !== secret.length` return (minor, but free to fix by hashing both sides before `timingSafeEqual`).
- Logout (`DELETE`) deletes the cookie client-side only; with a raw-password cookie a captured value stays valid forever. With expiring tokens it becomes bounded.

Constraints: cPanel/CloudLinux Passenger deploy via custom server `app.js` (`runtime = "nodejs"` throughout, no edge runtime), Node >= 24, no Redis or other session store available, single operator (no user table needed), Supabase exists but admin reads should not grow a per-request DB round-trip.

## Decision

Replace the raw-password cookie with a **stateless, signed, expiring session token (JWT, HS256) issued at login and verified on every admin request**, using **`jose`** (new direct dependency, zero transitive deps, pure WebCrypto — works on Node 24/Passenger with no native modules). This is the approach the Next.js App Router authentication guide documents for stateless sessions, and it requires no session store, matching the cPanel constraint.

**Signing key.** A new env var **`ADMIN_SESSION_SECRET`** (>= 32 random bytes, e.g. `openssl rand -base64 32`), deliberately distinct from `OPERATOR_SECRET`: the login password and the token-signing key must be independently rotatable, and a signing-key rotation is the session kill switch (instantly invalidates all outstanding tokens without changing the password the operator types). Fail closed: if `ADMIN_SESSION_SECRET` is unset/empty, token creation and verification both return failure — no fallback to signing with `OPERATOR_SECRET`.

**Token format** (all standard claims, verified by `jwtVerify` with pinned `algorithms: ["HS256"]`, issuer, and audience):

| Claim | Value |
|-------|-------|
| `sub` | `"operator"` (single shared admin identity) |
| `iss` / `aud` | `"rty-admin"` / `"rty-admin"` |
| `iat` | issue time |
| `exp` | **8 hours** after issue (unchanged lifetime; absolute — no sliding refresh for a single-operator panel; re-login after expiry) |
| `jti` | `crypto.randomUUID()` — correlates log lines without logging the token |

**Cookie attributes** (`admin_session`, name unchanged so stale raw-password cookies are simply invalid tokens and fail verification):
`httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"` (unchanged — `"strict"` would bounce the operator to the login page on every cross-site navigation to the dashboard, e.g. from an email link; note that `lax` already withholds the cookie on cross-site non-GET requests, so the admin mutation APIs — all non-GET JSON — are not reachable with the cookie from another origin today; ADR-008's `publicJsonPostGuards`-style `Sec-Fetch-Site` checking on admin routes adds defense in depth rather than being the sole CSRF mitigation), `path: "/"`, `maxAge: 60 * 60 * 8` (aligned with `exp`; token expiry remains authoritative even if the cookie outlives it).

**Verification path** stays exactly where it is architecturally: `getAdminSession()` in `src/lib/admin/auth.ts` — called from server components/route handlers under the Node runtime, **not** in `src/proxy.ts`. Per the Next.js guide, proxy/middleware checks are optimistic only; the authoritative check belongs next to the data. No admin gating moves into the proxy.

**Rotation policy.**
- `ADMIN_SESSION_SECRET`: rotate on suspicion of leak, on operator offboarding, or annually; rotation invalidates all sessions (acceptable: one operator logs in again).
- `OPERATOR_SECRET`: unchanged role (login password + `api/operator/*` guard); rotating it no longer invalidates sessions — rotate both when a full credential reset is intended. Document this pairing in the runbook.

## Implementation plan

1. **Add dependency**: `npm install jose` (verify `package-lock.json` regenerates; no hand-edits).
2. **New file `src/lib/admin/session.ts`** (`import "server-only"` — same pattern as `src/lib/facilitators/photo.ts`, which already builds under Next 16 without `server-only` being a listed dependency):
   - `getSessionSecret(): Uint8Array | null` — `process.env.ADMIN_SESSION_SECRET`, `TextEncoder().encode(...)`, `null` if unset/shorter than 32 chars (an `openssl rand -base64 32` value is 44 chars, comfortably above this floor).
   - `createAdminSessionToken(): Promise<string | null>` — `new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject("operator").setIssuedAt().setIssuer("rty-admin").setAudience("rty-admin").setJti(crypto.randomUUID()).setExpirationTime("8h").sign(secret)`.
   - `verifyAdminSessionToken(token: string): Promise<boolean>` — `jwtVerify(token, secret, { algorithms: ["HS256"], issuer: "rty-admin", audience: "rty-admin" })` in try/catch, plus `payload.sub === "operator"`; any throw → `false`.
   - Export `SESSION_MAX_AGE_SECONDS = 60 * 60 * 8` as the single source for both `exp` and cookie `maxAge`.
3. **Edit `src/lib/admin/auth.ts`**:
   - `getAdminSession()` — replace `verifyAdminPassword(session)` with `await verifyAdminSessionToken(session)`.
   - Harden `verifyAdminPassword` — drop the length early-return; compare `sha256(password)` vs `sha256(secret)` digests with `timingSafeEqual` (constant-length, no length oracle). Signature and callers unchanged.
   - `ADMIN_COOKIE` and `requireAdminSession()` unchanged.
4. **Edit `src/app/api/admin/auth/route.ts`** (`POST`): after `verifyAdminPassword(password)` succeeds, `const token = await createAdminSessionToken()`; if `null` (missing `ADMIN_SESSION_SECRET`) return 500 `{ error: "Server misconfigured" }` — never fall back to setting the password. Set the cookie to `token` with the attributes above (`maxAge: SESSION_MAX_AGE_SECONDS`). `DELETE` unchanged.
5. **Env plumbing**: add `ADMIN_SESSION_SECRET` to `.env.example` with a one-line description and `openssl rand -base64 32` placeholder (never touch real `.env` — per `protect-files.sh` policy, the user sets the production value in cPanel and local `.env` themselves). Update `docs/30_infrastructure/` env-var inventory and the credential handover pointers.
6. **Issue bookkeeping**: comment on GitHub issue #71 linking this ADR; close via the implementing PR.
7. **Testing** (no unit runner in this repo — build + live validation):
   - `npm run build` and `npx tsc --noEmit` pass.
   - Manual against `npm run dev`: (a) `POST /api/admin/auth` with correct password → `Set-Cookie: admin_session=eyJ...` (three-part JWT, **not** the password — assert the password string does not appear in the cookie); (b) dashboard and one `api/admin/*` route load with the cookie; (c) tampered token (flip one char) → redirect/401; (d) a cookie containing the raw `OPERATOR_SECRET` (the legacy format) → rejected; (e) token minted with a different secret → rejected; (f) `DELETE` clears the cookie; (g) with `ADMIN_SESSION_SECRET` unset, login returns 500 and nothing is set.
   - Extend `scripts/` with a `validate:admin-session` script mirroring the `validate:scope-batch1` pattern for (a)–(d) so the check is repeatable.
   - Expiry: mint a token with `setExpirationTime("1s")` in a scratch script and confirm `verifyAdminSessionToken` rejects after 2 s (avoids waiting 8 h).

## Alternatives considered

1. **`iron-session` (encrypted, sealed stateless cookie).** Also endorsed by the Next.js guide and would work on Passenger. Rejected: its value-add is *encrypting* session payloads, but our payload contains nothing confidential (`sub: "operator"` + timestamps) — integrity is the requirement, not secrecy. `jose` gives standard, inspectable JWTs, is `iron-session`'s own crypto-adjacent dependency class with zero transitive deps, and avoids a framework-flavored wrapper around one cookie.
2. **DB-backed sessions in Supabase (opaque random token, `admin_sessions` table).** Gives per-session revocation and an audit trail. Rejected for now: adds a Supabase round-trip to every admin page/API request over the service-role client, a migration, and cleanup jobs — disproportionate for a single-operator panel where "rotate `ADMIN_SESSION_SECRET`" already revokes everything at once. Revisit if multiple admin identities ever exist (the `jti` claim keeps the door open).
3. **Hand-rolled HMAC token via `node:crypto` (no new dependency).** Node 24 makes this easy (`createHmac("sha256", ...)` over `payload.exp`). Rejected: reimplements exactly what JWT standardizes (encoding, constant-time verification, expiry/claim validation, algorithm pinning) with fresh room for mistakes; `jose` is audited, dependency-free, and the guide-documented choice.
4. **Hash the password into the cookie (e.g. store `sha256(OPERATOR_SECRET)`).** Minimal diff. Rejected: the cookie is still a non-expiring bearer credential derived 1:1 from the secret — a leak is replayable forever and only a password rotation revokes it. Fails the actual requirement of issue #71.

## Consequences

**Positive**
- A leaked cookie no longer discloses `OPERATOR_SECRET`; it is a signed token that self-expires in <= 8 h and cannot be forged or extended without `ADMIN_SESSION_SECRET`.
- Instant global revocation: rotate `ADMIN_SESSION_SECRET` (env change + Passenger restart) without changing the operator's password or touching `api/operator/*`.
- No session store, no per-request DB read — cache-compatibility and the cPanel constraint are preserved; verification is a local HMAC.
- Legacy raw-password cookies fail verification automatically on deploy — no migration step, users just re-login once.
- Removes the password-length oracle in `verifyAdminPassword`.

**Negative**
- New runtime dependency (`jose`) and a new required env var — one more thing to set in cPanel and document (mitigated by fail-closed 500 + `.env.example` entry).
- Stateless means no per-session revocation: before `exp`, an individually stolen token can only be killed by rotating the secret (kills all sessions). Accepted for a single operator; alternative 2 is the upgrade path.
- Absolute 8 h expiry with no sliding refresh: the operator re-logs-in mid-day if a session started early. Deliberate simplicity; a refresh flow can be added later inside `session.ts` without touching callers.
- `OPERATOR_SECRET` rotation no longer doubles as session invalidation — operational docs must state that a full reset means rotating both secrets.

## References

- GitHub issue #71 — "Admin cookie stores raw OPERATOR_SECRET" (closed by this ADR's implementation)
- Next.js App Router Authentication guide — stateless sessions, cookie options, "auth check belongs next to the data" (verified via Context7 `/vercel/next.js`, `docs/01-app/02-guides/authentication.mdx`, 2026-07-20)
- `jose` — `SignJWT` / `jwtVerify` HS256 symmetric-secret usage (verified via Context7 `/panva/jose`, 2026-07-20)
- ADR-008 — admin/operator rate limiting (companion control on the login endpoint)
- ADR-004 — precedent for `src/proxy.ts` scope (why session verification stays out of the proxy)
- `docs/30_infrastructure/` — env var inventory
- Affected files: `src/lib/admin/auth.ts`, `src/lib/admin/session.ts` (new), `src/app/api/admin/auth/route.ts`, `.env.example`; consumers unchanged: `src/app/admin/dashboard/page.tsx`, `src/app/api/admin/{stats,retreats,matches,retreat-submissions,facilitator-responses,seeker-responses}/*` (nine route files)
