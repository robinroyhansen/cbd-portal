'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocale } from './LocaleProvider';
import type { LanguageCode } from '@/lib/translation-service';

interface LanguageSite {
  code: LanguageCode;
  domain: string;
  displayName: string; // The branded domain name to show
  flag: string;
  region: 'scandinavia' | 'central-europe' | 'southern-europe' | 'switzerland' | 'other';
}

// All CBD Portal sites with their domains
const LANGUAGE_SITES: LanguageSite[] = [
  // Scandinavia
  { code: 'da', domain: 'cbd.dk', displayName: 'CBD.dk', flag: '🇩🇰', region: 'scandinavia' },
  { code: 'sv', domain: 'cbd.se', displayName: 'CBD.se', flag: '🇸🇪', region: 'scandinavia' },
  { code: 'no', domain: 'cbd.no', displayName: 'CBD.no', flag: '🇳🇴', region: 'scandinavia' },
  { code: 'fi', domain: 'cbd.fi', displayName: 'CBD.fi', flag: '🇫🇮', region: 'scandinavia' },

  // Central Europe (ordered: CBD.de, CBD.it, CBD.pt, CBDportail.fr, CBDportaal.nl)
  { code: 'de', domain: 'cbd.de', displayName: 'CBD.de', flag: '🇩🇪', region: 'central-europe' },
  { code: 'it', domain: 'cbd.it', displayName: 'CBD.it', flag: '🇮🇹', region: 'central-europe' },
  { code: 'pt', domain: 'cbd.pt', displayName: 'CBD.pt', flag: '🇵🇹', region: 'central-europe' },
  { code: 'fr', domain: 'cbdportail.fr', displayName: 'CBDportail.fr', flag: '🇫🇷', region: 'central-europe' },
  { code: 'nl', domain: 'cbdportaal.nl', displayName: 'CBDportaal.nl', flag: '🇳🇱', region: 'central-europe' },

  // Southern & Eastern Europe
  { code: 'es', domain: 'cbdportal.es', displayName: 'CBDportal.es', flag: '🇪🇸', region: 'southern-europe' },
  { code: 'ro', domain: 'cbdportal.ro', displayName: 'CBDportal.ro', flag: '🇷🇴', region: 'southern-europe' },

  // Switzerland (single domain, multiple languages)
  { code: 'de-CH' as LanguageCode, domain: 'cbdportal.ch', displayName: 'CBDportal.ch', flag: '🇨🇭', region: 'switzerland' },

  // English (default)
  { code: 'en', domain: 'cbdportal.com', displayName: 'CBDportal.com', flag: '🇬🇧', region: 'other' },
];

// Swiss language options for the Swiss domain
const SWISS_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: 'de-CH' as LanguageCode, label: 'DE' },
  { code: 'fr-CH' as LanguageCode, label: 'FR' },
  { code: 'it-CH' as LanguageCode, label: 'IT' },
];

interface FooterLanguageSelectorProps {
  currentLang?: string;
}

