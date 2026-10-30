import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/login", "/api/auth/login", "/api/auth/seed", "/p", "/api/public", "/_next", "/favicon.ico", "/brand", "/auth", "/fonts", "/manifest.json", "/sw.js"];

function isPublic(path: string) {
  if (path === "/") return false;
  if (PUBLIC.some((p) => path.startsWith(p))) return true;
  if (path.startsWith("/api/auth/")) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();
  const token = req.cookies.get("sabtec_session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webp$|.*\\.ico$).*)"],
};
