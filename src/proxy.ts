import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/services/api";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/kanban",
  "/clientes",
  "/empresas",
  "/agenda",
  "/equipe",
  "/pesquisa",
  "/perfil",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// Proxy (Next 16; antigo "middleware"): checagem otimista via cookie espelho.
// A autorização real continua no backend; o guard client-side em (app)/layout
// permanece como segunda camada.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token && isProtectedPath(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/";
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname === "/") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/kanban/:path*",
    "/clientes/:path*",
    "/empresas/:path*",
    "/agenda/:path*",
    "/equipe/:path*",
    "/pesquisa/:path*",
    "/perfil/:path*",
  ],
};
