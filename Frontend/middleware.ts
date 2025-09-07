import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Skip middleware for API routes, static files, and public assets
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.includes("favicon.ico") ||
    path.startsWith("/icons") ||
    path.startsWith("/manifest") ||
    path.startsWith("/service-worker")
  ) {
    return NextResponse.next()
  }

  // Temporarily disable auth middleware to prevent redirect loops
  // Authentication will be handled by client-side ProtectedRoute components
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons).*)"],
}

