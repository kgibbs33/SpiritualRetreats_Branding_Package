import { NextResponse } from "next/server";

/**
 * GET /api/health — used by the deploy workflow to verify the Node app
 * is serving traffic. Also exposes deploy ID and SHA for version tracking.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      deploy: process.env.DEPLOY_ID ?? "local",
      sha: process.env.DEPLOY_SHA ?? "dev",
    },
    { status: 200 }
  );
}
