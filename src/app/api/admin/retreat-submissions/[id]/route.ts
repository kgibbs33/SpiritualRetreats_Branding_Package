import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CACHE_TAG_RETREATS_LIST } from "@/lib/retreats/cache-tags";
import {
  buildSlugFromSubmission,
  type RetreatSubmissionRow,
} from "@/lib/retreats/publish-from-submission";
import { retreatDetailCacheTag } from "@/lib/retreats/cache-tags";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action: string = body?.action ?? "";

  const admin = createAdminClient();

  if (action === "approve") {
    const { data: submission, error: loadErr } = await admin
      .from("retreat_submissions")
      .select("id, retreat_title, location, start_date, end_date, description, price_range, status")
      .eq("id", id)
      .maybeSingle();

    if (loadErr || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }
    if (submission.status === "rejected") {
      return NextResponse.json({ error: "Cannot approve a rejected submission." }, { status: 400 });
    }

    // Slug is generated here (single source of truth) and passed into the RPC.
    const target_slug = buildSlugFromSubmission(submission as RetreatSubmissionRow);

    // Atomic publish: upsert the listing, flip the submission to approved, and
    // write the audit event in one transaction. Any failure rolls all of it
    // back, so we never get a half-published state.
    const { error: rpcErr } = await admin.rpc("publish_retreat_submission", {
      submission_id: id,
      target_slug,
    });
    if (rpcErr) {
      return NextResponse.json(
        { error: "Publish failed. Nothing was changed." },
        { status: 500 }
      );
    }

    revalidateTag(CACHE_TAG_RETREATS_LIST, "max");
    revalidateTag(retreatDetailCacheTag(target_slug), "max");

    return NextResponse.json({ ok: true, slug: target_slug });
  }

  if (action === "reject") {
    const { error } = await admin
      .from("retreat_submissions")
      .update({ status: "rejected" })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Update failed." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "reset") {
    const { error } = await admin
      .from("retreat_submissions")
      .update({ status: "pending" })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Update failed." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
