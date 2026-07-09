import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't need authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/superadmin-login",
  "/auth/verify-invite",
  "/demo",
  "/solutions",
  "/why-skitec",
  "/contact",
  "/features",
  "/pricing",
  "/about",
  "/faqs",
  "/product",
];

// Role → allowed route prefixes
const ROLE_ACCESS: Record<string, string[]> = {
  "Super Admin": ["/superadmin", "/owner", "/manager", "/staff"],
  "Tenant Admin": ["/owner", "/manager", "/staff"],
  "Co Admin":    ["/owner"],
  "Manager":     ["/manager", "/staff"],
  "Staff":       ["/staff"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    )
  ) {
    return NextResponse.next();
  }

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = request.cookies.get("skitech_auth");

  if (!authCookie?.value) {
    if (pathname.startsWith("/superadmin")) {
      return NextResponse.redirect(new URL("/auth/superadmin-login", request.url));
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    // Decode URI encoding (cookie was set with encodeURIComponent)
    const decoded = decodeURIComponent(authCookie.value);
    const parsed = JSON.parse(decoded);
    const role = parsed?.state?.user?.role;

    if (!role) {
      if (pathname.startsWith("/superadmin")) {
        return NextResponse.redirect(new URL("/auth/superadmin-login", request.url));
      }
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // /superadmin/* is ONLY for Super Admin — hard block everything else
    if (pathname.startsWith("/superadmin") && role !== "Super Admin") {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Check role access for all other routes
    const allowedPaths = ROLE_ACCESS[role] || [];
    const hasAccess = allowedPaths.some((path) => pathname.startsWith(path));

    if (!hasAccess) {
      const defaultPath = allowedPaths[0] || "/auth/login";
      return NextResponse.redirect(new URL(defaultPath, request.url));
    }

    return NextResponse.next();
  } catch {
    // Cookie is malformed — clear and redirect
    if (pathname.startsWith("/superadmin")) {
      return NextResponse.redirect(new URL("/auth/superadmin-login", request.url));
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
