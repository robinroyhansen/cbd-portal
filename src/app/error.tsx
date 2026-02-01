'use client';

import { useEffect } from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { useLocale } from '@/hooks/useLocale';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('errorPage.title')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('errorPage.description')}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4">
            {t('errorPage.errorId')}: {error.digest}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {t('errorPage.tryAgain')}
          </button>
          <Link
            href="/"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition inline-block"
          >
            {t('errorPage.goHome')}
          </Link>
        </div>
      </div>
    </div>
  );
}
