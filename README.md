# Light Path Retreats — public website

The guest-facing website for **Light Path Retreats**, the global connection hub for
spiritual retreats. Built with Next.js 16, React 19, Tailwind 4, and Supabase.
Deployed on Vercel (project `spiritual-retreats-branding-package`, team xforria).

## Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **UI:** React 19, Tailwind CSS 4
- **Database:** Supabase (Postgres)
- **Fonts:** EB Garamond (headings), Lato (body/nav/buttons/forms) — via `next/font/google`
- **Email:** Resend (primary) or SMTP (fallback)
- **Validation:** Zod
- **Deployment:** Vercel

## How to run

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # production build
npm run lint       # ESLint
```

## Environment variables

All secrets are read from environment variables. Never commit real values.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Canonical public URL (e.g. `https://lightpathretreats.com`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email shown in footer |
| `NEXT_PUBLIC_LEGAL_ENTITY_NAME` | Legal entity name (defaults to Light Path Retreats) |
| `NEXT_PUBLIC_LEGAL_JURISDICTION` | Jurisdiction (leave empty until entity is registered) |
| `NEXT_PUBLIC_LEGAL_PAGES_VISIBLE` | `true` to serve privacy/terms/cookies pages |
| `NEXT_PUBLIC_OWNER_AD_PACKAGES_VISIBLE` | Only when pricing is approved (currently pinned off) |
| `MAIL_FROM` | Verified sender address for transactional emails |
| `RESEND_API_KEY` | Resend API key |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_PORT`, `SMTP_SECURE` | SMTP fallback |
| `CONTACT_NOTIFY_TO` | Team notification email override |
| `N8N_FORM_SUBMISSION_URL` | Optional n8n webhook for form submissions |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY` | Supabase project keys |

## Vercel deployment

The project is deployed on Vercel under team `xforria`, project name
`spiritual-retreats-branding-package`. Every push to a branch generates a
preview deployment. Merges to `main` deploy to production.

## Logo

The final "Light Path Retreats" lockup artwork is not yet delivered.
The single `BrandLogo` component in `src/components/layout/BrandLogo.tsx`
renders the emblem (`public/brand/lpr-emblem.png`) only. When the lockup
files arrive, drop them into `public/brand/` and update that one component.

## Legacy docs

All files under `docs/` describe a previous brand and cPanel/Coolify deployment
that is no longer used. See `docs/LEGACY_NOTE.md` for details.