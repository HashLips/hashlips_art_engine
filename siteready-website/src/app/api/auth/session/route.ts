import { NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, session });
}
