# ADR-001: Resend idempotency keys and bounded retry

**Status**: Accepted  
**Date**: 2026-04-27  
**Context7**: `/websites/resend` — `Idempotency-Key` header (max 256 characters, 24h window); retry with backoff for 429 and 5xx; do not retry most 4xx.

## Context

Public form handlers send transactional mail through [`src/lib/mail/send-email.ts`](../../src/lib/mail/send-email.ts). Retries or double-submits could duplicate operator or user emails without an idempotency strategy.

## Decision

1. **Resend path** — Pass `idempotencyKey` as the second argument to `resend.emails.send(payload, { idempotencyKey })` (Resend Node SDK ≥6).
2. **Key format** — Prefer short stable keys: `contact-ops/{id}`, `contact-user/{id}`, `newsletter-user/{sha256(email)}`, `seeker-user/{uuid}`, `retreat-user/{uuid}`. Keys longer than 256 characters are normalized via SHA-256 prefix in `normalizeIdempotencyKey` in `send-email.ts`.
3. **Retry** — Up to **4** attempts with backoff **1s, 2s, 4s** after the first failure when the error is retriable: HTTP **429**, **5xx**, or Resend error names `internal_server_error` / `application_error`. **No** retry on `invalid_idempotency_key`, `invalid_idempotent_request`, `concurrent_idempotent_requests`, or other client errors.
4. **SMTP path** — No idempotency header support; same logical sends rely on app-level dedupe (e.g. newsletter unique constraint). Document only; no SMTP retry loop in code.

## Consequences

- Safe retries after transient Resend failures without duplicate sends (same key within TTL).
- Idempotency keys must remain stable per logical send (same inquiry id → same user confirmation key).
- Re-query Resend / Context7 when upgrading the `resend` major version.
