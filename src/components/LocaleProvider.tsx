'use client';

import { createContext, useContext, useMemo, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { type LocaleStrings, enLocale, getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { setLanguageCookie, getLanguageCookie } from '@/lib/language-client';

interface LocaleContextValue {
  locale: LocaleStrings;
  lang: LanguageCode;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLanguage: (lang: LanguageCode) => void;
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
 * Language detection priority:
 * 1. URL ?lang= parameter (immediate effect)
 * 2. NEXT_LOCALE cookie (persistent storage)
 * 3. Server-provided lang (from domain detection)
 *
 * The setLanguage function allows components to change language,
 * which updates both the state AND sets the cookie for persistence.
 */
export function LocaleProvider({
  children,
  locale: serverLocale = enLocale,
  lang: serverLang = 'en',
}: LocaleProviderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Determine initial language from URL param, cookie, or server
  const getInitialLang = (): LanguageCode => {
    // Check URL param first (highest priority for testing)
    const urlLang = searchParams.get('lang') as LanguageCode | null;
    if (urlLang) return urlLang;

    // Check cookie (client-side only, but works for initial state)
    if (typeof window !== 'undefined') {
      const cookieLang = getLanguageCookie();
      if (cookieLang) return cookieLang as LanguageCode;
    }

    // Fall back to server-provided value
    return serverLang;
  };

  const [activeLang, setActiveLang] = useState<LanguageCode>(serverLang);
  const [activeLocale, setActiveLocale] = useState<LocaleStrings>(serverLocale);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language on mount (client-side only)
  useEffect(() => {
    if (isInitialized) return;

    const initialLang = getInitialLang();
    if (initialLang !== activeLang) {
      setActiveLang(initialLang);
      setActiveLocale(getLocaleSync(initialLang));
    }
    setIsInitialized(true);
  }, [isInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync with URL param when it changes (handles client-side navigation with ?lang=)
  useEffect(() => {
    if (!isInitialized) return;

    const urlLang = searchParams.get('lang') as LanguageCode | null;
    if (urlLang && urlLang !== activeLang) {
      setActiveLang(urlLang);
      setActiveLocale(getLocaleSync(urlLang));
      // Persist to cookie when URL param is used
      setLanguageCookie(urlLang);
    }
  }, [searchParams, isInitialized]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Change the current language
   * This updates both the React state AND sets a cookie for persistence
   * It also updates the URL to include ?lang= for consistency
   */
  const setLanguage = useCallback((newLang: LanguageCode) => {
    // Update state immediately
    setActiveLang(newLang);
    setActiveLocale(getLocaleSync(newLang));

    // Set cookie for persistence across page loads and server requests
    setLanguageCookie(newLang);

    // Update URL with ?lang= param (without full page reload)
    const params = new URLSearchParams(searchParams.toString());
    if (newLang === 'en') {
      params.delete('lang');
    } else {
      params.set('lang', newLang);
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    
    // Use router.replace to update URL without adding to history
    router.replace(newUrl, { scroll: false });
  }, [pathname, searchParams, router]);

  const value = useMemo(() => ({
    locale: activeLocale,
    lang: activeLang,
    t: createTranslator(activeLocale),
    setLanguage,
  }), [activeLocale, activeLang, setLanguage]);

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
 * const { t, lang, setLanguage } = useLocale();
 * return (
 *   <>
 *     <h1>{t('hero.title')}</h1>
 *     <button onClick={() => setLanguage('de')}>Deutsch</button>
 *   </>
 * );
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
      setLanguage: () => {
        console.warn('useLocale: setLanguage called outside LocaleProvider');
      },
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
