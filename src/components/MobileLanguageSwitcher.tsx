'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface LanguageOption {
  code: string;
  domain: string;
  flag: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  // English
  { code: 'en', domain: 'cbdportal.com', flag: '🇬🇧', name: 'English', nativeName: 'English' },

  // Scandinavia
  { code: 'da', domain: 'cbd.dk', flag: '🇩🇰', name: 'Danish', nativeName: 'Dansk' },
  { code: 'sv', domain: 'cbd.se', flag: '🇸🇪', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', domain: 'cbd.no', flag: '🇳🇴', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fi', domain: 'cbd.fi', flag: '🇫🇮', name: 'Finnish', nativeName: 'Suomi' },

  // Central Europe
  { code: 'de', domain: 'cbd.de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', domain: 'cbdportail.fr', flag: '🇫🇷', name: 'French', nativeName: 'Français' },
  { code: 'nl', domain: 'cbdportaal.nl', flag: '🇳🇱', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'it', domain: 'cbd.it', flag: '🇮🇹', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', domain: 'cbd.pt', flag: '🇵🇹', name: 'Portuguese', nativeName: 'Português' },

  // Southern Europe
  { code: 'es', domain: 'cbdportal.es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  { code: 'ro', domain: 'cbdportal.ro', flag: '🇷🇴', name: 'Romanian', nativeName: 'Română' },

  // Switzerland
  { code: 'de-CH', domain: 'cbdportal.ch', flag: '🇨🇭', name: 'Swiss German', nativeName: 'Schweizerdeutsch' },
  { code: 'fr-CH', domain: 'cbdportal.ch', flag: '🇨🇭', name: 'Swiss French', nativeName: 'Français (Suisse)' },
  { code: 'it-CH', domain: 'cbdportal.ch', flag: '🇨🇭', name: 'Swiss Italian', nativeName: 'Italiano (Svizzera)' },
];

interface MobileLanguageSwitcherProps {
  currentLang?: string;
  onClose?: () => void;
}

export function MobileLanguageSwitcher({ currentLang = 'en', onClose }: MobileLanguageSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  const currentLanguage = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const buildUrl = (lang: LanguageOption) => {
    // For development/staging, use query param
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('localhost') || hostname.includes('vercel.app')) {
        const baseUrl = pathname || '/';
        if (lang.code !== 'en') {
          return `${baseUrl}?lang=${lang.code}`;
        }
        return baseUrl;
      }
    }

    // For production, link to actual domain
    return `https://${lang.domain}${pathname || '/'}`;
  };

  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="text-xl">🌐</span>
          <span className="font-medium text-gray-700">Language</span>
        </span>
        <span className="flex items-center gap-2 text-gray-500">
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="text-sm">{currentLanguage.nativeName}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-xl p-2 max-h-64 overflow-y-auto">
            {LANGUAGES.map((lang) => {
              const isActive = lang.code === currentLang;
              return (
                <a
                  key={lang.code}
                  href={buildUrl(lang)}
                  hrefLang={lang.code}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-800'
                      : 'hover:bg-white text-gray-700'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1">
                    <span className="font-medium">{lang.nativeName}</span>
                    {lang.name !== lang.nativeName && (
                      <span className="text-xs text-gray-500 ml-2">({lang.name})</span>
                    )}
                  </span>
                  {isActive && (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
