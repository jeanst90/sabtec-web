import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "sabtec_session";

const WINDOW_MS = 60_000;
const MAX_REQ = 120;
const buckets = new Map<string, { count: number; reset: number }>();

const PROTECTED_PATHS = [
  "/dashboard",
  "/quotes",
  "/warranties",
  "/customers",
  "/catalog",
  "/ai",
  "/analytics",
  "/reports",
  "/settings",
  "/feedback",
  "/maintenance",
];

const PUBLIC_PATHS = [
  "/login",
  "/p",
  "/api/auth",
  "/api/public",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/sw.js",
  "/icons",
];

function rateLimit(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.reset < now) {
    buckets.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (b.count >= MAX_REQ) return false;
  b.count += 1;
  return true;
}

function isPublicPath(pathname: string) {
  if (pathname === "/") return false;
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isProtectedPath(pathname: string) {
  if (pathname === "/") return true;
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  // Permitir rotas públicas
  if (isPublicPath(pathname)) {
    const res = NextResponse.next();
    // Security headers
    res.headers.set("X-Frame-Options", "SAMEORIGIN");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    res.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'"
    );
    if (pathname.startsWith("/api/")) {
      if (!rateLimit(ip)) {
        return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return res;
  }

  // Proteção de rotas
  if (isProtectedPath(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const res = NextResponse.next();

  // Security headers
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'"
  );

  if (pathname.startsWith("/api/")) {
    if (!rateLimit(ip)) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};