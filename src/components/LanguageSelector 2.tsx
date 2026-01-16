'use client';

import { useEffect, useState } from 'react';

interface Language {
  code: string;
  name: string;
  native_name: string;
  domain: string;
  flag_emoji: string;
  is_swiss_variant: boolean;
}

export function LanguageSelector({ currentSlug }: { currentSlug?: string }) {
  const [currentDomain, setCurrentDomain] = useState('');
  const [currentSwissLang, setCurrentSwissLang] = useState('de-CH');
  const [isSwiss, setIsSwiss] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    setCurrentDomain(hostname);
    setIsSwiss(hostname === 'cbdportal.ch');

    // Get saved Swiss language preference
    const savedLang = localStorage.getItem('cbd-swiss-language');
    if (savedLang) setCurrentSwissLang(savedLang);
  }, []);

  // Hardcoded language list for all domains
  const languages: Language[] = [
    { code: 'en-GB', name: 'English', native_name: 'English', domain: 'swissorganic.co.uk', flag_emoji: '🇬🇧', is_swiss_variant: false },
    { code: 'da', name: 'Danish', native_name: 'Dansk', domain: 'cbd.dk', flag_emoji: '🇩🇰', is_swiss_variant: false },
    { code: 'sv', name: 'Swedish', native_name: 'Svenska', domain: 'cbd.se', flag_emoji: '🇸🇪', is_swiss_variant: false },
    { code: 'no', name: 'Norwegian', native_name: 'Norsk', domain: 'cbd.no', flag_emoji: '🇳🇴', is_swiss_variant: false },
    { code: 'fi', name: 'Finnish', native_name: 'Suomi', domain: 'cbd.fi', flag_emoji: '🇫🇮', is_swiss_variant: false },
    { code: 'de', name: 'German', native_name: 'Deutsch', domain: 'cbd.de', flag_emoji: '🇩🇪', is_swiss_variant: false },
    { code: 'it', name: 'Italian', native_name: 'Italiano', domain: 'cbd.it', flag_emoji: '🇮🇹', is_swiss_variant: false },
    { code: 'pt', name: 'Portuguese', native_name: 'Português', domain: 'cbd.pt', flag_emoji: '🇵🇹', is_swiss_variant: false },
    { code: 'nl', name: 'Dutch', native_name: 'Nederlands', domain: 'cbdportaal.nl', flag_emoji: '🇳🇱', is_swiss_variant: false },
    { code: 'fr', name: 'French', native_name: 'Français', domain: 'cbdportail.fr', flag_emoji: '🇫🇷', is_swiss_variant: false },
    { code: 'ro', name: 'Romanian', native_name: 'Română', domain: 'cbdportal.ro', flag_emoji: '🇷🇴', is_swiss_variant: false },
    { code: 'es', name: 'Spanish', native_name: 'Español', domain: 'cbdportal.es', flag_emoji: '🇪🇸', is_swiss_variant: false }
  ];

  const swissLanguages: Language[] = [
    { code: 'de-CH', name: 'Swiss German', native_name: 'Deutsch', domain: 'cbdportal.ch', flag_emoji: '', is_swiss_variant: true },
    { code: 'fr-CH', name: 'Swiss French', native_name: 'Français', domain: 'cbdportal.ch', flag_emoji: '', is_swiss_variant: true },
    { code: 'it-CH', name: 'Swiss Italian', native_name: 'Italiano', domain: 'cbdportal.ch', flag_emoji: '', is_swiss_variant: true }
  ];

  const handleLanguageClick = (domain: string) => {
    // Set override cookie so middleware doesn't redirect back
    document.cookie = 'cbd-language-override=true; max-age=31536000; path=/';
    localStorage.setItem('cbd-language-override', 'true');

    const path = currentSlug ? `/articles/${currentSlug}` : '';
    window.location.href = `https://${domain}${path}`;
  };

  const handleSwissLanguageChange = (langCode: string) => {
    localStorage.setItem('cbd-swiss-language', langCode);
    setCurrentSwissLang(langCode);
    window.location.reload();
  };

  const isCurrentDomain = (domain: string) => {
    return currentDomain === domain ||
           currentDomain === domain.replace('www.', '') ||
           (currentDomain.includes('vercel.app') && domain === 'swissorganic.co.uk') ||
           (currentDomain === 'localhost' && domain === 'swissorganic.co.uk');
  };

  return (
    <div className="border-t border-gray-200 pt-6 mt-8">
      <p className="text-sm text-gray-500 text-center mb-4">Choose your language / Vælg dit sprog / Wählen Sie Ihre Sprache</p>

      {/* Main languages */}
      <div className="flex flex-wrap gap-2 justify-center">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageClick(lang.domain)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              isCurrentDomain(lang.domain) && !isSwiss
                ? 'bg-primary-100 text-primary-800 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {lang.flag_emoji} {lang.native_name}
          </button>
        ))}

        {/* Switzerland */}
        <button
          onClick={() => handleLanguageClick('cbdportal.ch')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            isSwiss
              ? 'bg-primary-100 text-primary-800 font-medium'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          🇨🇭 Schweiz
        </button>
      </div>

      {/* Swiss sub-selector */}
      {isSwiss && swissLanguages.length > 0 && (
        <div className="flex justify-center gap-2 mt-4 pt-3 border-t border-gray-100">
          {swissLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSwissLanguageChange(lang.code)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                currentSwissLang === lang.code
                  ? 'bg-red-600 text-white font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {lang.native_name}
            </button>
          ))}
        </div>
      )}

      {/* Note about translations */}
      <p className="text-xs text-gray-400 text-center mt-4">
        More languages coming soon
      </p>
    </div>
  );
}