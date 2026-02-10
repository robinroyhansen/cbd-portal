'use client';

import { useState, useEffect } from 'react';
import { useLocale } from './LocaleProvider';
import type { LanguageCode } from '@/lib/translation-service';

interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  // Swiss variants (cbdportal.ch)
  { code: 'de-CH' as LanguageCode, name: 'Schweizerdeutsch', flag: '🇨🇭' },
  { code: 'fr-CH' as LanguageCode, name: 'Français (CH)', flag: '🇨🇭' },
  { code: 'it-CH' as LanguageCode, name: 'Italiano (CH)', flag: '🇨🇭' },
];

/**
 * Development language switcher that uses the LocaleProvider's setLanguage
 * This properly sets both state and cookie for persistence
 * Only shows on localhost and Vercel preview URLs
 */
export function DevLanguageSwitcher() {
  const { lang: currentLang, setLanguage, t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Only show in development or on preview/staging
    const isDevMode = process.env.NODE_ENV === 'development' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname.includes('vercel.app');
    setIsDev(isDevMode);
  }, []);

  const handleLanguageChange = (langCode: LanguageCode) => {
    // Use the context's setLanguage which handles state, cookie, and URL
    setLanguage(langCode);
    setIsOpen(false);
  };

  if (!isDev) return null;

  const currentLanguage = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          aria-label={t('accessibility.switchLanguage')}
        >
          <span>{currentLanguage.flag}</span>
          <span>{currentLanguage.name}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
              <p className="text-xs text-slate-500 font-medium">Language Switcher</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <div key={lang.code}>
                  {/* Add separator before Swiss variants */}
                  {lang.code === 'de-CH' && (
                    <div className="px-3 py-1.5 bg-slate-50 border-y border-slate-200">
                      <p className="text-xs text-slate-500">Switzerland (cbdportal.ch)</p>
                    </div>
                  )}
                  <button
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${
                      currentLang === lang.code ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                    {currentLang === lang.code && (
                      <svg className="w-4 h-4 ml-auto text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
