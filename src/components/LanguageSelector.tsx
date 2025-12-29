'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getLanguage, setLanguagePreference, isSwissDomain } from '@/lib/language';

interface Language {
  code: string;
  name: string;
  native_name: string;
  domain: string;
  flag_emoji: string;
  is_swiss_variant: boolean;
  is_active: boolean;
}

export function LanguageSelector({ currentSlug }: { currentSlug?: string }) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [swissLanguages, setSwissLanguages] = useState<Language[]>([]);
  const [currentDomain, setCurrentDomain] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isSwiss, setIsSwiss] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    setCurrentDomain(hostname);
    setIsSwiss(isSwissDomain(hostname));
    setCurrentLanguage(getLanguage(hostname));

    const fetchLanguages = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('kb_languages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (data) {
        setLanguages(data.filter((l: Language) => !l.is_swiss_variant));
        setSwissLanguages(data.filter((l: Language) => l.is_swiss_variant));
      }
    };

    fetchLanguages();
  }, []);

  const buildUrl = (domain: string) => {
    const path = currentSlug ? `/articles/${currentSlug}` : '';
    return `https://${domain}${path}`;
  };

  const handleSwissLanguageChange = (langCode: string) => {
    setLanguagePreference(langCode);
    setCurrentLanguage(langCode);
    window.location.reload();
  };

  // Don't render if only English is active and we're on English site
  if (languages.length <= 1 && !isSwiss) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Main language selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {languages.map((lang) => (
          <Link
            key={lang.code}
            href={buildUrl(lang.domain)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              currentDomain === lang.domain && !isSwiss
                ? 'bg-green-100 text-green-800 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {lang.flag_emoji} {lang.native_name}
          </Link>
        ))}

        {/* Switzerland - only show if Swiss languages are active */}
        {swissLanguages.length > 0 && (
          <Link
            href={buildUrl('cbdportal.ch')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              isSwiss
                ? 'bg-green-100 text-green-800 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🇨🇭 Schweiz / Suisse / Svizzera
          </Link>
        )}
      </div>

      {/* Swiss language sub-selector */}
      {isSwiss && swissLanguages.length > 0 && (
        <div className="flex justify-center gap-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-500 mr-2">Sprache / Langue / Lingua:</span>
          {swissLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSwissLanguageChange(lang.code)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                currentLanguage === lang.code
                  ? 'bg-red-100 text-red-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {lang.native_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}