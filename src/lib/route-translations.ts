/**
 * Route translations for localized URLs
 * Maps English route segments to their localized equivalents
 */

export type SupportedRouteLanguage = 'da' | 'no' | 'de' | 'sv' | 'fi';

// Route segment translations (English → Localized)
export const routeTranslations: Record<SupportedRouteLanguage, Record<string, string>> = {
  da: {
    // Main sections
    'tools': 'vaerktoejer',
    'conditions': 'tilstande',
    'articles': 'artikler',
    'glossary': 'ordliste',
    'research': 'forskning',
    'about': 'om-os',
    'contact': 'kontakt',
    'pets': 'kaeledyr',
    'reviews': 'anmeldelser',
    'categories': 'kategorier',
    'authors': 'forfattere',
    'search': 'soeg',
    'tags': 'tags',
    'topics': 'emner',
    
    // Tool slugs
    'dosage-calculator': 'dosis-beregner',
    'animal-dosage-calculator': 'dyre-dosis-beregner',
    'cost-calculator': 'pris-beregner',
    'strength-calculator': 'styrke-beregner',
    'interactions': 'interaktioner',
    'product-finder': 'produkt-finder',
    
    // Pet categories
    'dogs': 'hunde',
    'cats': 'katte',
    'horses': 'heste',
    'small-pets': 'smaa-kaeledyr',
    'birds': 'fugle',
    
    // Legal pages
    'medical-disclaimer': 'medicinsk-ansvarsfraskrivelse',
    'editorial-policy': 'redaktionspolitik',
    'privacy-policy': 'privatlivspolitik',
    'terms-of-service': 'servicevilkaar',
    'cookie-policy': 'cookiepolitik',
    
    // Sub-routes
    'methodology': 'metodik',
    'study': 'studie',
    'category': 'kategori',
  },
  no: {
    // Main sections
    'tools': 'verktoy',
    'conditions': 'tilstander',
    'articles': 'artikler',
    'glossary': 'ordliste',
    'research': 'forskning',
    'about': 'om-oss',
    'contact': 'kontakt',
    'pets': 'kjaeledyr',
    'reviews': 'anmeldelser',
    'categories': 'kategorier',
    'authors': 'forfattere',
    'search': 'sok',
    'tags': 'tags',
    'topics': 'emner',
    
    // Tool slugs
    'dosage-calculator': 'dose-kalkulator',
    'animal-dosage-calculator': 'dyre-dose-kalkulator',
    'cost-calculator': 'pris-kalkulator',
    'strength-calculator': 'styrke-kalkulator',
    'interactions': 'interaksjoner',
    'product-finder': 'produkt-finner',
    
    // Pet categories
    'dogs': 'hunder',
    'cats': 'katter',
    'horses': 'hester',
    'small-pets': 'smaa-kjaeledyr',
    'birds': 'fugler',
    
    // Legal pages
    'medical-disclaimer': 'medisinsk-ansvarsfraskrivelse',
    'editorial-policy': 'redaksjonspolitikk',
    'privacy-policy': 'personvernpolitikk',
    'terms-of-service': 'tjenestevilkaar',
    'cookie-policy': 'informasjonskapsler',
    
    // Sub-routes
    'methodology': 'metodikk',
    'study': 'studie',
    'category': 'kategori',
  },
  de: {
    // Main sections
    'tools': 'werkzeuge',
    'conditions': 'erkrankungen',
    'articles': 'artikel',
    'glossary': 'glossar',
    'research': 'forschung',
    'about': 'ueber-uns',
    'contact': 'kontakt',
    'pets': 'haustiere',
    'reviews': 'bewertungen',
    'categories': 'kategorien',
    'authors': 'autoren',
    'search': 'suche',
    'tags': 'tags',
    'topics': 'themen',
    
    // Tool slugs
    'dosage-calculator': 'dosierungsrechner',
    'animal-dosage-calculator': 'tier-dosierungsrechner',
    'cost-calculator': 'kostenrechner',
    'strength-calculator': 'staerkerechner',
    'interactions': 'wechselwirkungen',
    'product-finder': 'produkt-finder',
    
    // Pet categories
    'dogs': 'hunde',
    'cats': 'katzen',
    'horses': 'pferde',
    'small-pets': 'kleintiere',
    'birds': 'voegel',
    
    // Legal pages
    'medical-disclaimer': 'medizinischer-haftungsausschluss',
    'editorial-policy': 'redaktionelle-richtlinien',
    'privacy-policy': 'datenschutzrichtlinie',
    'terms-of-service': 'nutzungsbedingungen',
    'cookie-policy': 'cookie-richtlinie',
    
    // Sub-routes
    'methodology': 'methodik',
    'study': 'studie',
    'category': 'kategori',
  },
  sv: {
    // Main sections
    'tools': 'verktyg',
    'conditions': 'tillstand',
    'articles': 'artiklar',
    'glossary': 'ordlista',
    'research': 'forskning',
    'about': 'om-oss',
    'contact': 'kontakt',
    'pets': 'husdjur',
    'reviews': 'recensioner',
    'categories': 'kategorier',
    'authors': 'forfattare',
    'search': 'sok',
    'tags': 'taggar',
    'topics': 'amnen',
    
    // Tool slugs
    'dosage-calculator': 'doserings-kalkylator',
    'animal-dosage-calculator': 'djur-doserings-kalkylator',
    'cost-calculator': 'kostnads-kalkylator',
    'strength-calculator': 'styrke-kalkylator',
    'interactions': 'interaktioner',
    'product-finder': 'produkt-sokning',
    
    // Pet categories
    'dogs': 'hundar',
    'cats': 'katter',
    'horses': 'hastar',
    'small-pets': 'smadjur',
    'birds': 'faglar',
    
    // Legal pages
    'medical-disclaimer': 'medicinskt-ansvarsfriskrivning',
    'editorial-policy': 'redaktionell-policy',
    'privacy-policy': 'integritetspolicy',
    'terms-of-service': 'anvandningsvillkor',
    'cookie-policy': 'cookie-policy',
    
    // Sub-routes
    'methodology': 'metodik',
    'study': 'studie',
    'category': 'kategori',
  },
  fi: {
    // Main sections
    'tools': 'tyokalut',
    'conditions': 'sairaudet',
    'articles': 'artikkelit',
    'glossary': 'sanasto',
    'research': 'tutkimus',
    'about': 'tietoja',
    'contact': 'yhteystiedot',
    'pets': 'lemmikit',
    'reviews': 'arvostelut',
    'categories': 'kategoriat',
    'authors': 'kirjoittajat',
    'search': 'haku',
    'tags': 'tunnisteet',
    'topics': 'aiheet',
    
    // Tool slugs
    'dosage-calculator': 'annostus-laskuri',
    'animal-dosage-calculator': 'elain-annostus-laskuri',
    'cost-calculator': 'hinta-laskuri',
    'strength-calculator': 'vahvuus-laskuri',
    'interactions': 'yhteisvaikutukset',
    'product-finder': 'tuotehaku',
    
    // Pet categories
    'dogs': 'koirat',
    'cats': 'kissat',
    'horses': 'hevoset',
    'small-pets': 'pikkulemmikit',
    'birds': 'linnut',
    
    // Legal pages
    'medical-disclaimer': 'laaketieteen-vastuuvapautuslauseke',
    'editorial-policy': 'toimituskasitanto',
    'privacy-policy': 'tietosuojakasitanto',
    'terms-of-service': 'kayttoehdot',
    'cookie-policy': 'evastekasitanto',
    
    // Sub-routes
    'methodology': 'menetelmat',
    'study': 'tutkimus',
    'category': 'kategoria',
  },
};

