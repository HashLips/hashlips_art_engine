import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { hasD1Binding } from "@/lib/db/config";

type RateState = { count: number; resetAt: number };
const rateMap = new Map<string, RateState>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 60;

const getClientIp = (req: NextRequest) =>
  req.headers.get("cf-connecting-ip") ||
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  "unknown";

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const state = rateMap.get(ip);
  if (!state || state.resetAt < now) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (state.count >= RATE_LIMIT) return false;
  state.count += 1;
  return true;
};

export async function GET(req: NextRequest) {
  if (!hasD1Binding()) return NextResponse.json({ error: "Platform not configured" }, { status: 503 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const like = `%${q}%`;
  const res = await db
    .prepare(
      `SELECT DISTINCT fund_name as fundName, abn
       FROM super_fund_products
       WHERE fund_name LIKE ? COLLATE NOCASE
       ORDER BY fund_name
       LIMIT 20`,
    )
    .bind(like)
    .all();
  const results = (res?.results as Array<{ fundName: string; abn: string }>) ?? [];
  return NextResponse.json(
    { results },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}

