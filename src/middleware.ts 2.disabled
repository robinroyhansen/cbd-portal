import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PASSWORD = 'Robin';

const browserLangToDomain: Record<string, string> = {
  'en': 'swissorganic.co.uk',
  'da': 'cbd.dk',
  'sv': 'cbd.se',
  'no': 'cbd.no',
  'nb': 'cbd.no',
  'nn': 'cbd.no',
  'fi': 'cbd.fi',
  'de': 'cbd.de',
  'it': 'cbd.it',
  'pt': 'cbd.pt',
  'nl': 'cbdportaal.nl',
  'fr': 'cbdportail.fr',
  'ro': 'cbdportal.ro',
  'es': 'cbdportal.es',
};

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;

  // Skip language redirect for API routes, static files
  if (pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check for override cookie (set by client-side JS)
  const hasOverride = request.cookies.get('cbd-language-override');
  if (hasOverride) {
    return NextResponse.next();
  }

  // Check for recent redirect attempt
  const redirectAttempted = request.cookies.get('cbd-redirect-attempted');
  if (redirectAttempted) {
    return NextResponse.next();
  }

  // Get browser language
  const acceptLang = request.headers.get('accept-language') || 'en';
  const browserLang = acceptLang.split(',')[0].split('-')[0].toLowerCase();

  // Determine if redirect needed
  const currentDomain = hostname.replace(':3000', '').replace('www.', '');

  // Skip redirect on localhost and vercel preview
  if (currentDomain === 'localhost' || currentDomain.includes('vercel.app')) {
    return NextResponse.next();
  }

  // Swiss handling - multiple languages on one domain
  if (currentDomain === 'cbdportal.ch') {
    return NextResponse.next(); // Handle Swiss variants client-side
  }

  // Check if user should be on different domain
  const correctDomain = browserLangToDomain[browserLang] || 'swissorganic.co.uk';

  if (currentDomain !== correctDomain) {
    const url = new URL(request.url);
    url.hostname = correctDomain;
    url.port = '';

    const response = NextResponse.redirect(url);
    // Don't redirect again for 24 hours
    response.cookies.set('cbd-redirect-attempted', 'true', { maxAge: 86400 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};