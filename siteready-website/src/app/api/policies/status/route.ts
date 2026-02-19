import { NextRequest, NextResponse } from "next/server";
import { parseSessionFromRequest } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";
import { hasAcceptedLatestPolicies } from "@/lib/policies/acceptance";

export async function GET(req: NextRequest) {
  const session = await parseSessionFromRequest(req, { allowUnverified: true });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const userId = session.userId || session.email;
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  const required =
    session.role === "client"
      ? (["client_terms", "privacy_policy", "frontend_terms"] as const)
      : (["worker_terms", "privacy_policy", "frontend_terms"] as const);

  const check = await hasAcceptedLatestPolicies(db, userId, [...required]);
  const accepted = {
    client_terms: !check.missing.includes("client_terms"),
    privacy_policy: !check.missing.includes("privacy_policy"),
    worker_terms: !check.missing.includes("worker_terms"),
    frontend_terms: !check.missing.includes("frontend_terms"),
  };

  return NextResponse.json({
    ok: true,
    role: session.role,
    required,
    accepted,
    all_required_accepted: check.ok,
    missing: check.missing,
  });
}
