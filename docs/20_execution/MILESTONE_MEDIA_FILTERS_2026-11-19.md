# Milestone media uploads and search filters, 19 November 2026

## Scope and authority

Only `milestone-4-website-update` and its requested preview alias. Main and lightpathcollective.com are unchanged. Owner approval: thumbs-up on the 20:07 UTC additive storage/table request, received 20:20 UTC. Owner ran the attached table SQL himself at about 20:28 UTC because the management token is read-only. No existing retreat/submission row was changed or deleted. No operator account, access link or email was created.

## Applied shared additions

- New `public.retreat_media_slots`, verified columns, constraints, listing FK, RLS enabled, no policies for anon/authenticated, and no grants to those roles. Service-role writes only.
- New private `retreat-media` bucket, JPEG/PNG/WebP, max 5 MB input. No direct public object access.
- Static preview shells use one of four constrained preview keys. Actual retreat references use the existing UUID, without editing the retreat row.
- Uploads create new pending revisions. They never overwrite or delete the current approved object. Approval selects the most recently approved revision per slot. Rejected revisions are retained privately; no automated deletion was added.

## Server path

Admin-only upload/review routes, existing signed session, strict same-origin/custom-header checks, upload-rate checks, listing/slot validation, MIME+magic-byte validation, decode validation, max 24 megapixels/10,000px side, UUID paths, server JPEG re-encoding and EXIF/GPS removal. Metadata and rights declaration required. The service key is server-only. Media reads expose only approved previews or media for an already-published/live listing. Admins can read private pending revisions. Same-origin image responses use private/no-store and nosniff.

The photo workbench is persistent only behind the existing admin login. The public workflow demonstration stays local-only, with its warning and disabled save. No operator access is implied by this work.

## Filters

Price range plus explicit EUR/USD selection. No currency conversion and no pretending per-couple/per-person prices are comparable on a per-guest basis. Price sorting requires a currency. Duration is inclusive calendar days: Madeira 8, Brazil 14, Tulum 5, Peru 8. Duration options use 2-3, 4-5, 6-7, 8-14, 15+ days. Focus and preferences come from the existing submitted descriptions, not image contents or guesswork. Counts are over four submitted previews, not verified venues; unknown values are excluded from a selected feature.

Source facts: Madeira submission plus https://gobarefoot.eu; Tulum submitted description at https://wild-hugs.com/retreats/tulum; Peru submitted description at https://nicolasapelt.com/lab-peru/; Brazil existing retreat row/inclusions. These URLs are source attribution, not a claim that all three external pages were reverified during this filter work.

- Duration counts: 0 / 1 / 0 / 3 / 0.
- Focus counts: wellness 2, spiritual 1, nature 2, yoga sessions 1.
- Preferences: team highlights 0, solo 1, some meals 4, beach nearby 0, women-only 0, private accommodation planned 1, couples 2, vegetarian 1, Spanish 1, internal transfers 1.
- Multiple durations/focuses use OR; multiple preferences use AND. Zero options are disabled, unless already selected via a URL so they can be removed.

## Tests and caveats

Actual local app, isolated local-only admin password, actual new Supabase bucket/table: pending upload hidden anonymously, approve, refresh persistence, automatic image binding, replacement preserving approved original, reject remaining hidden, spoofed JPEG/SVG and invalid targets blocked. The test used the same licensed Madeira destination image already displayed, with credit and illustrative label. Two new media rows: one approved hero and one rejected replacement. Original records hashed before/after and unchanged (11 retreats, 17 submissions).

13 read-filter combinations pass, including multi-select, feature intersection, unknown exclusion, currency isolation and invalid-param handling. Actual slider form submission passes. Desktop, 390px and 320px checked. TypeScript passes, lint has no errors. Existing warnings include native image tags and a pre-existing hook warning.

Full deployed authenticated admin testing was intentionally deferred because the existing sensitive admin password is not available and the owner did not want to supply it tonight. No credential was reset. Owner can use his current login. Deployed unauthenticated boundaries and public rendering are checked separately before closeout.

Stock licensing and exact source credits remain in public/images/preview-stock/CREDITS.md. Uploaded media credit and illustrative flags travel to gallery, lightbox and search card.
