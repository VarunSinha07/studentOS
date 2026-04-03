import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  // If requesting a dashboard route, check for session
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const defaultCookie = request.cookies.get("better-auth.session_token");
    const secureCookie = request.cookies.get(
      "__Secure-better-auth.session_token",
    );

    // Better Auth standard cookies. If both are missing, redirect to sign-in.
    if (!defaultCookie && !secureCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
