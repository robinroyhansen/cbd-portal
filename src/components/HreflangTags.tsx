/**
 * HreflangTags - Server component that generates hreflang link tags
 *
 * Usage in any page:
 *
 * export async function generateMetadata(): Promise<Metadata> {
 *   return {
 *     ...
 *     alternates: getHreflangAlternates('/conditions/anxiety'),
 *   };
 * }
 */

import { LANGUAGE_DOMAINS } from '@/lib/hreflang';

export interface HreflangAlternates {
  canonical: string;
  languages: Record<string, string>;
}

/**
 * Generate alternates object for Next.js Metadata
 * This is the recommended way to add hreflang in Next.js 14
 *
 * @param pathname - The page path (e.g., '/conditions/anxiety')
 * @param canonicalDomain - Optional canonical domain (defaults to English)
 * @returns Alternates object for Next.js metadata
 */
export function getHreflangAlternates(
  pathname: string,
  canonicalDomain?: string
): HreflangAlternates {
  const cleanPath = pathname === '/' ? '' : pathname;
  const languages: Record<string, string> = {};

  // Add all language versions
  for (const [lang, domain] of Object.entries(LANGUAGE_DOMAINS)) {
    languages[lang] = `https://${domain}${cleanPath}`;
  }

  // Add x-default pointing to English
  languages['x-default'] = `https://${LANGUAGE_DOMAINS.en}${cleanPath}`;

  return {
    canonical: canonicalDomain
      ? `https://${canonicalDomain}${cleanPath}`
      : cleanPath || '/',
    languages,
  };
}

/**
 * Generate raw link elements as an array
 * Useful if you need to manually inject into head
 */
export function getHreflangLinks(pathname: string): Array<{
  rel: string;
  hrefLang: string;
  href: string;
}> {
  const cleanPath = pathname === '/' ? '' : pathname;
  const links: Array<{ rel: string; hrefLang: string; href: string }> = [];

  // Add all language versions
  for (const [lang, domain] of Object.entries(LANGUAGE_DOMAINS)) {
    links.push({
      rel: 'alternate',
      hrefLang: lang,
      href: `https://${domain}${cleanPath}`,
    });
  }

  // Add x-default
  links.push({
    rel: 'alternate',
    hrefLang: 'x-default',
    href: `https://${LANGUAGE_DOMAINS.en}${cleanPath}`,
  });

  return links;
}
