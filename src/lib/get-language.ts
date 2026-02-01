import { headers, cookies } from 'next/headers';
import type { LanguageCode } from './translation-service';

// Domain to language mapping
const domainToLanguage: Record<string, LanguageCode> = {
  'cbdportal.com': 'en',
  'cbd-portal.vercel.app': 'en',
  'localhost': 'en',
  'cbd.dk': 'da',
  'cbd.se': 'sv',
  'cbd.no': 'no',
  'cbd.fi': 'fi',
  'cbd.de': 'de',
  'cbd.it': 'it',
  'cbdportaal.nl': 'nl',
  'cbdportail.fr': 'fr',
};

/**
 * Get the current language from headers, cookies, or hostname
 * For use in Server Components
 * 
 * Priority order:
 * 1. x-language header (set by middleware from URL path/domain detection)
 * 2. NEXT_LOCALE cookie (persisted user preference, used as fallback)
 * 3. Hostname-based detection (final fallback)
 */
export async function getLanguage(): Promise<LanguageCode> {
  const headersList = await headers();
  
  // First check x-language header (set by middleware based on URL path/domain)
  // This is the authoritative source for the current request's language
  const langHeader = headersList.get('x-language');
  if (langHeader) {
    return langHeader as LanguageCode;
  }

  // Check language cookie as secondary fallback (persisted preference)
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  if (localeCookie) {
    return localeCookie as LanguageCode;
  }

  // Fall back to hostname-based detection
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || 'localhost';
  const hostname = host.split(':')[0];
  return domainToLanguage[hostname] || 'en';
}

/**
 * Get the current hostname from request headers
 * For use in Server Components
 */
export async function getHostname(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-hostname') || 'localhost';
}

/**
 * Check if the current request is for a non-English language
 */
export async function isTranslatedRequest(): Promise<boolean> {
  const lang = await getLanguage();
  return lang !== 'en';
}

/**
 * Get language-specific metadata for SEO
 */
export async function getLanguageMetadata() {
  const lang = await getLanguage();
  const hostname = await getHostname();

  return {
    language: lang,
    hostname,
    hrefLang: lang.replace('-', '_'), // Convert de-CH to de_CH for hreflang
    isRTL: false, // None of our supported languages are RTL
  };
}
