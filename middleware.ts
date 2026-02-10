import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================================
// INLINED ROUTE TRANSLATIONS (to avoid import issues in middleware)
// ============================================================================

type SupportedRouteLanguage = 'da' | 'no' | 'de' | 'sv' | 'fi';

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
    'tags': 'tags',
    'topics': 'emner',
    'dosage-calculator': 'dosis-beregner',
    'animal-dosage-calculator': 'dyre-dosis-beregner',
    'cost-calculator': 'pris-beregner',
    'strength-calculator': 'styrke-beregner',
    'interactions': 'interaktioner',
    'product-finder': 'produkt-finder',
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
    'methodology': 'metodik',
    'study': 'studie',
    'category': 'kategori',
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
    'tags': 'tags',
    'topics': 'emner',
    'dosage-calculator': 'dose-kalkulator',
    'animal-dosage-calculator': 'dyre-dose-kalkulator',
    'cost-calculator': 'pris-kalkulator',
    'strength-calculator': 'styrke-kalkulator',
    'interactions': 'interaksjoner',
    'product-finder': 'produkt-finner',
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
    'methodology': 'metodikk',
    'study': 'studie',
    'category': 'kategori',
  },
  de: {
    'tools': 'werkzeuge',
    'conditions': 'erkrankungen',
    'articles': 'artikel',
    'glossary': 'glossar',
    'research': 'forschung',
    'about': 'ueber-uns',
    'contact': 'kontakt',
    'pets': 'haustiere',
    'reviews': 'bewertungen',
    'categories': 'kategorien',
    'authors': 'autoren',
    'search': 'suche',
    'dosage-calculator': 'dosierungsrechner',
    'animal-dosage-calculator': 'tier-dosierungsrechner',
    'cost-calculator': 'kostenrechner',
    'strength-calculator': 'staerkerechner',
    'interactions': 'wechselwirkungen',
    'dogs': 'hunde',
    'cats': 'katzen',
    'horses': 'pferde',
    'small-pets': 'kleintiere',
    'birds': 'voegel',
    'medical-disclaimer': 'medizinischer-haftungsausschluss',
    'editorial-policy': 'redaktionelle-richtlinien',
    'privacy-policy': 'datenschutzrichtlinie',
    'terms-of-service': 'nutzungsbedingungen',
    'cookie-policy': 'cookie-richtlinie',
    'topics': 'themen',
    'methodology': 'methodik',
  },
  sv: {
    'tools': 'verktyg',
    'conditions': 'tillstand',
    'articles': 'artiklar',
    'glossary': 'ordlista',
    'research': 'forskning',
    'about': 'om-oss',
    'contact': 'kontakt',
    'pets': 'husdjur',
    'reviews': 'recensioner',
    'categories': 'kategorier',
    'authors': 'forfattare',
    'search': 'sok',
    'tags': 'taggar',
    'topics': 'amnen',
    'dosage-calculator': 'doserings-kalkylator',
    'animal-dosage-calculator': 'djur-doserings-kalkylator',
    'cost-calculator': 'kostnads-kalkylator',
    'strength-calculator': 'styrke-kalkylator',
    'interactions': 'interaktioner',
    'product-finder': 'produkt-sokning',
    'dogs': 'hundar',
    'cats': 'katter',
    'horses': 'hastar',
    'small-pets': 'smadjur',
    'birds': 'faglar',
    'medical-disclaimer': 'medicinskt-ansvarsfriskrivning',
    'editorial-policy': 'redaktionell-policy',
    'privacy-policy': 'integritetspolicy',
    'terms-of-service': 'anvandningsvillkor',
    'cookie-policy': 'cookie-policy',
    'methodology': 'metodik',
    'study': 'studie',
    'category': 'kategori',
  },
  fi: {
    'tools': 'tyokalut',
    'conditions': 'sairaudet',
    'articles': 'artikkelit',
    'glossary': 'sanasto',
    'research': 'tutkimus',
    'about': 'tietoja',
    'contact': 'yhteystiedot',
    'pets': 'lemmikit',
    'reviews': 'arvostelut',
    'categories': 'kategoriat',
    'authors': 'kirjoittajat',
    'search': 'haku',
    'tags': 'tunnisteet',
    'topics': 'aiheet',
    'dosage-calculator': 'annostus-laskuri',
    'animal-dosage-calculator': 'elain-annostus-laskuri',
    'cost-calculator': 'hinta-laskuri',
    'strength-calculator': 'vahvuus-laskuri',
    'interactions': 'yhteisvaikutukset',
    'product-finder': 'tuotehaku',
    'dogs': 'koirat',
    'cats': 'kissat',
    'horses': 'hevoset',
    'small-pets': 'pikkulemmikit',
    'birds': 'linnut',
    'medical-disclaimer': 'laaketieteen-vastuuvapautuslauseke',
    'editorial-policy': 'toimituskasitanto',
    'privacy-policy': 'tietosuojakasitanto',
    'terms-of-service': 'kayttoehdot',
    'cookie-policy': 'evastekasitanto',
    'methodology': 'menetelmat',
    'study': 'tutkimus',
    'category': 'kategoria',
  },
};

// Create reverse mappings
const reverseRouteTranslations: Record<SupportedRouteLanguage, Record<string, string>> = { da: {}, no: {}, de: {}, sv: {}, fi: {} };
for (const lang of Object.keys(routeTranslations) as SupportedRouteLanguage[]) {
  const translations = routeTranslations[lang];
  for (const [english, localized] of Object.entries(translations)) {
    reverseRouteTranslations[lang][localized] = english;
  }
}

