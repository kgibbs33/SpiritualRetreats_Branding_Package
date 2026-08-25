import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { getAdminSession } from "@/lib/admin/auth";
import {
  CACHE_TAG_FACILITATORS_LIST,
  facilitatorDetailCacheTag,
} from "@/lib/facilitators/cache-tags";
import {
  upsertPublishedFacilitatorFromOnboarding,
  type FacilitatorOnboardingRow,
} from "@/lib/facilitators/publish-from-onboarding";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const SAFE_COLUMNS =
  "id, full_name, city, region, country, practice_areas, website_url, linkedin_url, instagram_url, photo_path, credentials, status";

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

  if (action === "publish") {
    const { data: onboarding, error: loadErr } = await admin
      .from("facilitator_onboarding_responses")
      .select(SAFE_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (loadErr || !onboarding) {
      return NextResponse.json({ error: "Facilitator not found" }, { status: 404 });
    }
    // SCOPE-058: no public directory exposure until vetted. The facilitator
    // must have passed the vetting checklist (status "vetted"; legacy
    // "reviewed" rows are treated as vetted) before publish.
    if (onboarding.status !== "vetted" && onboarding.status !== "reviewed") {
      return NextResponse.json(
        {
          error:
            onboarding.status === "rejected"
              ? "Cannot publish a rejected facilitator."
              : "Vet this facilitator before publishing (complete the checklist).",
        },
        { status: 400 }
      );
    }

    const { slug } = await upsertPublishedFacilitatorFromOnboarding(
      admin,
      onboarding as FacilitatorOnboardingRow,
      { headline: body?.headline ?? null, bio: body?.bio ?? null }
    );

    // NOTE: these are two separate, non-atomic writes following the (throwing)
    // upsert above — the same shape as the retreat publish flow. A full RPC to
    // make this transactional is out of scope here; at minimum we no longer
    // silently discard errors on the secondary writes.
    const { error: statusErr } = await admin
      .from("facilitator_onboarding_responses")
      .update({ status: "published" })
      .eq("id", id);
    if (statusErr) {
      return NextResponse.json(
        { error: "Listing published but submission status update failed." },
        { status: 500 }
      );
    }
    const { error: eventErr } = await admin.from("events").insert({
      event_type: "facilitator_published_from_onboarding",
      entity_type: "facilitator_onboarding_response",
      entity_id: id,
      payload: { slug },
    });
    if (eventErr) {
      return NextResponse.json(
        { error: "Listing published but audit event write failed." },
        { status: 500 }
      );
    }

    revalidateTag(CACHE_TAG_FACILITATORS_LIST, "max");
    revalidateTag(facilitatorDetailCacheTag(slug), "max");

    return NextResponse.json({ ok: true, slug });
  }

  // SCOPE-058: record the vetting checklist and move pending -> vetted. All
  // three checks must be confirmed (CV/documents, referral contacts, promotion
  // consent) before a facilitator is eligible to be published.
  if (action === "vet") {
    const cl = body?.checklist ?? {};
    const cvReviewed = Boolean(cl.cvReviewed);
    const referralsChecked = Boolean(cl.referralsChecked);
    const promotionConsent = Boolean(cl.promotionConsent);
    if (!cvReviewed || !referralsChecked || !promotionConsent) {
      return NextResponse.json(
        { error: "Complete all checklist items before vetting." },
        { status: 400 }
      );
    }
    const at = new Date().toISOString();
    const { error } = await admin
      .from("facilitator_onboarding_responses")
      .update({
        status: "vetted",
        vetted_at: at,
        vetting: {
          cvReviewed,
          referralsChecked,
          promotionConsent,
          notes: typeof cl.notes === "string" ? cl.notes.slice(0, 2000) : null,
          at,
        },
      })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Update failed." }, { status: 500 });
    }
    await admin.from("events").insert({
      event_type: "facilitator_vetted",
      entity_type: "facilitator_onboarding_response",
      entity_id: id,
      payload: { cvReviewed, referralsChecked, promotionConsent },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "rejected" || action === "reset") {
    const status = action === "reset" ? "new" : action;
    // Reset returns the submission to pending and clears the vetting record.
    const patch =
      action === "reset"
        ? { status, vetted_at: null, vetting: null }
        : { status };
    const { error: onboardingErr } = await admin
      .from("facilitator_onboarding_responses")
      .update(patch)
      .eq("id", id);
    if (onboardingErr) {
      return NextResponse.json({ error: "Update failed." }, { status: 500 });
    }
    // Un-publishing withdraws the public row too.
    const { error: withdrawErr } = await admin
      .from("facilitators")
      .update({ status: "draft" })
      .eq("source_onboarding_id", id);
    if (withdrawErr) {
      return NextResponse.json({ error: "Update failed." }, { status: 500 });
    }
    revalidateTag(CACHE_TAG_FACILITATORS_LIST, "max");
    return NextResponse.json({ ok: true });
  }

  // SCOPE-037: admin toggles the published facilitator's availability.
  if (action === "set_open_to_work") {
    const value = Boolean(body?.openToWork);
    const { error } = await admin
      .from("facilitators")
      .update({ open_to_work: value })
      .eq("source_onboarding_id", id);
    if (error) {
      return NextResponse.json({ error: "Update failed." }, { status: 500 });
    }
    revalidateTag(CACHE_TAG_FACILITATORS_LIST, "max");
    return NextResponse.json({ ok: true, openToWork: value });
  }

  // SCOPE-044: admin marks the published facilitator verified / unverified.
  if (action === "set_verified") {
    const value = Boolean(body?.verified);
    const { error } = await admin
      .from("facilitators")
      .update({ verified: value, verified_at: value ? new Date().toISOString() : null })
      .eq("source_onboarding_id", id);
    if (error) {
      return NextResponse.json({ error: "Update failed." }, { status: 500 });
    }
    revalidateTag(CACHE_TAG_FACILITATORS_LIST, "max");
    return NextResponse.json({ ok: true, verified: value });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
