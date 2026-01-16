import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes are protected client-side via AdminAuthProvider
  // This middleware adds security headers and logging
  if (pathname.startsWith('/admin')) {
    const response = NextResponse.next();

    // Add security headers for admin routes
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  }

  // API routes - add CORS headers if needed
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();

    // Prevent caching of API responses by default
    response.headers.set('Cache-Control', 'no-store, max-age=0');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
