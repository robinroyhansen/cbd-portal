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

import { LANGUAGE_DOMAINS, generateHreflangLinks } from '@/lib/hreflang';

export interface HreflangAlternates {
  canonical: string;
  languages: Record<string, string>;
}

/**
 * Generate alternates object for Next.js Metadata
 * This is the recommended way to add hreflang in Next.js 14
 *
 * Uses localized paths for DA/NO/DE domains (e.g., /kaeledyr instead of /pets)
 *
 * @param pathname - The page path in English (e.g., '/pets/dogs')
 * @param canonicalDomain - Optional canonical domain (defaults to English)
 * @returns Alternates object for Next.js metadata
 */
export function getHreflangAlternates(
  pathname: string,
  canonicalDomain?: string
): HreflangAlternates {
  const cleanPath = pathname === '/' ? '' : pathname;
  const languages: Record<string, string> = {};

  // Use the proper hreflang generator that handles localized paths
  const links = generateHreflangLinks(pathname);
  
  for (const link of links) {
    languages[link.hrefLang] = link.href;
  }

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
 * Uses localized paths for DA/NO/DE domains
 */
export function getHreflangLinks(pathname: string): Array<{
  rel: string;
  hrefLang: string;
  href: string;
}> {
  // Use the proper generator that handles localized paths
  const hreflangLinks = generateHreflangLinks(pathname);
  
  return hreflangLinks.map(link => ({
    rel: 'alternate',
    hrefLang: link.hrefLang,
    href: link.href,
  }));
}
