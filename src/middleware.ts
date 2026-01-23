import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Rotas públicas
  if (pathname === "/login" || pathname === "/") {
    if (token) {
      // Redireciona usuário logado para a área correta
      const redirectUrl = token.role === "ADMIN" ? "/admin" : "/app";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Rotas protegidas - requer login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rotas do usuário comum - /app/*
  if (pathname.startsWith("/app")) {
    // Admin também pode acessar /app para ver como usuário
    return NextResponse.next();
  }

  // Rotas do admin - /admin/*
  if (pathname.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
