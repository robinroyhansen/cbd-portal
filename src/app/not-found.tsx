import Link from 'next/link';
import { getLanguage } from '@/lib/get-language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

export default async function NotFound() {
  const lang = await getLanguage() as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('notFoundPage.title')}</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {t('notFoundPage.description')}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {t('notFoundPage.goHome')}
          </Link>
          <Link
            href="/research"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {t('notFoundPage.browseResearch')}
          </Link>
          <Link
            href="/glossary"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {t('notFoundPage.viewGlossary')}
          </Link>
        </div>
      </div>
    </div>
  );
}
