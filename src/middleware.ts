import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Domain to language mapping for multi-domain support
const domainToLanguage: Record<string, string> = {
  'swissorganic.co.uk': 'en',
  'cbd-portal.vercel.app': 'en',
  'cbdportal.com': 'en',
  'cbd.dk': 'da',
  'cbd.se': 'sv',
  'cbd.no': 'no',
  'cbd.fi': 'fi',
  'cbd.de': 'de',
  'cbd.it': 'it',
  'cbdportaal.nl': 'nl',
  'cbdportail.fr': 'fr',
  'cbdportal.ch': 'de-CH', // Default Swiss language
  'localhost': 'en',
};

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

  // Detect language from domain
  const hostname = request.headers.get('host')?.split(':')[0] || 'localhost';
  const detectedLanguage = domainToLanguage[hostname] || 'en';

  // Handle Swiss domain language detection from Accept-Language header
  let language = detectedLanguage;
  if (hostname === 'cbdportal.ch') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    if (acceptLanguage.startsWith('fr')) {
      language = 'fr-CH';
    } else if (acceptLanguage.startsWith('it')) {
      language = 'it-CH';
    } else {
      language = 'de-CH';
    }
  }

  // Check for language override in URL query parameter
  const urlLang = request.nextUrl.searchParams.get('lang');
  if (urlLang) {
    // Accept any language code from the switcher
    language = urlLang;
  }

  // Check for language override in cookie (persisted preference)
  const cookieLang = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLang && !urlLang) {
    language = cookieLang;
  }

  // Create response with request headers modified
  // This is the correct way to pass data to server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-language', language);
  requestHeaders.set('x-hostname', hostname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also set cookie for persistence when ?lang= is used
  if (urlLang) {
    response.cookies.set('NEXT_LOCALE', language, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

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
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
