'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';
import { useLocale } from '@/hooks/useLocale';

export default function ProductFinderPage() {
  const { t } = useLocale();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('productFinder.title')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t('productFinder.description')}
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {t('productFinder.inMeantime')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/dosage-calculator"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t('productFinder.dosageCalculator')}
            </Link>
            <Link
              href="/tools/interactions"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('productFinder.drugInteractions')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
