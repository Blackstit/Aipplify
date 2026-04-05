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

  const oldJobMatch = pathname.match(/^\/job\/(\d+)$/)
  if (oldJobMatch) {
    const id = oldJobMatch[1]
    const url = request.nextUrl.clone()
    url.pathname = `/jobs/job-eco-${id}`
    return NextResponse.redirect(url, 301)
  }

  if (pathname === "/jobs" && request.nextUrl.searchParams.get("page") === "1") {
    const url = request.nextUrl.clone()
    url.searchParams.delete("page")
    return NextResponse.redirect(url, 301)
  }

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
