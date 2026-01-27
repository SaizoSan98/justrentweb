import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession, decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  console.log("Middleware running for:", request.nextUrl.pathname);
  
  const currentUser = request.cookies.get("session")?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  // 1. Redirect to /login if accessing admin page without session
  if (isAdminPage && !currentUser) {
    console.log("Admin access denied: No session");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Check if user is actually admin
  if (isAdminPage && currentUser) {
    try {
      const payload = await decrypt(currentUser);
      if (payload.user.role !== 'ADMIN') {
        console.log("Admin access denied: Role is", payload.user.role);
        return NextResponse.redirect(new URL("/", request.url));
      }
      console.log("Admin access granted for:", payload.user.email);
    } catch (error) {
      console.error("Session decryption failed:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. Redirect to /admin if accessing login page while already logged in as admin
  if (isLoginPage && currentUser) {
    try {
      const payload = await decrypt(currentUser);
      if (payload.user.role === 'ADMIN') {
        console.log("Already logged in as admin, redirecting to dashboard");
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    } catch (error) {
      // Invalid token, allow to login again
    }
  }

  // Handle session update
  // We do this LAST so we can attach the cookie to the response we are about to return
  // But wait, if we returned a redirect above, we missed this.
  // Actually, redirects set their own cookies if needed, but here we just want to refresh the session on valid requests.
  
  const response = NextResponse.next();
  
  // Try to update session if it exists
  if (currentUser) {
      try {
          const updateRes = await updateSession(request);
          if (updateRes) {
              // Copy the set-cookie header from updateRes to our response
              // updateRes is a NextResponse
              const setCookie = updateRes.headers.get('set-cookie');
              if (setCookie) {
                  response.headers.set('set-cookie', setCookie);
              }
          }
      } catch (e) {
          console.error("Failed to update session:", e);
      }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
