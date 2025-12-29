// Domain to default language mapping
const domainToLanguage: Record<string, string> = {
  'swissorganic.co.uk': 'en',
  'cbd-portal.vercel.app': 'en',
  'cbd.dk': 'da',
  'cbd.se': 'sv',
  'cbd.no': 'no',
  'cbd.fi': 'fi',
  'cbd.de': 'de',
  'cbd.it': 'it',
  'cbd.pt': 'pt',
  'cbdportaal.nl': 'nl',
  'cbdportail.fr': 'fr',
  'cbdportal.ro': 'ro',
  'cbdportal.es': 'es',
  'cbdportal.ch': 'de-CH',
  'localhost': 'en'
};

const logoMap: Record<string, string> = {
  'swissorganic.co.uk': 'CBD.uk',
  'cbd-portal.vercel.app': 'CBD Portal',
  'cbd.dk': 'CBD.dk',
  'cbd.se': 'CBD.se',
  'cbd.no': 'CBD.no',
  'cbd.fi': 'CBD.fi',
  'cbd.de': 'CBD.de',
  'cbd.it': 'CBD.it',
  'cbd.pt': 'CBD.pt',
  'cbdportaal.nl': 'CBDportaal.nl',
  'cbdportail.fr': 'CBDportail.fr',
  'cbdportal.ro': 'CBDportal.ro',
  'cbdportal.es': 'CBDportal.es',
  'cbdportal.ch': 'CBDportal.ch',
  'localhost': 'CBD Portal'
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