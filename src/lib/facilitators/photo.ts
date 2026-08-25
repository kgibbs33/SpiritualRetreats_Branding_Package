import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export const FACILITATOR_MEDIA_BUCKET = "facilitator-media";

/** Object paths we generate: `facilitators/<uuid>.<ext>`. Used to reject arbitrary input. */
const PATH_RE = /^facilitators\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function isValidFacilitatorPhotoPath(path: string): boolean {
  return PATH_RE.test(path);
}

/** CV object paths we generate: `facilitators/cv/<uuid>.pdf`. */
const CV_PATH_RE = /^facilitators\/cv\/[0-9a-f-]{36}\.pdf$/;

export function isValidFacilitatorCvPath(path: string): boolean {
  return CV_PATH_RE.test(path);
}

/**
 * Build a safe, human-readable download filename for a facilitator CV.
 * Slugifies the facilitator's name so admins get `RTY-CV-jane-doe.pdf` instead
 * of `RTY-CV-<uuid>.pdf`. Falls back to a generic name when no name is given.
 *
 * Pass `ref` (the facilitator's row id, or the CV object path) to disambiguate
 * identically-named facilitators — a short hex fragment is appended, e.g.
 * `RTY-CV-jane-doe-4f3a2b1c.pdf`. Two "Jane Doe" rows have different ids, so
 * their downloads never collide.
 */
export function facilitatorCvDownloadName(
  fullName?: string | null,
  ref?: string | null
): string {
  const slug = (fullName ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents (combining diacritics)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const base = slug || "facilitator";
  // First 8 hex chars of the ref (uuid id or path) — unique enough across a
  // facilitator roster, and keeps the filename short and readable.
  const disc = (ref ?? "").replace(/[^a-f0-9]/gi, "").slice(0, 8).toLowerCase();
  return disc ? `RTY-CV-${base}-${disc}.pdf` : `RTY-CV-${base}.pdf`;
}

/**
 * Short-lived signed URL for a private facilitator CV (admin-only).
 * Always forces a download rather than inline render, so any JavaScript
 * embedded in the PDF cannot execute in the admin's browser.
 *
 * Pass `downloadName` (e.g. from `facilitatorCvDownloadName(fullName)`) to get a
 * readable filename; omit it to fall back to the object's `<uuid>.pdf` name.
 * Returns null for invalid paths or on error.
 */
export async function createFacilitatorCvSignedUrl(
  path: string,
  expiresInSec = 3600,
  downloadName?: string
): Promise<string | null> {
  if (!isValidFacilitatorCvPath(path)) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(FACILITATOR_MEDIA_BUCKET)
    .createSignedUrl(path, expiresInSec, { download: downloadName ?? true });
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/**
 * Short-lived signed URL for a private facilitator headshot.
 * The bucket is private (no public/anon access), so reads must be signed.
 * Returns null for invalid paths or on error.
 */
export async function createFacilitatorPhotoSignedUrl(
  path: string,
  expiresInSec = 3600
): Promise<string | null> {
  if (!isValidFacilitatorPhotoPath(path)) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(FACILITATOR_MEDIA_BUCKET)
    .createSignedUrl(path, expiresInSec);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
