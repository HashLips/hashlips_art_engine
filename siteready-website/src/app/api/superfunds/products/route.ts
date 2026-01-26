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
  const abn = (url.searchParams.get("abn") || "").trim();
  if (!abn) return NextResponse.json({ results: [] });

  const res = await db
    .prepare(
      `SELECT product_name as productName,
              usi,
              contribution_restrictions as contributionRestrictions,
              from_date as fromDate,
              to_date as toDate
       FROM super_fund_products
       WHERE abn = ?
       ORDER BY product_name`,
    )
    .bind(abn)
    .all();
  const products = (res?.results as Array<Record<string, unknown>>) ?? [];
  return NextResponse.json(
    { products },
    { headers: { "Cache-Control": "public, max-age=60" } },
  );
}
