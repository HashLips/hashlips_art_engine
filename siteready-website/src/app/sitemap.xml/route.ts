import { NextResponse } from "next/server";

// Force Node runtime to avoid edge bundling issues on Cloudflare.
export const runtime = "nodejs";

function xmlEscape(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = url.host;
  const proto = url.protocol.replace(":", "") || "https";
  const base = `${proto}://${host}`;

  const now = new Date().toISOString();

  const paths = [
    "/",
    "/labour-hire",
    "/for-workers",
    "/technology",
    "/safety-compliance",
    "/contact",
    "/privacy",
    "/terms",
  ];

  const items = paths
    .map((p) => {
      const loc = `${base}${p}`;
      return `<url><loc>${xmlEscape(loc)}</loc><lastmod>${now}</lastmod></url>`;
    })
    .join("");

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;

  return new NextResponse(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
