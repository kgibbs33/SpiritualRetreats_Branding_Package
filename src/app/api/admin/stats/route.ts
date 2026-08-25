import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const [
    { count: seekerCount },
    { count: submissionCount },
    { count: pendingCount },
    { count: facilitatorCount },
    { count: matchCount },
    { count: retreatCount },
  ] = await Promise.all([
    admin.from("seeker_discovery_responses").select("*", { count: "exact", head: true }),
    admin.from("retreat_submissions").select("*", { count: "exact", head: true }),
    admin.from("retreat_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("facilitator_onboarding_responses").select("*", { count: "exact", head: true }),
    admin.from("matches").select("*", { count: "exact", head: true }),
    admin.from("retreats").select("*", { count: "exact", head: true }).eq("status", "published"),
  ]);

  return NextResponse.json({
    seekers: seekerCount ?? 0,
    submissions: submissionCount ?? 0,
    pending: pendingCount ?? 0,
    facilitators: facilitatorCount ?? 0,
    matches: matchCount ?? 0,
    retreats: retreatCount ?? 0,
  });
}
