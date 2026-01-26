import { NextResponse } from "next/server";

// Force Node runtime to avoid edge bundling issues on Cloudflare.
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      mapsKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    },
    { status: 200 },
  );
}
