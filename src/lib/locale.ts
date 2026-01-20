/**
 * Centralized locale utilities for international formatting
 * Default locale is 'en-GB' for international audience (day-month-year format)
 */

// Default to international English (en-GB uses day-month-year, metric-friendly)
export const DEFAULT_LOCALE = 'en-GB';

/**
 * Format a date for display
 * Uses international format by default (day month year)
 */
export function formatDate(
  date: Date | string | null | undefined,
  options?: {
    locale?: string;
    format?: 'long' | 'medium' | 'short';
  }
): string {
  if (!date) return '';

  const locale = options?.locale || DEFAULT_LOCALE;
  const format = options?.format || 'long';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const formatOptions: Intl.DateTimeFormatOptions = {
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
  }[format];

  return dateObj.toLocaleDateString(locale, formatOptions);
}

/**
 * Format a date with time
 */
export function formatDateTime(
  date: Date | string | null | undefined,
  options?: {
    locale?: string;
    includeSeconds?: boolean;
  }
): string {
  if (!date) return '';

  const locale = options?.locale || DEFAULT_LOCALE;
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  return dateObj.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(options?.includeSeconds ? { second: '2-digit' } : {}),
  });
}

/**
 * Format a number with locale-appropriate separators
 */
export function formatNumber(
  num: number | null | undefined,
  options?: {
    locale?: string;
    decimals?: number;
    compact?: boolean;
  }
): string {
  if (num === null || num === undefined) return '';

  const locale = options?.locale || DEFAULT_LOCALE;

  if (options?.compact) {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: options?.decimals ?? 0,
    maximumFractionDigits: options?.decimals ?? 0,
  }).format(num);
}

/**
 * Format a percentage
 */
export function formatPercent(
  num: number | null | undefined,
  options?: {
    locale?: string;
    decimals?: number;
  }
): string {
  if (num === null || num === undefined) return '';

  const locale = options?.locale || DEFAULT_LOCALE;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: options?.decimals ?? 0,
    maximumFractionDigits: options?.decimals ?? 1,
  }).format(num / 100);
}

/**
 * Currency configuration for different regions
 */
export const CURRENCIES = {
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound', decimals: 2 },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro', decimals: 2 },
  USD: { symbol: '$', code: 'USD', name: 'US Dollar', decimals: 2 },
  CHF: { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc', decimals: 2 },
  CAD: { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar', decimals: 2 },
  AUD: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar', decimals: 2 },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

/**
 * Detect currency from browser locale (client-side only)
 */
export function detectCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'EUR'; // Default for SSR

  const locale = navigator.language || 'en-GB';
  const region = locale.split('-')[1]?.toUpperCase();

  const currencyMap: Record<string, CurrencyCode> = {
    'US': 'USD',
    'GB': 'GBP',
    'UK': 'GBP',
    'DE': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'NL': 'EUR',
    'AT': 'EUR',
    'BE': 'EUR',
    'IE': 'EUR',
    'PT': 'EUR',
    'CH': 'CHF',
    'CA': 'CAD',
    'AU': 'AUD',
  };

  return currencyMap[region] || 'EUR'; // Default to EUR for international
}

/**
 * Format currency value
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'EUR',
  options?: {
    locale?: string;
    showCode?: boolean;
  }
): string {
  const locale = options?.locale || DEFAULT_LOCALE;
  const currencyInfo = CURRENCIES[currency];

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  }).format(amount);

  return formatted;
}

/**
 * Weight unit preference - defaults to metric (kg) for international
 */
export type WeightUnit = 'kg' | 'lbs';

export function detectWeightUnit(): WeightUnit {
  if (typeof window === 'undefined') return 'kg'; // Default for SSR

  const locale = navigator.language || 'en-GB';
  const region = locale.split('-')[1]?.toUpperCase();

  // Only US uses pounds by default
  return region === 'US' ? 'lbs' : 'kg';
}

/**
 * Convert between weight units
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;
  if (from === 'lbs' && to === 'kg') return value * 0.453592;
  if (from === 'kg' && to === 'lbs') return value * 2.20462;
  return value;
}

/**
 * Format weight with unit
 */
export function formatWeight(
  value: number,
  unit: WeightUnit,
  options?: { decimals?: number }
): string {
  const decimals = options?.decimals ?? 1;
  return `${value.toFixed(decimals)} ${unit}`;
}
