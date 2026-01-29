/**
 * Server-side utility for building localized hrefs
 * Use this in server components that need to preserve language parameter
 */

/**
 * Get the localized slug for a condition or glossary term.
 * Returns the translated_slug if available, otherwise falls back to the English slug.
 */
export function getLocalizedSlug(item: { slug: string; translated_slug?: string | null }): string {
  return item.translated_slug || item.slug;
}

/**
 * Build a localized href by adding ?lang= parameter if not English
 * @param href - The base href (e.g., '/conditions')
 * @param lang - The language code (e.g., 'da', 'en')
 * @returns The localized href (e.g., '/conditions?lang=da')
 */
export function buildLocalizedHref(href: string, lang?: string): string {
  // Skip if English or no lang
  if (!lang || lang === 'en') return href;

  // Skip external links
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
    return href;
  }

  // Skip hash-only links
  if (href.startsWith('#')) return href;

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
 */
export function createLocalizedHref(lang?: string) {
  return (href: string) => buildLocalizedHref(href, lang);
}
