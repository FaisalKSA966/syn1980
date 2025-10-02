import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for API routes, static files, and auth page
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check for authentication
  const authCookie = request.cookies.get('syn1980_auth')
  const isAuthenticated = authCookie?.value === 'authenticated'

  // If not authenticated and not on auth page, redirect to auth
  if (!isAuthenticated && request.nextUrl.pathname !== '/auth') {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // If authenticated and on auth page, redirect to dashboard
  if (isAuthenticated && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url))
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

