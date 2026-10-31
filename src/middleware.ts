import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "sabtec_session";

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

function isPublicPath(pathname: string) {
  if (pathname === "/") return false; // proteger raiz também
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isProtectedPath(pathname: string) {
  if (pathname === "/") return true;
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir arquivos estáticos e rotas públicas
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Verificar se é rota protegida
  if (isProtectedPath(pathname)) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
