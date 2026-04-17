import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Define Public Routes
  const isPublicRoute = 
    path === '/' || 
    path === '/onboard' || 
    path.startsWith('/api/') || 
    path.startsWith('/_next/') || 
    path.startsWith('/brand/') ||
    path.includes('.');

  // 2. Check for Sanctuary Session
  const hasSession = request.cookies.has('sanctuary_session');

  // 3. Lock Logic: Redirect to /onboard if trying to access private routes without a session
  if (!isPublicRoute && !hasSession) {
    return NextResponse.redirect(new URL('/onboard', request.url));
  }

  return NextResponse.next();
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
};
