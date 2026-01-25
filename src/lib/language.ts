// Domain to default language mapping
const domainToLanguage: Record<string, string> = {
  // Primary English domains
  'cbdportal.com': 'en',
  'www.cbdportal.com': 'en',
  'swissorganic.co.uk': 'en',
  'cbd-portal.vercel.app': 'en',
  'localhost': 'en',
  // Scandinavia
  'cbd.dk': 'da',
  'www.cbd.dk': 'da',
  'cbd.se': 'sv',
  'www.cbd.se': 'sv',
  'cbd.no': 'no',
  'www.cbd.no': 'no',
  'cbd.fi': 'fi',
  'www.cbd.fi': 'fi',
  // Central Europe
  'cbd.de': 'de',
  'www.cbd.de': 'de',
  'cbd.it': 'it',
  'www.cbd.it': 'it',
  'cbd.pt': 'pt',
  'www.cbd.pt': 'pt',
  'cbdportail.fr': 'fr',
  'www.cbdportail.fr': 'fr',
  'cbdportaal.nl': 'nl',
  'www.cbdportaal.nl': 'nl',
  // Southern Europe
  'cbdportal.es': 'es',
  'www.cbdportal.es': 'es',
  'cbdportal.ro': 'ro',
  'www.cbdportal.ro': 'ro',
  // Switzerland (multi-language)
  'cbdportal.ch': 'de-CH',
  'www.cbdportal.ch': 'de-CH',
};

const logoMap: Record<string, string> = {
  // English
  'cbdportal.com': 'CBDportal.com',
  'www.cbdportal.com': 'CBDportal.com',
  'swissorganic.co.uk': 'CBD.uk',
  'cbd-portal.vercel.app': 'CBD Portal',
  'localhost': 'CBD Portal',
  // Scandinavia
  'cbd.dk': 'CBD.dk',
  'www.cbd.dk': 'CBD.dk',
  'cbd.se': 'CBD.se',
  'www.cbd.se': 'CBD.se',
  'cbd.no': 'CBD.no',
  'www.cbd.no': 'CBD.no',
  'cbd.fi': 'CBD.fi',
  'www.cbd.fi': 'CBD.fi',
  // Central Europe
  'cbd.de': 'CBD.de',
  'www.cbd.de': 'CBD.de',
  'cbd.it': 'CBD.it',
  'www.cbd.it': 'CBD.it',
  'cbd.pt': 'CBD.pt',
  'www.cbd.pt': 'CBD.pt',
  'cbdportail.fr': 'CBDportail.fr',
  'www.cbdportail.fr': 'CBDportail.fr',
  'cbdportaal.nl': 'CBDportaal.nl',
  'www.cbdportaal.nl': 'CBDportaal.nl',
  // Southern Europe
  'cbdportal.es': 'CBDportal.es',
  'www.cbdportal.es': 'CBDportal.es',
  'cbdportal.ro': 'CBDportal.ro',
  'www.cbdportal.ro': 'CBDportal.ro',
  // Switzerland
  'cbdportal.ch': 'CBDportal.ch',
  'www.cbdportal.ch': 'CBDportal.ch',
};

// Swiss language detection from browser
export function detectSwissLanguage(): string {
  if (typeof navigator === 'undefined') return 'de-CH';
  const browserLang = navigator.language || navigator.languages?.[0] || '';
  if (browserLang.startsWith('fr')) return 'fr-CH';
  if (browserLang.startsWith('it')) return 'it-CH';
  return 'de-CH';
}

// Get language - checks localStorage first (user choice), then domain/browser
export function getLanguage(hostname: string): string {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const savedLang = localStorage.getItem('cbd-language');
    if (savedLang) {
      if (hostname === 'cbdportal.ch') {
        if (['de-CH', 'fr-CH', 'it-CH'].includes(savedLang)) {
          return savedLang;
        }
      } else {
        return savedLang;
      }
    }
  }

  if (hostname === 'cbdportal.ch') {
    return detectSwissLanguage();
  }

  return domainToLanguage[hostname] || 'en';
}

export function setLanguagePreference(langCode: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('cbd-language', langCode);
  }
}

export function getLogoText(hostname: string): string {
  return logoMap[hostname] || 'CBD Portal';
}

export function isSwissDomain(hostname: string): boolean {
  return hostname === 'cbdportal.ch';
}

export function getLanguageFromHostname(hostname: string): string {
  return domainToLanguage[hostname] || 'en';
}

/**
 * Server-side language detection from request headers
 * Uses the Host header to determine language based on domain
 */
export function detectLanguage(headers: Headers): string {
  const host = headers.get('host') || headers.get('x-forwarded-host') || 'localhost';
  // Remove port if present
  const hostname = host.split(':')[0];
  return getLanguageFromHostname(hostname);
}