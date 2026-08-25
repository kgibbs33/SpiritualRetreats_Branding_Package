import { NextResponse } from "next/server";

import { createFacilitatorPhotoSignedUrl } from "@/lib/facilitators/photo";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/**
 * SCOPE-035: serve a published facilitator's headshot without making the bucket
 * public. Looks up the facilitator by slug (published only), signs the private
 * `photo_path`, and redirects to the short-lived signed URL. The bucket stays
 * private; only published facilitators' photos are reachable.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("facilitators")
    .select("photo_path")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data?.photo_path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const signed = await createFacilitatorPhotoSignedUrl(data.photo_path, 3600);
  if (!signed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // SCOPE-098: the signed URL expires (3600s). Without no-store a browser/proxy
  // could cache this 302 and later follow it to an expired URL → broken image.
  const res = NextResponse.redirect(signed, 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
