'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay to prevent flash
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', 'all');
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookie_consent', 'essential');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            {t('cookie.message')}{' '}
            <Link href="/cookie-policy" className="underline hover:text-green-400">
              {t('cookie.learnMore')}
            </Link>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={acceptEssential}
            className="px-4 py-2 text-sm border border-gray-500 rounded hover:bg-gray-800 transition-colors"
          >
            {t('cookie.essentialOnly')}
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-sm bg-green-600 rounded hover:bg-green-700 transition-colors"
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}