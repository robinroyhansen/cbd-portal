import { headers } from 'next/headers';
import type { LanguageCode } from './translation-service';

/**
 * Get the current language from request headers (set by middleware)
 * For use in Server Components
 */
export async function getLanguage(): Promise<LanguageCode> {
  const headersList = await headers();
  const language = headersList.get('x-language') || 'en';
  return language as LanguageCode;
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
