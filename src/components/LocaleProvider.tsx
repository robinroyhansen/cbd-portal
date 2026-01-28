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
 * Automatically detects ?lang= parameter and overrides server-provided language
 */
export function LocaleProvider({
  children,
  locale: serverLocale = enLocale,
  lang: serverLang = 'en',
}: LocaleProviderProps) {
  const searchParams = useSearchParams();
  const urlLang = searchParams.get('lang') as LanguageCode | null;

  // Initialize with URL lang if present to avoid hydration flash
  const initialLang = urlLang || serverLang;
  const initialLocale = urlLang ? getLocaleSync(urlLang) : serverLocale;

  const [activeLang, setActiveLang] = useState<LanguageCode>(initialLang);
  const [activeLocale, setActiveLocale] = useState<LocaleStrings>(initialLocale);

  useEffect(() => {
    if (urlLang && urlLang !== activeLang) {
      setActiveLang(urlLang);
      setActiveLocale(getLocaleSync(urlLang));
    } else if (!urlLang && serverLang !== activeLang) {
      setActiveLang(serverLang);
      setActiveLocale(serverLocale);
    }
  }, [urlLang, serverLang, serverLocale, activeLang]);

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
