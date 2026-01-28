'use client';

import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { ComponentProps } from 'react';

type LocaleLinkProps = ComponentProps<typeof Link>;

/**
 * A wrapper around Next.js Link that automatically preserves the ?lang= parameter
 * for internal navigation. This ensures users stay in their selected language
 * when navigating between pages.
 *
 * @example
 * // Instead of:
 * <Link href="/conditions">Conditions</Link>
 *
 * // Use:
 * <LocaleLink href="/conditions">Conditions</LocaleLink>
 *
 * // On /page?lang=da, this will navigate to /conditions?lang=da
 */
export function LocaleLink({ href, children, ...props }: LocaleLinkProps) {
  const { lang: currentLang } = useLocale();
  // Only add lang param if not English (default)
  const lang = currentLang !== 'en' ? currentLang : null;

  // Only modify internal links (starting with /)
  // Don't modify external links, hash links, or links that already have lang param
  const modifiedHref = (() => {
    if (!lang) return href;

    // Handle string hrefs
    if (typeof href === 'string') {
      // Skip external links
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
        return href;
      }
      // Skip hash-only links
      if (href.startsWith('#')) {
        return href;
      }
      // Skip if lang param already exists
      if (href.includes('lang=')) {
        return href;
      }
      // Add lang parameter
      const separator = href.includes('?') ? '&' : '?';
      return `${href}${separator}lang=${lang}`;
    }

    // Handle URL objects
    if (typeof href === 'object' && href !== null) {
      const url = { ...href };
      if (url.pathname && !url.pathname.startsWith('http')) {
        // Merge lang into query
        url.query = {
          ...(typeof url.query === 'object' ? url.query : {}),
          lang,
        };
      }
      return url;
    }

    return href;
  })();

  return (
    <Link href={modifiedHref} {...props}>
      {children}
    </Link>
  );
}

/**
 * Hook to get a localized href string
 * Useful when you need the URL string rather than a component
 *
 * @example
 * const getLocalizedHref = useLocalizedHref();
 * const conditionsUrl = getLocalizedHref('/conditions');
 */
export function useLocalizedHref() {
  const { lang: currentLang } = useLocale();
  const lang = currentLang !== 'en' ? currentLang : null;

  return (href: string): string => {
    if (!lang) return href;
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
      return href;
    }
    if (href.startsWith('#')) return href;
    if (href.includes('lang=')) return href;

    const separator = href.includes('?') ? '&' : '?';
    return `${href}${separator}lang=${lang}`;
  };
}

export default LocaleLink;
