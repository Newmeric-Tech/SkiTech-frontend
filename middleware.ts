import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("skitech_auth")?.value;

  // Public routes — always allow through
  const publicPrefixes = [
    "/auth/",
    "/demo",
    "/_next",
    "/favicon",
    "/api",
  ];
  if (publicPrefixes.some(prefix => pathname.startsWith(prefix)) || pathname === "/") {
    return NextResponse.next();
  }

  // Protected routes — redirect to login if no token
  const protectedPrefixes = ["/owner", "/manager", "/staff", "/superadmin"];
  if (protectedPrefixes.some(prefix => pathname.startsWith(prefix))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
