import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession, decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Update session expiration if it exists
  await updateSession(request);

  const currentUser = request.cookies.get("session")?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  // 1. Redirect to /login if accessing admin page without session
  if (isAdminPage && !currentUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Check if user is actually admin
  if (isAdminPage && currentUser) {
    try {
      const payload = await decrypt(currentUser);
      if (payload.user.role !== 'ADMIN') {
        // If logged in but not admin, redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. Redirect to /admin if accessing login page while already logged in as admin
  if (isLoginPage && currentUser) {
    try {
      const payload = await decrypt(currentUser);
      if (payload.user.role === 'ADMIN') {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch (error) {
      // Invalid token, allow to login again
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
