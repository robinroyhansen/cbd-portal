'use client';

import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { type LocaleStrings, enLocale, getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

interface LocaleContextValue {
  locale: LocaleStrings;
  lang: LanguageCode;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
  locale?: LocaleStrings;
  lang?: LanguageCode;
}

/**
 * Provider component for locale context
 *
 * IMPORTANT: This component handles language detection with these priorities:
 * 1. Server-provided lang (from layout.tsx via getLanguage())
 * 2. URL ?lang= parameter (checked on client-side navigation)
 *
 * The server-provided values are the source of truth for initial render,
 * since the middleware sets x-language header and NEXT_LOCALE cookie.
 */
export function LocaleProvider({
  children,
  locale: serverLocale = enLocale,
  lang: serverLang = 'en',
}: LocaleProviderProps) {
  const searchParams = useSearchParams();

  // ALWAYS initialize with server-provided values for consistent SSR/hydration
  // The server already detected ?lang= via middleware and getLanguage()
  const [activeLang, setActiveLang] = useState<LanguageCode>(serverLang);
  const [activeLocale, setActiveLocale] = useState<LocaleStrings>(serverLocale);

  // Effect to sync with URL param on client-side navigation (after initial mount)
  // This handles cases where user navigates to a different ?lang= without full page reload
  useEffect(() => {
    const urlLang = searchParams.get('lang') as LanguageCode | null;

    if (urlLang && urlLang !== activeLang) {
      // URL has a lang param that differs from current state
      setActiveLang(urlLang);
      setActiveLocale(getLocaleSync(urlLang));
    }
    // Note: We don't reset to serverLang when urlLang is removed,
    // because that would cause issues with client-side navigation
  }, [searchParams, activeLang]);

  // Also sync if serverLang changes (e.g., from layout re-render)
  useEffect(() => {
    // Only sync if there's no URL override
    const urlLang = searchParams.get('lang') as LanguageCode | null;
    if (!urlLang && serverLang !== activeLang) {
      setActiveLang(serverLang);
      setActiveLocale(serverLocale);
    }
  }, [serverLang, serverLocale, searchParams, activeLang]);

  const value = useMemo(() => ({
    locale: activeLocale,
    lang: activeLang,
    t: createTranslator(activeLocale),
  }), [activeLocale, activeLang]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Hook to access translations in components
 *
 * @example
 * const { t, lang } = useLocale();
 * return <h1>{t('hero.title')}</h1>;
 */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);

  if (!context) {
    // Return a default context if not wrapped in provider
    // This allows components to work without explicit provider
    return {
      locale: enLocale,
      lang: 'en',
      t: createTranslator(enLocale),
    };
  }

  return context;
}

/**
 * Hook to get a translation function only
 * More convenient when you just need translations
 *
 * @example
 * const t = useTranslations();
 * return <button>{t('common.search')}</button>;
 */
export function useTranslations() {
  const { t } = useLocale();
  return t;
}

/**
 * Hook to get the current language code
 *
 * @example
 * const lang = useLanguage();
 * // lang = 'da' on cbd.dk, 'sv' on cbd.se, etc.
 */
export function useLanguage(): LanguageCode {
  const { lang } = useLocale();
  return lang;
}

/**
 * Component for translating text with JSX support
 *
 * @example
 * <T id="hero.subtitle" />
 * <T id="conditions.studiesCount" count={312} />
 */
export function T({
  id,
  ...params
}: {
  id: string;
} & Record<string, string | number>) {
  const { t } = useLocale();
  return <>{t(id, params)}</>;
}
