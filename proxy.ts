import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const noCacheHeaders: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Engineer protected routes
  if (pathname === "/engineer" || pathname.startsWith("/engineer/")) {
    const sessionCookie = request.cookies.get("ce_engineer_session")?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/engineer-login", request.url);
      const response = NextResponse.redirect(loginUrl, 303);
      for (const [key, val] of Object.entries(noCacheHeaders)) {
        response.headers.set(key, val);
      }
      return response;
    }
  }

  // Customer dashboard routes
  if (pathname === "/customer" || pathname.startsWith("/customer/")) {
    const sessionCookie = request.cookies.get("ce_customer_session")?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl, 303);
      for (const [key, val] of Object.entries(noCacheHeaders)) {
        response.headers.set(key, val);
      }
      return response;
    }
  }

  // Submit intake routes
  if (pathname === "/submit" || pathname.startsWith("/submit/")) {
    const sessionCookie = request.cookies.get("ce_customer_session")?.value;
    if (!sessionCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", "/submit");
      const response = NextResponse.redirect(loginUrl, 303);
      for (const [key, val] of Object.entries(noCacheHeaders)) {
        response.headers.set(key, val);
      }
      return response;
    }
  }

  const response = NextResponse.next();
  for (const [key, val] of Object.entries(noCacheHeaders)) {
    response.headers.set(key, val);
  }
  return response;
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/customer",
    "/engineer/:path*",
    "/engineer",
    "/submit/:path*",
    "/submit",
  ],
};
