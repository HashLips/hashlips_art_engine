import { NextResponse } from "next/server";

// Force Node runtime to avoid edge bundling issues on Cloudflare.
export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = url.host;
  const proto = url.protocol.replace(":", "") || "https";
  const base = `${proto}://${host}`;

  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
