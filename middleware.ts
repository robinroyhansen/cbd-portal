import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// INLINED ROUTE TRANSLATIONS (to avoid import issues in middleware)
// ============================================================================

type SupportedRouteLanguage = 'da' | 'no';

const routeTranslations: Record<SupportedRouteLanguage, Record<string, string>> = {
  da: {
    'tools': 'vaerktoejer',
    'conditions': 'tilstande',
    'articles': 'artikler',
    'glossary': 'ordliste',
    'research': 'forskning',
    'about': 'om-os',
    'contact': 'kontakt',
    'pets': 'kaeledyr',
    'reviews': 'anmeldelser',
    'categories': 'kategorier',
    'authors': 'forfattere',
    'search': 'soeg',
    'dosage-calculator': 'dosis-beregner',
    'animal-dosage-calculator': 'dyre-dosis-beregner',
    'cost-calculator': 'pris-beregner',
    'strength-calculator': 'styrke-beregner',
    'interactions': 'interaktioner',
    'dogs': 'hunde',
    'cats': 'katte',
    'horses': 'heste',
    'small-pets': 'smaa-kaeledyr',
    'birds': 'fugle',
    'medical-disclaimer': 'medicinsk-ansvarsfraskrivelse',
    'editorial-policy': 'redaktionspolitik',
    'privacy-policy': 'privatlivspolitik',
    'terms-of-service': 'servicevilkaar',
    'cookie-policy': 'cookiepolitik',
  },
  no: {
    'tools': 'verktoy',
    'conditions': 'tilstander',
    'articles': 'artikler',
    'glossary': 'ordliste',
    'research': 'forskning',
    'about': 'om-oss',
    'contact': 'kontakt',
    'pets': 'kjaeledyr',
    'reviews': 'anmeldelser',
    'categories': 'kategorier',
    'authors': 'forfattere',
    'search': 'sok',
    'dosage-calculator': 'dose-kalkulator',
    'animal-dosage-calculator': 'dyre-dose-kalkulator',
    'cost-calculator': 'pris-kalkulator',
    'strength-calculator': 'styrke-kalkulator',
    'interactions': 'interaksjoner',
    'dogs': 'hunder',
    'cats': 'katter',
    'horses': 'hester',
    'small-pets': 'smaa-kjaeledyr',
    'birds': 'fugler',
    'medical-disclaimer': 'medisinsk-ansvarsfraskrivelse',
    'editorial-policy': 'redaksjonspolitikk',
    'privacy-policy': 'personvernpolitikk',
    'terms-of-service': 'tjenestevilkaar',
    'cookie-policy': 'informasjonskapsler',
  },
};

// Create reverse mappings
const reverseRouteTranslations: Record<SupportedRouteLanguage, Record<string, string>> = { da: {}, no: {} };
for (const lang of Object.keys(routeTranslations) as SupportedRouteLanguage[]) {
  const translations = routeTranslations[lang];
  for (const [english, localized] of Object.entries(translations)) {
    reverseRouteTranslations[lang][localized] = english;
  }
}

const localizedRouteDomains: Record<string, SupportedRouteLanguage> = {
  'cbd.dk': 'da',
  'cbd.no': 'no',
};

function usesLocalizedRoutes(lang: string): lang is SupportedRouteLanguage {
  return lang === 'da' || lang === 'no';
}

function getEnglishPath(localizedPath: string, lang: SupportedRouteLanguage): string {
  const reverseMappings = reverseRouteTranslations[lang];
  const [pathPart, queryPart] = localizedPath.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const englishSegments = segments.map(segment => reverseMappings[segment] || segment);
  let englishPath = '/' + englishSegments.join('/');
  if (queryPart) englishPath += '?' + queryPart;
  return englishPath || '/';
}

function getLocalizedPath(englishPath: string, lang: SupportedRouteLanguage): string {
  const translations = routeTranslations[lang];
  const [pathPart, queryPart] = englishPath.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const translatedSegments = segments.map(segment => translations[segment] || segment);
  let translatedPath = '/' + translatedSegments.join('/');
  if (queryPart) translatedPath += '?' + queryPart;
  return translatedPath || '/';
}

function isLocalizedPath(path: string, lang: SupportedRouteLanguage): boolean {
  const reverseMappings = reverseRouteTranslations[lang];
  const [pathPart] = path.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  return segments.some(segment => reverseMappings[segment] !== undefined);
}

function hasTranslatableSegments(path: string, lang: SupportedRouteLanguage): boolean {
  const translations = routeTranslations[lang];
  const [pathPart] = path.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  return segments.some(segment => translations[segment] !== undefined);
}

// ============================================================================
// END ROUTE TRANSLATIONS
// ============================================================================

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
  'cbdportal.ch': 'de-CH',
  'localhost': 'en',
};

// Security headers applied to all routes
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-XSS-Protection': '1; mode=block',
};

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
  const { pathname, searchParams } = request.nextUrl;

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

  // Check for language override in URL query parameter (highest priority for testing)
  const urlLang = searchParams.get('lang');
  if (urlLang) {
    language = urlLang;
  }

  // Check for language override in cookie (persisted preference) - but URL param takes precedence
  const cookieLang = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLang && !urlLang) {
    language = cookieLang;
  }

  // --- Localized Route Handling ---
  // Support testing localized routes via ?testdomain=cbd.dk (only on preview URLs)
  const testDomain = request.nextUrl.searchParams.get('testdomain');
  const effectiveHostname = (testDomain && (hostname.includes('vercel.app') || hostname === 'localhost')) 
    ? testDomain 
    : hostname;
  const domainLang = localizedRouteDomains[effectiveHostname];
  let rewriteUrl: URL | null = null;
  let shouldRedirect = false;
  let redirectUrl: URL | null = null;

  if (domainLang && usesLocalizedRoutes(domainLang)) {
    // Check if path is in localized format (e.g., /vaerktoejer/dosis-beregner)
    if (isLocalizedPath(pathname, domainLang)) {
      const englishPath = getEnglishPath(pathname, domainLang);
      
      if (englishPath !== pathname) {
        rewriteUrl = new URL(englishPath, request.url);
        rewriteUrl.search = request.nextUrl.search;
      }
    } else if (hasTranslatableSegments(pathname, domainLang)) {
      // English path on localized domain - redirect to localized version
      const localizedPath = getLocalizedPath(pathname, domainLang);
      
      if (localizedPath !== pathname) {
        redirectUrl = new URL(localizedPath, request.url);
        redirectUrl.search = request.nextUrl.search;
        redirectUrl.searchParams.delete('lang');
        shouldRedirect = true;
      }
    }
  }

  // Handle redirect for English paths on localized domains
  if (shouldRedirect && redirectUrl) {
    const redirectResponse = NextResponse.redirect(redirectUrl, 308);
    redirectResponse.cookies.set('NEXT_LOCALE', language, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    return redirectResponse;
  }

  // Create response with request headers modified
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-language', language);
  requestHeaders.set('x-hostname', hostname);
  requestHeaders.set('x-original-pathname', pathname);

  let response: NextResponse;

  if (rewriteUrl) {
    response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders },
    });
  } else {
    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Set cookie for persistence when ?lang= is used
  if (urlLang) {
    response.cookies.set('NEXT_LOCALE', language, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  response.headers.set('Content-Security-Policy', buildCSP());

  // Cache-Control and Vary headers for proper language handling
  response.headers.set('Vary', 'Cookie, Accept-Language');
  
  if (!pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
    if (urlLang) {
      response.headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
    } else {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    }
  }

  if (pathname.startsWith('/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  if (pathname.startsWith('/api')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
