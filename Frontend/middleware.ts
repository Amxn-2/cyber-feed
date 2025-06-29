import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // For Firebase auth, we need to check for the Firebase auth cookie
  // Firebase stores auth state in localStorage, which we can't access in middleware
  // So we'll use a simpler approach for now

  const path = request.nextUrl.pathname
  const isAuthPage = path === "/login" || path === "/register"

  // Skip middleware for API routes and static files
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.includes("favicon.ico") ||
    path.startsWith("/icons")
  ) {
    return NextResponse.next()
  }

  // For now, we'll disable the middleware redirect logic
  // and handle auth redirects in the client components
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons).*)"],
}

