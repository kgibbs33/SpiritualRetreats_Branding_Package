# Storage (Supabase) — uploads & private media

**Vault:** `docs/30_infrastructure` · **Last verified:** 2026-06-18
**Related:** [SUPABASE_EU.md](SUPABASE_EU.md)

## Buckets

| Bucket | Visibility | Limits | Used by |
|--------|------------|--------|---------|
| `facilitator-media` | **Private** (no anon/authenticated policies) | 5 MB, `image/jpeg` `image/png` `image/webp` `application/pdf` | Facilitator headshots (SCOPE-026) + CV/credentials PDFs (SCOPE-028) |

`facilitator-media` is created by migration `supabase/migrations/20260618000000_facilitator_photo_storage.sql` and extended for PDFs by `20260619010000_facilitator_cv_storage.sql`. With **no RLS policies** on the bucket, all anon/authenticated access is denied; only the **service-role key** (server-side API routes) can read/write. Reads are served via short-lived **signed URLs**.

## Facilitator photo upload (SCOPE-026)

End-to-end flow:

1. **Client** ([`FacilitatorOnboardingForm.tsx`](../../src/components/facilitator/FacilitatorOnboardingForm.tsx)) — on file select, `optimizeImage()` downscales to ≤ 600px and re-encodes as JPEG via canvas. This shrinks the payload and **strips EXIF/GPS metadata**. Client-side type/size pre-checks.
2. **Upload route** [`POST /api/facilitator-photo`](../../src/app/api/facilitator-photo/route.ts) — Node runtime. Defense in depth:
   - **Rate limited** per IP (`checkRateLimit`, key `api:facilitator-photo`) + Fetch-metadata (`Sec-Fetch-Site`) check.
   - **Validation:** size ≤ 5 MB, MIME in the allowed set, and a **magic-byte signature check** so a spoofed `Content-Type` is rejected (e.g. text declared as `image/jpeg` → 415).
   - **Server-generated path** `facilitators/<uuid>.<ext>` — the client filename is never trusted (no path traversal).
   - Uploads via the **service-role** admin client to the private bucket; returns `{ path }`.
3. **DB** — the path is sent back with the form submission; the onboarding schema constrains `photoPath` to `^facilitators/<uuid>.(jpg|png|webp)$` (rejects arbitrary input), stored in `facilitator_onboarding_responses.photo_path`.
4. **Reads** — [`createFacilitatorPhotoSignedUrl(path)`](../../src/lib/facilitators/photo.ts) returns a 1-hour signed URL (validates the path shape first). The bucket itself stays private.

### Verified (2026-06-18)
- Valid JPEG → `200 { path }`; object lands in the bucket.
- Oversized (> 5 MB) → `413`; wrong type (gif) → `415`; spoofed text-as-jpeg → `415` (magic-byte check).
- Public unsigned URL → `400` (private); signed URL → `200` (read works).
- Invalid `photoPath` (`../../etc/passwd`) → `400` (schema rejects).

## Facilitator CV upload (SCOPE-028)

PDF CV / credentials document, admin-only (lets the team verify a facilitator's
experience during matching/trust-tiering). Same private bucket, same defenses:

1. **Client** — PDF-only `<input>`; client pre-checks type (`application/pdf`) and size (≤ 5 MB).
2. **Upload route** [`POST /api/facilitator-cv`](../../src/app/api/facilitator-cv/route.ts) — rate limited (`api:facilitator-cv`) + `Sec-Fetch-Site`; size ≤ 5 MB; `Content-Type` must be `application/pdf`; **magic-byte check** (`%PDF`) rejects spoofed content; **server-generated path** `facilitators/cv/<uuid>.pdf`; service-role upload.
3. **DB** — schema constrains `cvPath` to `^facilitators/cv/<uuid>.pdf$`, stored in `facilitator_onboarding_responses.cv_path`.
4. **Reads** — [`createFacilitatorCvSignedUrl(path, ttl, downloadName?)`](../../src/lib/facilitators/photo.ts) returns a signed URL that **forces a download** (not inline render — prevents any JS embedded in the PDF from executing in an admin's browser). The stored object is named `<uuid>.pdf` (we discard the client filename at upload for safety), so the download defaults to that UUID name. Pass `downloadName` — e.g. `facilitatorCvDownloadName(fullName, rowId)` → `RTY-CV-jane-doe-4f3a2b1c.pdf` — to give admins a readable filename (`Content-Disposition: attachment; filename=…`). The future admin/matching UI supplies the facilitator's name **and row id**; the id contributes a short hex suffix so identically-named facilitators ("Jane Doe" × 2) never produce colliding downloads. Object keys and DB ids are already UUIDs, so the only collision risk is the human-readable filename, which this suffix removes.

### Verified (2026-06-19)
- Valid PDF → `200 { path }`; persisted as `cv_path`.
- Spoofed non-PDF as `application/pdf` → `415` (magic-byte check); wrong `Content-Type` → `415`.
- Signed forced-download URL → `200`; public unsigned URL → `400` (private).

## Verify

```bash
# bucket is private + limited:
curl -s "$SUPABASE_URL/storage/v1/bucket/facilitator-media" -H "Authorization: Bearer $SERVICE_KEY" | jq '{public, file_size_limit, allowed_mime_types}'
# public access denied (expect 400):
curl -s -o /dev/null -w '%{http_code}\n' "$SUPABASE_URL/storage/v1/object/public/facilitator-media/facilitators/x.jpg"
```
