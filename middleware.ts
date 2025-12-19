import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const path = request.nextUrl.pathname;

  // If no token and trying to access dashboard, redirect to login
  if (!token && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If has token and trying to access auth pages, redirect to dashboard
  if (token && (path.startsWith("/auth/login") || path.startsWith("/auth/register"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role-based access control
  if (token) {
    if (path.startsWith("/dashboard/instructor") && token.role !== "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/dashboard/student", request.url));
    }

    if (path.startsWith("/dashboard/student") && token.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard/instructor", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/login",
    "/auth/register",
  ],
};