import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, AUTH_COOKIE_NAME, extractTokenFromRequest } from "@/lib/auth";

// Public admin-related endpoints that do not require an active session
const PUBLIC_ADMIN_API_PATHS = [
  "/api/admin/auth/login",
  "/api/admin/auth/refresh",
  "/api/admin/auth/logout",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. API Route Protection (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    // Allow public authentication endpoints
    if (PUBLIC_ADMIN_API_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    // Check token from cookie or Authorization header
    const token = extractTokenFromRequest(request);
    if (!token || !verifyAccessToken(token)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Authentication required to access administrative API endpoints.",
        },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // 2. Admin UI Routes (/admin/*)
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = token ? verifyAccessToken(token) : null;

    // Case A: Unauthenticated user visiting any protected admin route
    if (!session && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      if (pathname !== "/admin") {
        loginUrl.searchParams.set("from", pathname);
      }
      const response = NextResponse.redirect(loginUrl);
      // Ensure no cached version of admin data is retained by browser
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      return response;
    }

    // Case B: Authenticated user visiting /admin/login -> redirect to /admin
    if (session && isLoginPage) {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }

    // Case C: Authenticated user visiting protected admin page
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    return response;
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
