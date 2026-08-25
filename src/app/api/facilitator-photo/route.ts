import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { FACILITATOR_MEDIA_BUCKET } from "@/lib/facilitators/photo";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (mirrors the bucket limit)

/** Allowed types with a magic-byte check, so a spoofed Content-Type is rejected. */
const ALLOWED: Record<string, { ext: string; magic: (b: Uint8Array) => boolean }> = {
  "image/jpeg": {
    ext: "jpg",
    magic: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  "image/png": {
    ext: "png",
    magic: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  "image/webp": {
    ext: "webp",
    magic: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && // RIFF
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50, // WEBP
  },
};

export async function POST(request: Request) {
  // Rate limit per IP (in-memory fixed window), then a Fetch-metadata check.
  const rl = checkRateLimit(request, "api:facilitator-photo");
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }
  if (
    process.env.DISABLE_SEC_FETCH_SITE_GUARD !== "true" &&
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image too large (max 5 MB)." },
      { status: 413 }
    );
  }

  const spec = ALLOWED[file.type];
  if (!spec) {
    return NextResponse.json(
      { error: "Unsupported image type. Use JPEG, PNG, or WebP." },
      { status: 415 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "Invalid image size." }, { status: 413 });
  }
  if (!spec.magic(bytes)) {
    return NextResponse.json(
      { error: "File content does not match an allowed image type." },
      { status: 415 }
    );
  }

  // Server-generated path; the client filename is never trusted.
  const path = `facilitators/${randomUUID()}.${spec.ext}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(FACILITATOR_MEDIA_BUCKET)
    .upload(path, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    console.error("facilitator-photo upload failed:", error.message);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ path });
}
