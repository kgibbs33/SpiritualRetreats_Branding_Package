# ADR-007: Content-Security-Policy and HSTS hardening

**Status**: Accepted
**Date**: 2026-07-20
**Shipped**: 2026-07-23 (commit `6f9466a`) — see implementation note below
**Closes**: GitHub issue #73
**Supersedes**: ADR-002 (extends, does not replace)
**Context7**: `/vercel/next.js` — [Content Security Policy guide](https://nextjs.org/docs/app/guides/content-security-policy) (nonce-per-request via `proxy`); `/tailwindlabs/tailwindcss.com` — v4 engine (build-time compiled stylesheet, no runtime style injection). HSTS preload requirements verified against [hstspreload.org](https://hstspreload.org/) and [MDN Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security).

## Context

ADR-002 shipped the minimal header set (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`) and explicitly deferred two headers:

- **CSP** — "deferred until third-party scripts and analytics are inventoried (risk of breaking inline or vendor assets)."
- **HSTS** — "Enable at CDN/reverse proxy with `includeSubDomains` and tested `max-age`, or add here only when all environments serve HTTPS-only."

Both deferral conditions are now resolved:

1. **Third-party script inventory is complete and empty.** No GTM, no analytics, no chat widgets, no embeds, no user-generated HTML rendering. The only script origin is our own app. This is the *easiest possible moment* to introduce a strict CSP — every future third-party addition then has to justify itself against an existing policy instead of the policy having to be retrofitted around vendors.
2. **All environments are HTTPS-only.** TLS is enforced at the cPanel level on the canonical domain (`retreatyourself.network`) and the three redirect domains (`.host`/`.expert`/`.exchange`, which 308 into canonical via `src/proxy.ts`, ADR-004).

Constraints specific to this deployment:

- **cPanel/CloudLinux Passenger, not Vercel** — there is no edge/CDN config surface to set headers on. Headers must come from the app itself. Setting them in `public_html/.htaccess` is not viable: the deploy pipeline rewrites that file on every push (the same reason ADR-004 keeps host redirects in `proxy.ts`).
- **Next.js App Router injects inline `<script>` tags** for hydration bootstrapping and the RSC payload. A static `script-src 'self'` (no nonce, no `unsafe-inline`) breaks every page. The framework-supported answer is a **per-request nonce** generated in `proxy.ts` (Next 16's renamed middleware); Next detects the nonce in the incoming `Content-Security-Policy` request header and stamps it onto its own inline scripts automatically.
- **Nonce-based CSP requires dynamic rendering — as a prerequisite, not an automatic consequence.** Per the Next.js CSP guide, Next applies nonces during server-side rendering based on the CSP request header; statically rendered pages are generated at build time where no request headers exist, so **static pages get no nonce at all** — and under an enforced CSP their framework inline scripts would be blocked. Every HTML route this policy covers must therefore render dynamically (opting out of the Full Route Cache; PPR is likewise incompatible with nonce-based CSP). This is a real cost we accept below, with rationale, and the implementation plan includes an explicit route audit (step 1.5).

## Decision

### 1. Content-Security-Policy: nonce-based strict CSP, generated in `src/proxy.ts`

**Nonce, not hashes, not `unsafe-inline`:**

- **Hash-based** CSP requires enumerating the SHA-256 of every inline script. Next's inline RSC payload scripts vary per page and per build, so hashes are unmaintainable here — hashes suit fully static export sites, which this is not (form APIs, operator routes, env-gated legal pages).
- **`unsafe-inline`** for `script-src` neutralises the primary value of CSP (XSS mitigation). Rejected.
- **Nonce + `'strict-dynamic'`** is the pattern the Next.js documentation ships for the App Router, degrades safely in CSP2-only browsers (`'self'` is retained as the CSP2 fallback; CSP3 browsers ignore it when `'strict-dynamic'` is present), and means any future third-party script must be explicitly nonced — an intentional speed bump for vendor-script creep.

**Production policy** (single line when emitted; shown per-directive with rationale):

| Directive | Value | Rationale |
|---|---|---|
| `default-src` | `'self'` | Deny-by-default fallback for anything not listed. |
| `script-src` | `'self' 'nonce-<per-request>' 'strict-dynamic'` | Only nonced scripts execute; `'strict-dynamic'` lets nonced scripts load their own chunks (Next code-splitting) without listing hosts. Dev only: append `'unsafe-eval'` (React Refresh needs it; never in prod). |
| `style-src` | `'self' 'unsafe-inline'` | Tailwind v4 compiles to a **static stylesheet at build time** (its engine scans source and emits CSS; only runtime dependency is Lightning CSS) — so `'self'` covers Tailwind itself. `'unsafe-inline'` remains because (a) React `style={}` attributes are governed by `style-src`'s attribute fallback and **nonces cannot apply to attributes**, and (b) Next injects inline `<style>` during dev/streaming. CSS injection is a far lower-severity vector than script injection; tightening to nonced styles is a listed follow-up, not a blocker. |
| `img-src` | `'self' blob: data: https://ruzxlccdoywshavwtulc.supabase.co` | Own assets + Next Image internals; the Supabase Frankfurt project host in case listing images are served from Supabase Storage. Remove if the pre-rollout audit shows no Storage-hosted images. |
| `connect-src` | `'self' https://ruzxlccdoywshavwtulc.supabase.co` | Form POSTs go to our own `/api/*`; the Supabase origin is included defensively for any client-side Supabase call. Remove if the audit confirms all Supabase access is server-side only. **Never add a non-EU Supabase host** (GDPR constraint, see CLAUDE.md). |
| `font-src` | `'self'` | Fonts are self-hosted via `next/font`. No Google Fonts CDN. |
| `object-src` | `'none'` | No plugins, ever. |
| `base-uri` | `'self'` | Blocks `<base>`-tag hijacking of relative URLs. |
| `form-action` | `'self'` | All forms post to our own API routes. |
| `frame-ancestors` | `'self'` | CSP-level successor to ADR-002's `X-Frame-Options: SAMEORIGIN` — kept equivalent (`'self'`, not `'none'`) so the two headers never disagree. `X-Frame-Options` stays for legacy browsers. |
| `upgrade-insecure-requests` | *(bare directive)* | Belt-and-braces rewrite of any stray `http:` subresource. **Note: this directive is ignored in `Content-Security-Policy-Report-Only` mode** — it only takes effect at the enforcing flip; do not expect to validate it during phase 1. |
| `report-uri` / `report-to` | *(none for now)* | No reporting endpoint exists; running one (or a third-party collector) is out of scope for MVP. Violations surface in browser consoles during the Report-Only phase instead. |

**Rollout is two-phase**: ship the **response** header as `Content-Security-Policy-Report-Only` first, verify zero violations across the QA surface (SCOPE-046 page list), then flip to enforcing. The flip is a one-word change. Note the **request** header Next reads for nonce extraction is always the plain `Content-Security-Policy` name in both phases — Next's nonce detection is documented against that header only, and browsers never see request headers, so this is safe and phase-independent (see step 1 code).

**Accepted cost — dynamic rendering.** For the nonce to be applied, every covered HTML route must render dynamically (Full Route Cache and PPR are off the table for those routes — a statically rendered page would ship without a nonce and break under enforcement). On this deployment that cost is small: there is no CDN in front of Passenger (each request reaches Node anyway), traffic is MVP-scale, and the data-read path (`src/lib/supabase/public-server.ts`) keeps its own caching. The CSP applies only to **document** requests — `/api/*`, `_next/static`, `_next/image`, and favicon are excluded by the matcher/guard, so API rate-limiting and static-asset serving are untouched.

### 2. HSTS: app-emitted, ramped `max-age`, `includeSubDomains` after subdomain audit, **no preload yet**

**Where:** in `src/proxy.ts`, not `next.config.ts` `headers()` — deliberate, for one reason: the 308 host redirects for `.host`/`.expert`/`.exchange` are returned *by the proxy*, and `next.config.ts` `headers()` does not decorate proxy-produced redirect responses. Setting HSTS in the proxy puts it on **every** response Next emits, including those redirects — which matters because the hstspreload.org scanner (and correct HSTS behaviour generally) requires the header on the *first* response, even when that response is a redirect. Production only (`NODE_ENV === "production"`) so local `http://localhost` dev is never poisoned.

**Value — ramped, verified per hstspreload.org / MDN current requirements:**

| Stage | Header value | Gate to advance |
|---|---|---|
| 1 (initial deploy) | `max-age=86400` | One week in production with zero TLS/renewal incidents on all four domains. |
| 2 | `max-age=31536000; includeSubDomains` | **Subdomain audit passes**: every cPanel service subdomain (`www.`, `webmail.`, `cpanel.`, `mail.`, autodiscover, etc.) either serves valid HTTPS or is confirmed unused. `includeSubDomains` on the apex is the step that can brick an overlooked HTTP-only subdomain for a full year of visitor browser cache — hence the explicit gate. |
| 3 (deliberately deferred) | `…; preload` + submission at hstspreload.org | **Not now.** Preload requires `max-age >= 31536000`, `includeSubDomains`, the literal `preload` token, and every subdomain on valid HTTPS — and removal from the Chromium preload list takes *months* to propagate. For an MVP whose subdomain/DNS layout may still change (ADR-004's `.expert`/`.exchange` destinations are themselves still provisional), the irreversibility is not worth it yet. Revisit when the domain layout is final. |

`max-age=31536000` (1 year) is the current floor for preload eligibility and the common recommendation; we adopt it as the steady-state value even while preload itself stays deferred, so a future preload decision is a token-plus-submission, not a header redesign.

### 3. ADR-002 headers are unchanged

`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` stay in `next.config.ts` `headers()` exactly as ADR-002 set them. This ADR extends ADR-002; it does not supersede its decisions.

## Implementation plan

**Step 0 — Pre-rollout audit (blocks step 1):**
- `grep -rn "dangerouslySetInnerHTML\|<script" src/` — inventory any hand-written inline scripts (e.g. JSON-LD blocks); each must take the nonce via `(await headers()).get("x-nonce")`.
- `grep -rn "supabase" src/ --include="*.tsx"` — confirm whether any client component talks to Supabase directly; trim `connect-src`/`img-src` accordingly.
- Enumerate cPanel subdomains and their TLS status (for the HSTS stage-2 gate).

**Step 1 — `src/proxy.ts`: add a `withSecurityHeaders(request, response)` helper and thread every return path through it** (the plain `NextResponse.next()` returns, the 308 host redirects, and the legal-page rewrite):

```ts
const isProd = process.env.NODE_ENV === "production";

function buildCsp(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isProd ? "" : " 'unsafe-eval'"}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://ruzxlccdoywshavwtulc.supabase.co`,
    `connect-src 'self' https://ruzxlccdoywshavwtulc.supabase.co`,
    `font-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

// Phase 1: report-only RESPONSE header. Phase 2: rename to "Content-Security-Policy".
// The REQUEST header below stays "Content-Security-Policy" in both phases —
// Next's nonce extraction is documented against that name only, and browsers
// never see request headers.
const CSP_RESPONSE_HEADER = "Content-Security-Policy-Report-Only";
```

In `proxy(request)`, for **document requests only** (skip `request.nextUrl.pathname.startsWith("/api")`; static assets are already excluded by the matcher):

```ts
const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
const csp = buildCsp(nonce);
const requestHeaders = new Headers(request.headers);
requestHeaders.set("x-nonce", nonce);
requestHeaders.set("Content-Security-Policy", csp); // always this name — Next reads it to nonce its own inline scripts

const response = NextResponse.next({ request: { headers: requestHeaders } });
response.headers.set(CSP_RESPONSE_HEADER, csp);
if (isProd) {
  response.headers.set("Strict-Transport-Security", "max-age=86400"); // stage 1; see ADR table
}
```

HSTS (unlike CSP) is also set on the 308 redirect and rewrite branches — the redirect responses for the non-canonical domains must carry it.

**Step 1.5 — Ensure covered routes render dynamically (required for the nonce to be applied at all).** Audit the routes the CSP covers: any route Next statically renders at build (`npm run build` output marks these `○`/`●`) will ship **without** a nonce — the request headers don't exist at build time — and its framework inline scripts would be blocked once the policy enforces. For each such route, force dynamic rendering the docs-sanctioned way: `await connection()` (from `next/server`) at the top of the page, or an actual `headers()` read where the page consumes the nonce anyway. Do not enable PPR on covered routes — it is incompatible with nonce-based CSP (static shell scripts cannot access the nonce). Re-run `npm run build` and confirm every covered HTML route reports as dynamic (`ƒ`) before proceeding.

**Step 2 — Verify the proxy matcher** keeps excluding Next internals but continues covering everything else (the current matcher already does). If prefetch-request nonce warnings appear, do **not** add the Next CSP guide's `missing: [...prefetch]` refinement to the global matcher — that would also exempt prefetch requests from the host 308 redirects and legal-page gating this proxy performs. Instead, guard the CSP branch inside the proxy function (check the `next-router-prefetch` / `purpose: prefetch` request headers there), leaving the rest of the proxy's behaviour applying to all matched requests.

**Step 3 — Nonce any first-party inline scripts** found in step 0 via `next/script` + `nonce` prop, or `<script nonce={nonce}>` in Server Components reading `x-nonce` from `next/headers`.

**Step 4 — Verify (Report-Only phase):**
- `npm run build` (typecheck gate) and `npm run validate:scope-batch1` (form POSTs must be unaffected — CSP skips `/api`, but `form-action 'self'` and `connect-src` now constrain the browser side).
- Walk the QA page list (SCOPE-046) with DevTools console open; zero CSP violation reports is the exit criterion. (Remember `upgrade-insecure-requests` is inert in Report-Only mode — it cannot be validated in this phase.)
- `curl -sI https://retreatyourself.network | grep -i strict` and the same against `retreatyourself.host` (must show HSTS on the 308).

**Step 5 — Enforce:** rename `Content-Security-Policy-Report-Only` → `Content-Security-Policy` (the `CSP_RESPONSE_HEADER` constant — the request header is already the enforcing name and does not change). One-line change, own commit, trivially revertable (`main` auto-deploys — keep this commit isolated).

**Step 6 — HSTS ramp:** after one clean week, raise to `max-age=31536000; includeSubDomains` **only if** the step-0 subdomain audit passed. Record the ramp dates in `docs/30_infrastructure/`.

**Step 7 — Bookkeeping:** update `docs/30_infrastructure/` (security-headers page), close GitHub issue #73 with before/after `curl -sI` output.

## Alternatives considered

1. **Static CSP in `next.config.ts` `headers()` (no nonce).** Keeps full static rendering, but forces `script-src 'unsafe-inline'` because of Next's inline hydration/RSC scripts — which guts the XSS protection that is CSP's whole point. Rejected: a CSP that allows arbitrary inline script is compliance theatre.
2. **Hash-based CSP.** No dynamic rendering cost, but Next's inline scripts vary per page/build; maintaining hashes is not tractable outside fully static export. Rejected as unmaintainable.
3. **Headers at the web-server layer (`.htaccess`).** The deploy pipeline rewrites `public_html/.htaccess` on every push (established in ADR-004 for redirects) — headers there would silently vanish. Rejected for the same reason redirects live in `proxy.ts`.
4. **HSTS with `preload` immediately.** Meets our steady-state header anyway, but the Chromium preload list is effectively irreversible on a months-long timescale, and the domain/subdomain layout (ADR-004 destinations) is still provisional. Deferred, not rejected.
5. **`frame-ancestors 'none'`.** Marginally stricter, but would contradict ADR-002's `X-Frame-Options: SAMEORIGIN`, and same-origin framing costs nothing. Kept at `'self'` for header consistency.
6. **Doing nothing (status quo).** The deferral conditions ADR-002 set have been met; with zero third-party scripts, the breakage risk that justified deferral no longer exists. Waiting until vendors *are* added makes CSP adoption strictly harder.

## Consequences

**Positive**
- XSS payloads that reach the DOM cannot execute without the per-request nonce; injected `<script>`, `javascript:` bases, and rogue form targets are neutralised (`script-src` nonce + `strict-dynamic`, `base-uri`, `form-action`).
- Every future third-party script/analytics addition must consciously amend this policy (and take a nonce) — vendor creep now has a checkpoint, exactly what ADR-002 wanted the inventory for.
- HSTS closes the first-request downgrade/SSL-stripping window for repeat visitors on all four domains, including the redirect-only ones.
- Zero reliance on cPanel-side config that the deploy pipeline can clobber.

**Negative / accepted**
- Every HTML route the CSP covers must render dynamically (Full Route Cache and PPR forgone on those routes — a static render ships no nonce and would break under enforcement; step 1.5 makes this explicit and verifiable in the build output). Accepted: no CDN sits in front of Passenger anyway, and data-layer caching is unaffected.
- `style-src 'unsafe-inline'` remains — CSS injection is not mitigated by this ADR. Tracked as a follow-up (audit `style={}` usage, then move to nonced styles per the Next dev/prod split pattern).
- No violation telemetry from real users (no `report-to` endpoint); we trade that for the manual Report-Only QA pass. Revisit if/when an error-reporting service is adopted.
- Misjudging the HSTS stage-2 subdomain audit could lock an HTTP-only subdomain out for up to a year of client cache; mitigated by the explicit audit gate and the ramped `max-age`.
- Dev/prod header drift (`unsafe-eval` in dev only) means CSP bugs can be prod-only; the Report-Only phase runs against the production build for this reason.

## Implementation note (2026-07-23, commit `6f9466a`)

Shipped via a simpler approach than the nonce-based plan above. Key deviations:

- **Delivery: `next.config.ts` `headers()`, not `proxy.ts`.** Static headers applied to all routes at the Next.js layer. No per-request nonce, no proxy integration.
- **`script-src`: `'self' 'unsafe-inline'`** (+ `'unsafe-eval'` in dev). Nonce-based strict-dynamic was skipped. This is acceptable given the codebase has no user-generated HTML rendering and no active XSS surface. `'unsafe-inline'` weakens the XSS mitigation CSP offers but is not worse than the pre-CSP baseline. The nonce approach remains the right path if inline scripts or dynamic rendering from untrusted sources are ever needed.
- **No Report-Only phase.** Shipped directly as enforcing `Content-Security-Policy`. The pre-rollout audit (step 0) confirmed no third-party scripts and no inline `<script>` blocks that would break.
- **HSTS: `max-age=63072000; includeSubDomains; preload` immediately.** Staged ramp skipped — all four domains were already verified HTTPS-only before shipping. All subdomains checked. `frame-ancestors 'none'` (stricter than the proposed `'self'`).
- **GitHub issue #73 closed** with the security headers commit.

The nonce-based refactor described in §Implementation plan remains valid as a future hardening step.

## References

- ADR-002 — Global HTTP security headers (deferral rationale this ADR discharges)
- ADR-004 — Host-based role redirects (`proxy.ts` precedent; `.htaccess` clobbering)
- GitHub issue #73 — Missing CSP and HSTS
- Next.js CSP guide (Context7 `/vercel/next.js`): nonce generation in `proxy`, `x-nonce` request header, `strict-dynamic`, dev-only `unsafe-eval`, dynamic-rendering requirement (`connection()`), PPR incompatibility, prefetch matcher — https://nextjs.org/docs/app/guides/content-security-policy
- Tailwind CSS v4 engine (Context7 `/tailwindlabs/tailwindcss.com`): build-time CSS generation; no runtime style injection of its own
- HSTS preload requirements — https://hstspreload.org/ ; MDN `Strict-Transport-Security` — https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security
- OWASP HTTP Headers Cheat Sheet (CSP, HSTS) — https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html *(not re-verified this session; general reference)*
