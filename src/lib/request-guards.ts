/**
 * Defense-in-depth for browser-initiated JSON POSTs (MDN: CSRF mitigations, Fetch metadata).
 */

import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/rate-limit";

export type GuardRouteKey =
  | "contact"
  | "newsletter"
  | "seeker-discovery"
  | "home-quick-capture"
  | "retreat-submission"
  | "facilitator-onboarding"
  | "facilitator-matching";

const ROUTE_PREFIX = "api:";

/**
 * Rate limit + optional Sec-Fetch-Site check. Returns a Response to return early, or null to continue.
 */
export function publicJsonPostGuards(
  request: Request,
  routeKey: GuardRouteKey
): NextResponse | null {
  if (request.method !== "POST") return null;

  const rl = checkRateLimit(request, `${ROUTE_PREFIX}${routeKey}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  if (process.env.DISABLE_SEC_FETCH_SITE_GUARD === "true") {
    return null;
  }

  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
