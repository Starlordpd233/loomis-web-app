// middleware.ts (at project root, same level as package.json / next.config.*)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only handle /onboarding (and children)
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) {
    const raw = req.cookies.get("catalogPrefs")?.value || null;

    // --- DEBUG HEADERS so you can see it ran ---
    const dbg = NextResponse.next();
    dbg.headers.set("x-mw-ran", "1");
    dbg.headers.set("x-mw-path", pathname);
    dbg.headers.set("x-mw-cookie", raw ? "present" : "missing");

    if (!raw) return dbg;

    let complete = false;
    try {
      // cookie was written with encodeURIComponent on the client
      const prefs = JSON.parse(decodeURIComponent(raw));
      complete =
        !!prefs?.grade &&
        !!prefs?.mathCourse &&
        !!prefs?.language?.name &&
        !!prefs?.language?.level;
      dbg.headers.set("x-mw-complete", complete ? "1" : "0");
    } catch (e) {
      dbg.headers.set("x-mw-parse", "error");
      return dbg; // parsing failed → do not redirect
    }

    if (complete) {
      // EARLY REDIRECT (no chance to fall through)
      const url = req.nextUrl.clone();
      url.pathname = "/browser";
      return NextResponse.redirect(url);
    }

    return dbg; // ran, cookie present, but not complete
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/onboarding", "/onboarding/:path*"],
};
