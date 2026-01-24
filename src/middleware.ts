import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers applied to all routes
const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Enable HSTS (force HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  // Disable browser features we don't need
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  // XSS protection (legacy but still helps)
  'X-XSS-Protection': '1; mode=block',
};

// Content Security Policy - adjust based on your needs
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.vercel-insights.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https:', 'https://*.supabase.co'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co', 'https://api.anthropic.com', 'https://vitals.vercel-insights.com'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

function buildCSP(): string {
  return Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Apply security headers to all routes
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CSP (be careful with this - test thoroughly)
  response.headers.set('Content-Security-Policy', buildCSP());

  // Admin routes - additional protections
  if (pathname.startsWith('/admin')) {
    // No caching for admin pages
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  // API routes
  if (pathname.startsWith('/api')) {
    // Prevent caching of API responses
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
  ],
};
