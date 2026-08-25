# RE:TREAT YOURSELF — Documentation

**Single source of truth** for the platform. Code follows docs.

---

## Hierarchy of Truth

```
10_architecture (HOW)  →  System design, data model, automations, structure
       ↓
20_execution (WHAT + WHEN)  →  Build plan, progress, components
       ↓
30_infrastructure (WHERE / RUNS)  →  Domains, DNS, TLS, redirects, DB residency, CI/CD
       ↓
code (implementation)
```

If code conflicts with docs → fix docs or flag discrepancy.

---

## Directory Guide

| Directory | Purpose |
|-----------|---------|
| **10_architecture** | HOW the system works. Changes when architecture changes. |
| **20_execution** | WHAT we build, WHEN, and progress. Changes constantly. |
| **30_infrastructure** | WHERE/HOW it runs in production: domains, DNS, TLS, redirects, DB residency, CI/CD. Operations vault. |
| **/** (root) | SECURITY.md, this README |

---

## Key Documents

| Document | Use When |
|----------|----------|
| DATA_MODEL.md | Schema, actor system, entity design |
| CONTACT_MAIL.md | Contact form email: Resend API vs SMTP (Nodemailer), env vars |
| STRUCTURE_MAP.md | Domain anatomy, inputs/outputs, dependencies |
| UX_ARCHITECTURE.md | Navigation, page hierarchy, flows, layout |
| FEATURE_SYSTEM.md | Feature set by domain, priority, rationale |
| COMPONENT_MAP.md | UI components, behavior, usage |
| FEATURE_IMPLEMENTATION_STATUS.md | Code ↔ feature matrix: what's actually built, by route/table/API |
| (repo root) CHANGELOG.md | Keep a Changelog–style ship log |
| (repo root) DEPLOYMENT.md | Deploy setup guide (Supabase, domain, n8n, cPanel) |
| (repo root) DEPLOY_FLOW.md | Step-by-step walkthrough of the `deploy.yml` CI workflow |
| COMPONENTS_INDEX.md | Where components live |
| 20_execution/operations/MATCHING_OPERATIONS.md | Current manual-matching operator workflow |
| 20_execution/operations/RETREAT_DIRECTORY_OPS.md | Current retreat listing lifecycle (intake → review → publish) |
| 30_infrastructure/README.md | Infrastructure vault index (production-at-a-glance) |
| 30_infrastructure/DOMAINS.md | The four domains, roles, canonical, redirect map |
| 30_infrastructure/LANDING_PAGES_MASTER.md | Master list of all live landing-page URLs + domain routing (client-facing) |
| 30_infrastructure/DNS.md | Nameservers, apex/www/wildcard records, change procedure |
| 30_infrastructure/TLS_SSL.md | AutoSSL cert SAN coverage, the www gap, wildcard caveat |
| 30_infrastructure/REDIRECTS.md | Host-based role redirects (proxy.ts), options compared |
| 30_infrastructure/SUPABASE_EU.md | EU project, GDPR residency, API keys |
| 30_infrastructure/CICD_ENV.md | GitHub Actions variables/secrets, build vs runtime |

---

## Initiate Conversation (AI / Cursor)

Paste this to start a new chat and have the assistant work from these docs:

```
@docs Read the docs hierarchy. Treat them as single source of truth. I need help with this project — start by understanding the structure (10_architecture → 20_execution → 30_infrastructure), then help me with what I ask.
```
