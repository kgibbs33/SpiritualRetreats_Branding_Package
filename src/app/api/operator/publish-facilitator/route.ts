import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import {
  CACHE_TAG_FACILITATORS_LIST,
  facilitatorDetailCacheTag,
} from "@/lib/facilitators/cache-tags";
import {
  upsertPublishedFacilitatorFromOnboarding,
  type FacilitatorOnboardingRow,
} from "@/lib/facilitators/publish-from-onboarding";
import { verifyOperatorSecret } from "@/lib/operator/verify-secret";
import { createAdminClient } from "@/lib/supabase/admin";
import { publishFacilitatorSchema } from "@/validation/operatorPublish";

export const runtime = "nodejs";

const SAFE_COLUMNS =
  "id, full_name, city, region, country, practice_areas, website_url, linkedin_url, instagram_url, photo_path, credentials, status";

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

    const parsed = publishFacilitatorSchema.safeParse(await request.json());
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg = Object.values(first)[0]?.[0] ?? "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: onboarding, error: loadErr } = await admin
      .from("facilitator_onboarding_responses")
      .select(SAFE_COLUMNS)
      .eq("id", parsed.data.onboardingId)
      .maybeSingle();

    if (loadErr || !onboarding) {
      return NextResponse.json({ error: "Facilitator not found" }, { status: 404 });
    }

    const row = onboarding as FacilitatorOnboardingRow;
    if (row.status === "rejected") {
      return NextResponse.json(
        { error: "Facilitator was rejected; cannot publish." },
        { status: 400 }
      );
    }

    const { slug } = await upsertPublishedFacilitatorFromOnboarding(admin, row, {
      headline: parsed.data.headline,
      bio: parsed.data.bio,
    });

    const { error: statusErr } = await admin
      .from("facilitator_onboarding_responses")
      .update({ status: "published" })
      .eq("id", row.id);

    if (statusErr) {
      console.error("facilitator publish status update:", statusErr);
      return NextResponse.json(
        { error: "Profile published but status update failed." },
        { status: 500 }
      );
    }

    await admin.from("events").insert({
      event_type: "facilitator_published_from_onboarding",
      entity_type: "facilitator_onboarding_response",
      entity_id: row.id,
      payload: { slug },
    });

    revalidateTag(CACHE_TAG_FACILITATORS_LIST, "max");
    revalidateTag(facilitatorDetailCacheTag(slug), "max");

    return NextResponse.json({ success: true, slug }, { status: 200 });
  } catch (err) {
    console.error("publish-facilitator:", err);
    return NextResponse.json({ error: "Publish failed." }, { status: 500 });
  }
}
