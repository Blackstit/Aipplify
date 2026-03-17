import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Protected routes that require authentication
  const protectedRoutes = ["/for-recruiters", "/profile"]
  
  // Admin routes
  const adminRoutes = ["/admin"]
  
  // Moderator routes (includes admin)
  const moderatorRoutes = ["/moderator", "/admin"]
  
  const pathname = request.nextUrl.pathname
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  const isModeratorRoute = moderatorRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // For now, we'll handle auth checks in the page components
  // since we're using localStorage (client-side)
  // In production, use proper server-side sessions/cookies
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