export function FooterLanguageSelector({ currentLang: propLang = 'en' }: FooterLanguageSelectorProps) {
  const pathname = usePathname();
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const { t, lang: contextLang, setLanguage } = useLocale();
  
  // Use context lang if available, fall back to prop
  const currentLang = contextLang || propLang;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.hostname);
    }
  }, []);

  // Check if we're on development/staging (localhost or Vercel)
  const isDevOrStaging = currentDomain.includes('localhost') || currentDomain.includes('vercel.app');

  // Handle language click - either switch language (dev/staging) or navigate to domain (production)
  const handleLanguageClick = (site: LanguageSite, e: React.MouseEvent) => {
    if (isDevOrStaging) {
      e.preventDefault();
      setLanguage(site.code);
    }
    // On production, the regular href navigation happens
  };

  // Handle Swiss language click
  const handleSwissLanguageClick = (langCode: LanguageCode, e: React.MouseEvent) => {
    if (isDevOrStaging) {
      e.preventDefault();
      setLanguage(langCode);
    }
  };

  // Build URL for a specific domain
  const buildUrl = (domain: string, langCode: LanguageCode) => {
    // For development/staging, use query param
    if (isDevOrStaging) {
      const baseUrl = pathname || '/';
      if (langCode !== 'en') {
        return `${baseUrl}?lang=${langCode}`;
      }
      return baseUrl;
    }

    // For production, link to actual domain
    return `https://${domain}${pathname || '/'}`;
  };

  // Check if this is the current site
  const isCurrentSite = (site: LanguageSite) => {
    if (isDevOrStaging) {
      return site.code === currentLang;
    }
    return currentDomain === site.domain;
  };

  // Group sites by region
  const scandinaviaSites = LANGUAGE_SITES.filter(s => s.region === 'scandinavia');
  const centralEuropeSites = LANGUAGE_SITES.filter(s => s.region === 'central-europe');
  const southernEuropeSites = LANGUAGE_SITES.filter(s => s.region === 'southern-europe');
  const swissSite = LANGUAGE_SITES.find(s => s.region === 'switzerland');
  const englishSite = LANGUAGE_SITES.find(s => s.region === 'other');

  // Check if we're on Swiss domain or have Swiss language selected
  const isSwissDomain = currentDomain === 'cbdportal.ch' ||
    ['de-CH', 'fr-CH', 'it-CH'].includes(currentLang);

  return (
    <div className="border-t border-gray-800 mt-8 pt-8">
      <h3 className="text-sm font-semibold text-white mb-4">{t('footer.availableIn')}</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {/* Scandinavia */}
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{t('footer.scandinavia')}</p>
          <ul className="space-y-1.5">
            {scandinaviaSites.map((site) => (
              <li key={site.code}>
                <a
                  href={buildUrl(site.domain, site.code)}
                  hrefLang={site.code}
                  onClick={(e) => handleLanguageClick(site, e)}
                  className={`inline-flex items-center gap-2 text-sm transition-colors cursor-pointer ${
                    isCurrentSite(site)
                      ? 'text-emerald-400 font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-current={isCurrentSite(site) ? 'page' : undefined}
                >
                  <span className="text-base">{site.flag}</span>
                  <span>{site.displayName}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Central Europe */}
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{t('footer.centralEurope')}</p>
          <ul className="space-y-1.5">
            {centralEuropeSites.map((site) => (
              <li key={site.code}>
                <a
                  href={buildUrl(site.domain, site.code)}
                  hrefLang={site.code}
                  onClick={(e) => handleLanguageClick(site, e)}
                  className={`inline-flex items-center gap-2 text-sm transition-colors cursor-pointer ${
                    isCurrentSite(site)
                      ? 'text-emerald-400 font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-current={isCurrentSite(site) ? 'page' : undefined}
                >
                  <span className="text-base">{site.flag}</span>
                  <span>{site.displayName}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Southern & Eastern Europe */}
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{t('footer.southernEurope')}</p>
          <ul className="space-y-1.5">
            {southernEuropeSites.map((site) => (
              <li key={site.code}>
                <a
                  href={buildUrl(site.domain, site.code)}
                  hrefLang={site.code}
                  onClick={(e) => handleLanguageClick(site, e)}
                  className={`inline-flex items-center gap-2 text-sm transition-colors cursor-pointer ${
                    isCurrentSite(site)
                      ? 'text-emerald-400 font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  aria-current={isCurrentSite(site) ? 'page' : undefined}
                >
                  <span className="text-base">{site.flag}</span>
                  <span>{site.displayName}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Switzerland */}
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{t('footer.switzerland')}</p>
          {swissSite && (
            <div className="space-y-2">
              <a
                href={buildUrl(swissSite.domain, 'de-CH' as LanguageCode)}
                hrefLang="de-CH"
                onClick={(e) => handleLanguageClick({ ...swissSite, code: 'de-CH' as LanguageCode }, e)}
                className={`inline-flex items-center gap-2 text-sm transition-colors cursor-pointer ${
                  isSwissDomain
                    ? 'text-emerald-400 font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-current={isSwissDomain ? 'page' : undefined}
              >
                <span className="text-base">{swissSite.flag}</span>
                <span>{swissSite.displayName}</span>
              </a>

              {/* Swiss language switcher */}
              <div className="flex items-center gap-1 ml-6 text-xs">
                {SWISS_LANGUAGES.map((lang, idx) => (
                  <span key={lang.code} className="flex items-center">
                    {idx > 0 && <span className="text-gray-600 mx-1">·</span>}
                    <a
                      href={buildUrl('cbdportal.ch', lang.code)}
                      hrefLang={lang.code}
                      onClick={(e) => handleSwissLanguageClick(lang.code, e)}
                      className={`transition-colors cursor-pointer ${
                        currentLang === lang.code
                          ? 'text-emerald-400 font-medium'
                          : 'text-gray-500 hover:text-white'
                      }`}
                    >
                      {lang.label}
                    </a>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* English / International */}
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{t('footer.international')}</p>
          {englishSite && (
            <a
              href={buildUrl(englishSite.domain, 'en')}
              hrefLang="en"
              onClick={(e) => handleLanguageClick(englishSite, e)}
              className={`inline-flex items-center gap-2 text-sm transition-colors cursor-pointer ${
                isCurrentSite(englishSite)
                  ? 'text-emerald-400 font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-current={isCurrentSite(englishSite) ? 'page' : undefined}
            >
              <span className="text-base">{englishSite.flag}</span>
              <span>{englishSite.displayName}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
