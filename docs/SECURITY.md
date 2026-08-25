# Security

**Document**: SECURITY.md  
**Purpose**: Security policies and practices  
**Change Frequency**: When policies change

---

## Principles

- **Least privilege**: Access only what is needed
- **Minimal exposure**: Expose only what users need to see
- **Explicit consent**: Collect and use data with consent
- **No secret leakage**: Never commit secrets; use env vars

---

## Data Classification

| Classification | Examples | Handling |
|----------------|----------|----------|
| **Sensitive** | Email, phone, name, preferences | Encrypt at rest (Supabase default), restrict access |
| **Confidential** | Payment data (future) | PCI-compliant handling; out of scope for MVP |
| **Internal** | Match notes, operator decisions | Ops-only; not exposed to users |
| **Public** | Retreat listings, directory | Safe to display |

**Assumption**: All personal data (PII) is sensitive.

---

## Access Control

| Resource | Who | Rule |
|----------|-----|------|
| Supabase | Backend/Edge only | Service role for writes; anon key for public reads if needed |
| n8n webhooks | n8n + backend | Shared secret in header; validate on receive |
| Forms | Public | Rate limit; validate input; idempotency |
| Operator tools | Ops only | Auth required; not in MVP scope |

---

## Form & API Security

- **Input validation**: Server-side; reject malformed data
- **Idempotency**: Use idempotency keys to prevent duplicate submissions
- **Rate limiting**: Per IP; prevent abuse
- **CORS**: Restrict to known origins
- **No sensitive data in URLs**: Use POST body, not query params
- **Safe URL rendering (output side)**: Never emit a stored/user URL as an `href`/`src` without scheme-checking it at the **render boundary** — only allow `http(s)`. Ingest validation (Zod `protocol: /^https?$/` on facilitator links, SCOPE-029) is necessary but not sufficient: a value can reach render via paths that skip the form (operator publish copies URLs verbatim, migrations, direct DB). The facilitator directory uses `safeHttpUrl()` to drop `javascript:` / `data:` schemes (SCOPE-035). External links also carry `rel="noopener noreferrer nofollow"` + `target="_blank"`.
- **Private media via signed redirect**: Headshots/CVs live in a private bucket; public pages serve them through a server route that signs the object path for **published records only** (never a public bucket).

---

## Secrets Management

- **Never commit**: .env in .gitignore; use .env.example for template
- **Supabase**: Use project-specific keys; rotate if compromised
- **n8n**: Webhook secret; email API keys in n8n credentials
- **Deployment**: Use platform secrets (Vercel, Netlify, etc.)

---

## Email Security

- **No bulk PII in subject**: Avoid exposing personal data
- **Unsubscribe**: Include in all marketing-related emails (transactional may differ)
- **Provider**: Use reputable provider (Resend, SendGrid) with deliverability best practices

---

## Incident Response (Minimal for MVP)

1. **Suspected leak**: Rotate keys immediately; assess scope
2. **Data breach**: Document; notify affected users per jurisdiction
3. **Abuse**: Block IP; review rate limits

---

## PHASE 2 HOOKS (Not Implemented)

- Supabase Auth (login, sessions)
- RBAC (role-based access control)
- Audit logging
- Penetration testing
- SOC 2 / compliance framework
