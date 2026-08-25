import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import {
  CACHE_TAG_RETREATS_LIST,
  retreatDetailCacheTag,
} from "@/lib/retreats/cache-tags";
import { verifyOperatorSecret } from "@/lib/operator/verify-secret";
import {
  upsertPublishedRetreatFromSubmission,
  type RetreatSubmissionRow,
} from "@/lib/retreats/publish-from-submission";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishRetreatSubmissionSchema } from "@/validation/operatorPublish";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!verifyOperatorSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const parsed = publishRetreatSubmissionSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: submission, error: loadErr } = await admin
      .from("retreat_submissions")
      .select(
        "id, retreat_title, location, start_date, end_date, description, price_range, status, category"
      )
      .eq("id", parsed.data.submissionId)
      .maybeSingle();

    if (loadErr || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const row = submission as RetreatSubmissionRow;
    if (row.status === "rejected") {
      return NextResponse.json(
        { error: "Submission was rejected; cannot publish." },
        { status: 400 }
      );
    }

    const { slug } = await upsertPublishedRetreatFromSubmission(admin, row);

    const { error: statusErr } = await admin
      .from("retreat_submissions")
      .update({ status: "approved" })
      .eq("id", row.id);

    if (statusErr) {
      console.error("retreat_submissions approve:", statusErr);
      return NextResponse.json(
        { error: "Listing published but submission status update failed." },
        { status: 500 }
      );
    }

    await admin.from("events").insert({
      event_type: "retreat_published_from_submission",
      entity_type: "retreat_submission",
      entity_id: row.id,
      payload: { slug },
    });

    revalidateTag(CACHE_TAG_RETREATS_LIST, "max");
    revalidateTag(retreatDetailCacheTag(slug), "max");

    return NextResponse.json({ success: true, slug }, { status: 200 });
  } catch (err) {
    console.error("publish-retreat-submission:", err);
    return NextResponse.json(
      { error: "Publish failed." },
      { status: 500 }
    );
  }
}