const localizedRouteDomains: Record<string, SupportedRouteLanguage> = {
  'cbd.dk': 'da',
  'cbd.no': 'no',
  'cbd.de': 'de',
  'cbd.se': 'sv',
  'cbd.fi': 'fi',
};

function usesLocalizedRoutes(lang: string): lang is SupportedRouteLanguage {
  return lang === 'da' || lang === 'no' || lang === 'de' || lang === 'sv' || lang === 'fi';
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

// Detect language from a localized path by checking which language's translations match
function detectLanguageFromPath(path: string): SupportedRouteLanguage | null {
  const [pathPart] = path.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  
  for (const lang of Object.keys(reverseRouteTranslations) as SupportedRouteLanguage[]) {
    const reverseMappings = reverseRouteTranslations[lang];
    // Check if any segment matches this language's localized routes
    if (segments.some(segment => reverseMappings[segment] !== undefined)) {
      return lang;
    }
  }
  return null;
}

// Known English route segments (the keys in routeTranslations)
const englishRouteSegments = new Set([
  'tools', 'conditions', 'articles', 'glossary', 'research', 'about', 'contact',
  'pets', 'reviews', 'categories', 'authors', 'search', 'tags', 'topics',
  'dosage-calculator', 'animal-dosage-calculator', 'cost-calculator', 'strength-calculator',
  'interactions', 'product-finder', 'dogs', 'cats', 'horses', 'small-pets', 'birds',
  'medical-disclaimer', 'editorial-policy', 'privacy-policy', 'terms-of-service',
  'cookie-policy', 'methodology', 'study', 'category',
]);

// Detect if a path explicitly uses English route segments
function isEnglishPath(path: string): boolean {
  const [pathPart] = path.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  // Check if the first segment is a known English route
  return segments.length > 0 && englishRouteSegments.has(segments[0]);
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
  
  // Support testdomain param early for language detection too
  const testDomainEarly = request.nextUrl.searchParams.get('testdomain');
  const effectiveHostnameForLang = (testDomainEarly && (hostname.includes('vercel.app') || hostname === 'localhost')) 
    ? testDomainEarly 
    : hostname;
  const detectedLanguage = domainToLanguage[effectiveHostnameForLang] || 'en';

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

  // --- Localized Route Handling ---
  // Support testing localized routes via ?testdomain=cbd.dk (only on preview URLs)
  // Also support localized routes when ?lang= parameter is set to a localized language
  // AND detect language automatically from localized paths (e.g., /tilstande/epilepsi → Danish)
  const testDomain = request.nextUrl.searchParams.get('testdomain');
  const effectiveHostname = (testDomain && (hostname.includes('vercel.app') || hostname === 'localhost')) 
    ? testDomain 
    : hostname;
  const domainLang = localizedRouteDomains[effectiveHostname];
  
  // Also check if lang parameter indicates a language with localized routes
  const langParam = searchParams.get('lang');
  const langParamLang = langParam && usesLocalizedRoutes(langParam as SupportedRouteLanguage) ? langParam as SupportedRouteLanguage : null;
  
  // Auto-detect language from localized path segments (e.g., /tilstande/ → Danish)
  const pathDetectedLang = detectLanguageFromPath(pathname);
  
  // Check if path explicitly uses English route segments (e.g., /conditions, /glossary)
  const pathIsEnglish = isEnglishPath(pathname);
  
  // Use domain-based lang, lang parameter, or fall back to auto-detected from path
  const routeLang = domainLang || langParamLang || pathDetectedLang;
  
  // Check for language override in cookie (persisted preference)
  // BUT: Don't let cookie override when URL path explicitly indicates a language
  // - If path is localized (e.g., /tilstande) → use that language
  // - If path is English (e.g., /conditions) → use English
  // - Only use cookie when path is ambiguous (e.g., /, /some-slug)
  const cookieLang = request.cookies.get('NEXT_LOCALE')?.value;
  if (!urlLang && !domainLang) {
    if (pathDetectedLang) {
      // Path is in a localized format - use that language
      language = pathDetectedLang;
    } else if (pathIsEnglish) {
      // Path explicitly uses English route segments - use English
      language = 'en';
    } else if (cookieLang) {
      // Path is ambiguous (homepage, slug-only paths) - use cookie preference
      language = cookieLang;
    }
  } else if (pathDetectedLang && !domainLang && !langParamLang && !urlLang) {
    // Legacy fallback: If language was auto-detected from path
    language = pathDetectedLang;
  }
  
  let rewriteUrl: URL | null = null;
  let shouldRedirect = false;
  let redirectUrl: URL | null = null;

  if (routeLang && usesLocalizedRoutes(routeLang)) {
    // Check if path is in localized format (e.g., /vaerktoejer/dosis-beregner)
    if (isLocalizedPath(pathname, routeLang)) {
      const englishPath = getEnglishPath(pathname, routeLang);
      
      if (englishPath !== pathname) {
        rewriteUrl = new URL(englishPath, request.url);
        rewriteUrl.search = request.nextUrl.search;
      }
    } else if (domainLang && hasTranslatableSegments(pathname, routeLang)) {
      // English path on localized domain - redirect to localized version (only for actual domains, not ?lang=)
      const localizedPath = getLocalizedPath(pathname, routeLang);
      
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

  // Set cookie for persistence when ?lang= is used or when language is auto-detected from path
  if (urlLang || (pathDetectedLang && !cookieLang)) {
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
