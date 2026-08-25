import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { FACILITATOR_MEDIA_BUCKET } from "@/lib/facilitators/photo";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (mirrors the bucket limit; CVs are small)

/** PDF magic bytes: "%PDF". A spoofed Content-Type is rejected. */
function isPdf(b: Uint8Array): boolean {
  return b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46;
}

export async function POST(request: Request) {
  const rl = checkRateLimit(request, "api:facilitator-cv");
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
      { error: "PDF too large (max 5 MB)." },
      { status: 413 }
    );
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a PDF." },
      { status: 415 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "Invalid file size." }, { status: 413 });
  }
  if (!isPdf(bytes)) {
    return NextResponse.json(
      { error: "File content is not a valid PDF." },
      { status: 415 }
    );
  }

  // Server-generated path; the client filename is never trusted.
  const path = `facilitators/cv/${randomUUID()}.pdf`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(FACILITATOR_MEDIA_BUCKET)
    .upload(path, bytes, {
      contentType: "application/pdf",
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    console.error("facilitator-cv upload failed:", error.message);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ path });
}
