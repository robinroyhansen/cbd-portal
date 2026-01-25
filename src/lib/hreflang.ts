/**
 * Hreflang tag generation for international SEO
 *
 * This module generates proper hreflang link tags for all language versions
 * of each page, which is critical for Google to understand language relationships.
 */

export interface HreflangLink {
  hrefLang: string;
  href: string;
}

// Domain configuration for all language versions
export const LANGUAGE_DOMAINS: Record<string, string> = {
  en: 'cbdportal.com',
  da: 'cbd.dk',
  sv: 'cbd.se',
  no: 'cbd.no',
  fi: 'cbd.fi',
  de: 'cbd.de',
  nl: 'cbdportaal.nl',
  fr: 'cbdportail.fr',
  it: 'cbd.it',
  pt: 'cbd.pt',
  ro: 'cbdportal.ro',
  es: 'cbdportal.es',
  'de-CH': 'cbdportal.ch',
  'fr-CH': 'cbdportal.ch',
  'it-CH': 'cbdportal.ch',
};

// For Swiss domain, we need to include language parameter or path
// since it serves multiple languages on one domain
const SWISS_LANGUAGES = ['de-CH', 'fr-CH', 'it-CH'];

/**
 * Generate hreflang links for a given page path
 *
 * @param pathname - The page path (e.g., '/conditions/anxiety')
 * @param includedLanguages - Optional array of language codes to include (defaults to all)
 * @returns Array of hreflang link objects
 */
export function generateHreflangLinks(
  pathname: string,
  includedLanguages?: string[]
): HreflangLink[] {
  const languages = includedLanguages || Object.keys(LANGUAGE_DOMAINS);
  const links: HreflangLink[] = [];

  // Clean pathname (remove leading/trailing slashes for consistency)
  const cleanPath = pathname === '/' ? '' : pathname;

  for (const lang of languages) {
    const domain = LANGUAGE_DOMAINS[lang];
    if (!domain) continue;

    // For Swiss languages, we might need special handling
    // For now, all Swiss languages point to cbdportal.ch
    // The site will detect browser language or use cookies
    let href = `https://${domain}${cleanPath}`;

    // For Swiss variants, add language hint for clarity
    // (in production, this could be a path prefix or subdomain)
    if (SWISS_LANGUAGES.includes(lang)) {
      // Keep URL clean - Swiss domain handles language detection
      href = `https://${domain}${cleanPath}`;
    }

    links.push({
      hrefLang: lang,
      href,
    });
  }

  // Add x-default (fallback for unmatched languages)
  // Points to the English version
  links.push({
    hrefLang: 'x-default',
    href: `https://${LANGUAGE_DOMAINS.en}${cleanPath}`,
  });

  return links;
}

/**
 * Generate hreflang link elements as HTML strings
 * Useful for injecting into <head>
 */
export function generateHreflangHTML(pathname: string): string {
  const links = generateHreflangLinks(pathname);
  return links
    .map(link => `<link rel="alternate" hreflang="${link.hrefLang}" href="${link.href}" />`)
    .join('\n');
}

/**
 * Generate hreflang metadata for Next.js
 * Returns an object suitable for Next.js metadata.alternates
 */
export function generateHreflangMetadata(pathname: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const links = generateHreflangLinks(pathname);
  const languages: Record<string, string> = {};

  for (const link of links) {
    if (link.hrefLang !== 'x-default') {
      languages[link.hrefLang] = link.href;
    }
  }

  return {
    canonical: pathname,
    languages,
  };
}

/**
 * Get the domain for a specific language code
 */
export function getDomainForLanguage(langCode: string): string {
  return LANGUAGE_DOMAINS[langCode] || LANGUAGE_DOMAINS.en;
}

/**
 * Build a full URL for a specific language version of a page
 */
export function buildLanguageUrl(pathname: string, langCode: string): string {
  const domain = getDomainForLanguage(langCode);
  const cleanPath = pathname === '/' ? '' : pathname;
  return `https://${domain}${cleanPath}`;
}

/**
 * Get all supported language codes
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(LANGUAGE_DOMAINS);
}

/**
 * Check if a language code is supported
 */
export function isLanguageSupported(langCode: string): boolean {
  return langCode in LANGUAGE_DOMAINS;
}