// Create reverse mappings (Localized → English) for URL parsing
type ReverseMap = Record<string, string>;

function createReverseMappings(): Record<SupportedRouteLanguage, ReverseMap> {
  const result: Record<SupportedRouteLanguage, ReverseMap> = { da: {}, no: {}, de: {}, sv: {}, fi: {} };
  
  for (const lang of Object.keys(routeTranslations) as SupportedRouteLanguage[]) {
    const translations = routeTranslations[lang];
    for (const [english, localized] of Object.entries(translations)) {
      result[lang][localized] = english;
    }
  }
  
  return result;
}

export const reverseRouteTranslations = createReverseMappings();

// Languages that use localized routes (domain-based)
export const localizedRouteDomains: Record<string, SupportedRouteLanguage> = {
  'cbd.dk': 'da',
  'cbd.no': 'no',
  'cbd.de': 'de',
  'cbd.se': 'sv',
  'cbd.fi': 'fi',
};

/**
 * Check if a language uses localized routes
 */
export function usesLocalizedRoutes(lang: string): lang is SupportedRouteLanguage {
  return lang === 'da' || lang === 'no' || lang === 'de' || lang === 'sv' || lang === 'fi';
}

/**
 * Get localized path for a given English path and language
 * 
 * @example
 * getLocalizedPath('/tools/dosage-calculator', 'da')
 * // Returns: '/vaerktoejer/dosis-beregner'
 */
