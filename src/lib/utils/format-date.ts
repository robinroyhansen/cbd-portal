/**
 * Format date for the current locale
 */
export function formatDateForLocale(
  date: Date | string,
  lang: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = lang === 'da' ? 'da-DK' : lang === 'sv' ? 'sv-SE' : lang === 'no' ? 'nb-NO' : lang === 'de' ? 'de-DE' : lang === 'nl' ? 'nl-NL' : lang === 'fi' ? 'fi-FI' : lang === 'fr' ? 'fr-FR' : lang === 'it' ? 'it-IT' : 'en-GB';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  };

  return d.toLocaleDateString(locale, options || defaultOptions);
}

export function formatDateLong(date: Date | string, lang: string): string {
  return formatDateForLocale(date, lang, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
