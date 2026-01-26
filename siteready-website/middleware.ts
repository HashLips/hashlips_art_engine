import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseSessionFromRequest } from "./src/lib/auth/session";

const PROTECTED_PREFIXES = ["/dashboard", "/client", "/worker", "/staff"];

export async function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl.clone();
    const host = url.hostname;

    // Redirect www.sitereadyworkforce.com -> sitereadyworkforce.com
    if (host === "www.sitereadyworkforce.com") {
      url.hostname = "sitereadyworkforce.com";
      return NextResponse.redirect(url, 308);
    }

    const user =
      process.env.BASIC_AUTH_USER ||
      process.env.BASIC_AUTH_USERNAME ||
      process.env.BASIC_AUTH_LOGIN ||
      "";
    const pass =
      process.env.BASIC_AUTH_PASS ||
      process.env.BASIC_AUTH_PASSWORD ||
      process.env.BASIC_AUTH_SECRET ||
      "";

    const basicAuthEnabledExplicit =
      (process.env.BASIC_AUTH_ENABLED || "").toLowerCase() === "true" ||
      (process.env.BASIC_AUTH_ENABLE || "").toLowerCase() === "true";

    // Fallback: if user/pass are present, enforce auth even if the enable flag is missing
    const basicAuthEnabled = basicAuthEnabledExplicit || (user && pass);

    if (basicAuthEnabled) {
      if (!user || !pass) {
        return new NextResponse("Unauthorized", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="SiteReady"' },
        });
      }
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Basic ")) {
        return new NextResponse("Unauthorized", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="SiteReady"' },
        });
      }

      const encoded = authHeader.replace("Basic ", "");
      let decoded = "";
      try {
        if (typeof globalThis.atob === "function") {
          decoded = globalThis.atob(encoded);
        }
      } catch {
        decoded = "";
      }
      if (!decoded) {
        return new NextResponse("Unauthorized", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="SiteReady"' },
        });
      }
      const credentials = decoded.split(":");
      const [providedUser, providedPass] = credentials;

      if (providedUser !== user || providedPass !== pass) {
        return new NextResponse("Unauthorized", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="SiteReady"' },
        });
      }
    }

    const isProtected = PROTECTED_PREFIXES.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`));
    if (!isProtected) {
      return NextResponse.next();
    }

    const session = await parseSessionFromRequest(req, { allowUnverified: true });

    if (!session) {
      const returnTo = `${url.pathname}${url.search}`;
      const loginUrl = new URL("/login", url.origin);
      loginUrl.searchParams.set("next", returnTo);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="SiteReady"' },
    });
  }
}

export const config = {
  matcher: "/:path*",
};