export function getLocalizedPath(englishPath: string, lang: string): string {
  // Only translate for supported languages
  if (!usesLocalizedRoutes(lang)) {
    return englishPath;
  }
  
  const translations = routeTranslations[lang];
  if (!translations) return englishPath;
  
  // Parse the path
  const [pathPart, queryPart] = englishPath.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  
  // Translate each segment
  const translatedSegments = segments.map(segment => {
    return translations[segment] || segment;
  });
  
  // Rebuild the path
  let translatedPath = '/' + translatedSegments.join('/');
  
  // Preserve query params if any
  if (queryPart) {
    translatedPath += '?' + queryPart;
  }
  
  return translatedPath;
}

/**
 * Get English path from a localized path
 * 
 * @example
 * getEnglishPath('/vaerktoejer/dosis-beregner', 'da')
 * // Returns: '/tools/dosage-calculator'
 */
export function getEnglishPath(localizedPath: string, lang: string): string {
  if (!usesLocalizedRoutes(lang)) {
    return localizedPath;
  }
  
  const reverseMappings = reverseRouteTranslations[lang];
  if (!reverseMappings) return localizedPath;
  
  // Parse the path
  const [pathPart, queryPart] = localizedPath.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  
  // Translate each segment back to English
  const englishSegments = segments.map(segment => {
    return reverseMappings[segment] || segment;
  });
  
  // Rebuild the path
  let englishPath = '/' + englishSegments.join('/');
  
  // Preserve query params if any
  if (queryPart) {
    englishPath += '?' + queryPart;
  }
  
  return englishPath;
}

/**
 * Check if a path contains localized segments for a given language
 */
export function isLocalizedPath(path: string, lang: string): boolean {
  if (!usesLocalizedRoutes(lang)) {
    return false;
  }
  
  const reverseMappings = reverseRouteTranslations[lang];
  const [pathPart] = path.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  
  // Check if any segment is a localized version
  return segments.some(segment => reverseMappings[segment] !== undefined);
}

/**
 * Check if a path contains English segments that should be localized
 */
export function hasTranslatableSegments(path: string, lang: string): boolean {
  if (!usesLocalizedRoutes(lang)) {
    return false;
  }
  
  const translations = routeTranslations[lang];
  const [pathPart] = path.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  
  // Check if any segment has a translation available
  return segments.some(segment => translations[segment] !== undefined);
}

/**
 * Get all English route prefixes that have translations
 */
export function getTranslatableRoutePrefixes(): string[] {
  // Collect all unique English route segments that start paths
  const prefixes = new Set<string>();
  
  for (const lang of Object.keys(routeTranslations) as SupportedRouteLanguage[]) {
    for (const english of Object.keys(routeTranslations[lang])) {
      prefixes.add(english);
    }
  }
  
  return Array.from(prefixes);
}

/**
 * Get all localized route prefixes for matching in middleware
 */
export function getLocalizedRoutePrefixes(lang: SupportedRouteLanguage): string[] {
  return Object.values(routeTranslations[lang]);
}