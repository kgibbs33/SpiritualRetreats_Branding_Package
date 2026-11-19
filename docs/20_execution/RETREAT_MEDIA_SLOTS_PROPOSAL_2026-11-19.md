# Retreat photo slots: proposed persistent implementation, NOT APPLIED

This branch contains only a client-side workflow preview and locally hosted licensed illustrative stock. Selecting a file does not upload, save, or replace the actual listing image. Refresh clears local drafts. The UI says so and Save is disabled.

## Shared Supabase changes requiring owner approval

1. Create `retreat-media` private Storage bucket in the existing Frankfurt project. No anonymous/authenticated direct Storage policies. Accept JPEG/PNG/WebP, max 5 MB upload. No SVG, PDF or GIF.
2. Create `public.retreat_media_slots` with listing FK (`retreat_id`), constrained `slot_key` enum hero/gallery-1/gallery-2/gallery-3/gallery-4, server-generated `storage_path`, `alt_text`, `credit`, `source_url`, `license_note`, `rights_confirmed`, `illustrative`, review state pending/approved/rejected, created/updated timestamps. Unique listing+slot. Enable RLS with no public write policies. Do not modify existing listing statuses.
3. Admin-only same-origin upload/replace API: existing signed admin session, origin/CSRF checks, rate limits, hard listing ID validation, MIME AND file signature validation, maximum bytes and pixel dimensions, server-side image decode/re-encode (strip EXIF/GPS), random UUID paths, no raw client filenames. Never expose the service key. Save object and slot mapping with safe replacement/cleanup behavior so a failed write cannot destroy the current photo.
4. Same-origin media delivery API: read approved media only when parent listing is public/eligible; private preview media only to authenticated admins or a separately approved preview audience. Cache invalidation for affected listing + search cards on approval. Hero maps automatically to image/card; gallery slots map by fixed order. Existing image_path/gallery_paths remain fallback.
5. Rights/source/alt text and illustrative flag required before approval. Stock/concept labels travel to card, gallery and lightbox. Admin review is the publishing gate. File upload must never silently set retreat qualification_status=live or status=published.

## Operator self-service is a separate permission model

The existing application uses one shared admin password, not per-operator accounts. Do not give that password to retreat operators. A secure operator upload link needs a listing-scoped, time-limited upload grant, verified intended recipient and revocation/rate limits. Alternatively add authenticated operator accounts and explicit retreat ownership. Neither identity/ownership schema nor external invitation was added here. All operator uploads should enter pending review; no direct overwrite of approved public media.

## Current interfaces

- `/media-workflow-preview`: milestone-only, noindex, four owner-approved shells, no private admin data, local files only.
- `/admin/retreat-media`: existing admin session required, same named-slot prototype.
- Existing retreat edit page includes the named-slot interface preview for its listing. Existing manual path fields are unchanged until persistence is approved.

## Test coverage

Five named slots, hero+search-card binding, gallery ordering, per-shell isolation, return-to-shell local state, JPEG/PNG/WebP type checks, >5 MB rejection, corrupt image rejection, local re-encoding, metadata removal by re-encode, no server upload requests, refresh clearing, Save disabled, admin unauthenticated redirect. Desktop/mobile no horizontal overflow. Production/shared data untouched.

## Madeira read-only check

On November 19, 2026, https://gobarefoot.eu confirms February 13-20, 2027, EUR 2,490 total per couple, EUR 1,245 deposit, balance due January 14, 2027, maximum 10 couples/20 guests. Cabins and yoga deck are not complete. Page includes programme and cancellation conditions. The intake capacity value 30 conflicts with the operator page; no database correction was made. This source check does not verify licensing/authorisation, operator identity, safety, photo rights, availability or financial viability. No message was sent to the operator.
