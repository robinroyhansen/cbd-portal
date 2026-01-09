/**
 * Get country flag emoji from ISO code
 * Uses regional indicator symbols to create flag emoji
 */
export function getCountryFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return '';

  // Convert ISO code to regional indicator symbols
  // A = 🇦 (U+1F1E6), B = 🇧 (U+1F1E7), etc.
  const upperCode = code.toUpperCase();
  const firstChar = 0x1F1E6 + (upperCode.charCodeAt(0) - 65);
  const secondChar = 0x1F1E6 + (upperCode.charCodeAt(1) - 65);

  return String.fromCodePoint(firstChar, secondChar);
}

/**
 * Get country name with flag emoji
 */
export function getCountryWithFlag(code: string | null | undefined): string {
  if (!code) return '';
  const flag = getCountryFlag(code);
  const name = getCountryName(code);
  return flag ? `${flag} ${name}` : name;
}

// ISO 3166-1 alpha-2 country codes with display names
export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'DK', name: 'Denmark' },
  { code: 'ES', name: 'Spain' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'IL', name: 'Israel' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
  { code: 'ZA', name: 'South Africa' },
] as const;

export type CountryCode = typeof COUNTRIES[number]['code'];

/**
 * Get country name from ISO code
 */
export function getCountryName(code: string | null | undefined): string {
  if (!code) return '';
  const country = COUNTRIES.find(c => c.code === code);
  return country?.name || code;
}

/**
 * Get ISO code from country name (for migration/research)
 */
export function getCountryCode(name: string | null | undefined): string | null {
  if (!name) return null;

  const normalizedName = name.trim().toLowerCase();

  // Direct match on code
  const byCode = COUNTRIES.find(c => c.code.toLowerCase() === normalizedName);
  if (byCode) return byCode.code;

  // Match on name
  const byName = COUNTRIES.find(c => c.name.toLowerCase() === normalizedName);
  if (byName) return byName.code;

  // Common aliases
  const aliases: Record<string, string> = {
    'usa': 'US',
    'u.s.': 'US',
    'u.s.a.': 'US',
    'united states of america': 'US',
    'uk': 'GB',
    'u.k.': 'GB',
    'england': 'GB',
    'scotland': 'GB',
    'wales': 'GB',
    'britain': 'GB',
    'great britain': 'GB',
    'holland': 'NL',
    'the netherlands': 'NL',
  };

  return aliases[normalizedName] || null;
}

/**
 * Extract domain from URL
 * Example: "https://www.thecbdistillery.com/shop" → "thecbdistillery.com"
 */
export function getDomainFromUrl(url: string | null | undefined): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    // Remove 'www.' prefix if present
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    // If URL parsing fails, try basic extraction
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/i);
    return match ? match[1].replace(/^www\./, '') : '';
  }
}
