'use client';

import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { ComponentProps, useMemo } from 'react';
import {
  getLocalizedPath,
  usesLocalizedRoutes,
  localizedRouteDomains,
} from '@/lib/route-translations';

type LocaleLinkProps = ComponentProps<typeof Link>;

/**
 * A wrapper around Next.js Link that automatically handles localization:
 * - For DA/NO: Translates route segments (e.g., /tools → /vaerktoejer)
 * - For other languages: Preserves the ?lang= parameter
 *
 * @example
 * // Instead of:
 * <Link href="/conditions">Conditions</Link>
 *
 * // Use:
 * <LocaleLink href="/conditions">Conditions</LocaleLink>
 *
 * // On cbd.dk (Danish domain):
 * //   This renders as <a href="/tilstande">Conditions</a>
 *
 * // On any domain with ?lang=da:
 * //   This renders as <a href="/tilstande">Conditions</a>
 *
 * // On English domain:
 * //   This renders as <a href="/conditions">Conditions</a>
 */
export function LocaleLink({ href, children, ...props }: LocaleLinkProps) {
  const { lang: currentLang } = useLocale();

  const modifiedHref = useMemo(() => {
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

      // For DA and NO, translate route segments
      if (usesLocalizedRoutes(currentLang)) {
        // Skip if this already has a lang param (user forcing a specific language)
        if (href.includes('lang=')) {
          return href;
        }
        return getLocalizedPath(href, currentLang);
      }

      // For other non-English languages, add ?lang= parameter
      if (currentLang !== 'en') {
        // Skip if lang param already exists
        if (href.includes('lang=')) {
          return href;
        }
        const separator = href.includes('?') ? '&' : '?';
        return `${href}${separator}lang=${currentLang}`;
      }

      // English - return as-is
      return href;
    }

    // Handle URL objects
    if (typeof href === 'object' && href !== null) {
      const url = { ...href };

      if (url.pathname && !url.pathname.startsWith('http')) {
        // For DA/NO, translate the pathname
        if (usesLocalizedRoutes(currentLang)) {
          url.pathname = getLocalizedPath(url.pathname, currentLang);
        } else if (currentLang !== 'en') {
          // For other languages, add lang to query
          url.query = {
            ...(typeof url.query === 'object' ? url.query : {}),
            lang: currentLang,
          };
        }
      }

      return url;
    }

    return href;
  }, [href, currentLang]);

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
 * // On cbd.dk: '/tilstande'
 * // On cbd.no: '/tilstander'
 * // On English domain with ?lang=sv: '/conditions?lang=sv'
 */
export function useLocalizedHref() {
  const { lang: currentLang } = useLocale();

  return (href: string): string => {
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
      return href;
    }
    if (href.startsWith('#')) return href;

    // For DA/NO, translate route segments
    if (usesLocalizedRoutes(currentLang)) {
      if (href.includes('lang=')) return href;
      return getLocalizedPath(href, currentLang);
    }

    // For other non-English languages, add ?lang= parameter
    if (currentLang !== 'en') {
      if (href.includes('lang=')) return href;
      const separator = href.includes('?') ? '&' : '?';
      return `${href}${separator}lang=${currentLang}`;
    }

    return href;
  };
}

/**
 * Get the current domain language for route translation
 * Returns the language if on a localized domain, undefined otherwise
 */
export function useLocalizedDomain(): string | undefined {
  // This would need to be passed from the server in a real implementation
  // For now, we rely on the LocaleProvider's lang value
  const { lang } = useLocale();
  return usesLocalizedRoutes(lang) ? lang : undefined;
}

export default LocaleLink;
