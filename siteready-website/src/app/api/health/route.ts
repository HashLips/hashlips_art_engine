import { NextResponse } from "next/server";

// Force Node runtime to avoid edge bundling issues on Cloudflare.
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "siteready-website",
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
