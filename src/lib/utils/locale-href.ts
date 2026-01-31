/**
 * Server-side utility for building localized hrefs
 * Use this in server components that need to preserve language parameter
 */

import {
  getLocalizedPath as translatePath,
  usesLocalizedRoutes,
  localizedRouteDomains,
} from '@/lib/route-translations';

/**
 * Get the localized slug for a condition or glossary term.
 * Returns the translated_slug if available, otherwise falls back to the English slug.
 */
export function getLocalizedSlug(item: { slug: string; translated_slug?: string | null }): string {
  return item.translated_slug || item.slug;
}

/**
 * Build a localized href by either:
 * 1. Translating route segments (for DA/NO domains)
 * 2. Adding ?lang= parameter (for other languages on English domain)
 *
 * @param href - The base href (e.g., '/conditions' or '/tools/dosage-calculator')
 * @param lang - The language code (e.g., 'da', 'no', 'en')
 * @param options - Additional options
 * @returns The localized href
 */
export function buildLocalizedHref(
  href: string,
  lang?: string,
  options: {
    /** Force using ?lang= param instead of translated routes */
    forceQueryParam?: boolean;
    /** The current hostname (used to determine if we're on a localized domain) */
    hostname?: string;
  } = {}
): string {
  const { forceQueryParam = false, hostname } = options;

  // Skip if no lang or English (default)
  if (!lang || lang === 'en') return href;

  // Skip external links
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
    return href;
  }

  // Skip hash-only links
  if (href.startsWith('#')) return href;

  // Check if we're on a domain that uses localized routes
  const domainLang = hostname ? localizedRouteDomains[hostname] : undefined;
  const isOnLocalizedDomain = domainLang && domainLang === lang;

  // If on a localized domain (cbd.dk, cbd.no), translate route segments
  if (!forceQueryParam && usesLocalizedRoutes(lang) && (isOnLocalizedDomain || !hostname)) {
    // Translate the path segments
    return translatePath(href, lang);
  }

  // Otherwise, add ?lang= parameter (for non-localized-route languages or testing)
  // Skip if lang param already exists
  if (href.includes('lang=')) return href;

  // Add lang parameter
  const separator = href.includes('?') ? '&' : '?';
  return `${href}${separator}lang=${lang}`;
}

/**
 * Create a helper function bound to a specific language
 * Useful for server components that need to build multiple links
 *
 * @example
 * const localizedHref = createLocalizedHref('da');
 * <Link href={localizedHref('/conditions')}>Conditions</Link>
 *
 * // On cbd.dk, this returns: '/tilstande'
 * // On other domains with ?lang=da, this returns: '/conditions?lang=da'
 */
export function createLocalizedHref(lang?: string, hostname?: string) {
  return (href: string) => buildLocalizedHref(href, lang, { hostname });
}

/**
 * Get the full localized URL including domain
 * Useful for sitemap generation and hreflang tags
 *
 * @param path - The English path (e.g., '/tools/dosage-calculator')
 * @param lang - The language code
 * @param baseDomain - The domain for this language
 */
export function getFullLocalizedUrl(path: string, lang: string, baseDomain: string): string {
  const localizedPath = usesLocalizedRoutes(lang) ? translatePath(path, lang) : path;
  return `https://${baseDomain}${localizedPath}`;
}
