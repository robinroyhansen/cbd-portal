import enLocale from './en.json';
import type { LanguageCode } from '@/lib/translation-service';

// Type for the locale structure
export type LocaleStrings = typeof enLocale;

// Type for nested key paths like 'nav.research' or 'hero.title'
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
    ? F
    : T extends [infer F, ...infer R]
      ? F extends string
        ? R extends string[]
          ? `${F}${D}${Join<R, D>}`
          : never
        : never
      : string;

export type LocaleKey = Join<PathsToStringProps<LocaleStrings>, '.'>;

// Cache for loaded locales
const localeCache: Partial<Record<LanguageCode, LocaleStrings>> = {
  en: enLocale,
};

/**
 * Load locale strings for a specific language
 * Falls back to English if the translation doesn't exist
 */
export async function loadLocale(lang: LanguageCode): Promise<LocaleStrings> {
  // Return cached version if available
  if (localeCache[lang]) {
    return localeCache[lang]!;
  }

  // Try to dynamically import the locale
  try {
    const locale = await import(`./${lang}.json`);
    localeCache[lang] = locale.default || locale;
    return localeCache[lang]!;
  } catch (error) {
    console.warn(`Locale ${lang} not found, falling back to English`);
    return enLocale;
  }
}

/**
 * Get locale strings synchronously (only works for already loaded locales)
 * Returns English as fallback
 */
export function getLocaleSync(lang: LanguageCode): LocaleStrings {
  return localeCache[lang] || enLocale;
}

/**
 * Get a specific translation by key path (e.g., 'nav.research')
 */
export function t(
  locale: LocaleStrings,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value: unknown = locale;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Key not found, return the key itself
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }

  // Replace template variables
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }

  return value;
}

/**
 * Create a translation function bound to a specific locale
 */
export function createTranslator(locale: LocaleStrings) {
  return (key: string, params?: Record<string, string | number>) => t(locale, key, params);
}

/**
 * Get all available locales that have been loaded/generated
 */
export function getAvailableLocales(): LanguageCode[] {
  // This will be updated as we generate locale files
  const available: LanguageCode[] = ['en'];

  // Check which locale files exist (at build time this is known)
  const possibleLocales: LanguageCode[] = ['da', 'sv', 'no', 'de', 'nl', 'fi', 'fr', 'it'];

  // In a real scenario, you'd check file existence
  // For now, return what we know exists
  return available;
}

/**
 * Merge partial translations with the English base
 * Useful when a translation is incomplete
 */
export function mergeWithBase(
  partial: Partial<LocaleStrings>,
  base: LocaleStrings = enLocale
): LocaleStrings {
  const merged = JSON.parse(JSON.stringify(base)) as LocaleStrings;

  function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
    for (const key in source) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) target[key] = {};
        deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>
        );
      } else if (source[key] !== undefined && source[key] !== '') {
        target[key] = source[key];
      }
    }
  }

  deepMerge(merged as unknown as Record<string, unknown>, partial as unknown as Record<string, unknown>);
  return merged;
}

// Re-export English as the default
export { enLocale };
export default enLocale;
