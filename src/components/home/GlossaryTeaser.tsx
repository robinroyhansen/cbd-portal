import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { createLocalizedHref } from '@/lib/utils/locale-href';
import { getRecentGlossaryTermsWithTranslations } from '@/lib/translations';

interface GlossaryTeaserProps {
  lang?: LanguageCode;
}

export async function GlossaryTeaser({ lang = 'en' }: GlossaryTeaserProps) {
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);
  const localizedHref = createLocalizedHref(lang);
  const supabase = await createClient();

  // Get recently updated glossary terms with translations
  const recentTerms = await getRecentGlossaryTermsWithTranslations(lang, 8);

  // Get total count
  const { count: totalTerms } = await supabase
    .from('kb_glossary')
    .select('*', { count: 'exact', head: true });

  // Get category distribution
  const { data: categories } = await supabase
    .from('kb_glossary')
    .select('category')
    .not('category', 'is', null);

  const categoryCounts = categories?.reduce((acc, item) => {
    if (item.category) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (recentTerms.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Mobile: Header and stats inline */}
        <div className="flex flex-col md:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <h2 className="text-xl font-bold text-gray-900">{t('glossary.title')}</h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{totalTerms || 0}</div>
              <div className="text-xs text-gray-500">{t('common.terms')}</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {t('glossary.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-12">
          {/* Left side - info (hidden on mobile, shown above) */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">📖</span>
              <h2 className="text-3xl font-bold text-gray-900">{t('glossary.title')}</h2>
            </div>
            <p className="text-gray-600 mb-6">
              {t('glossary.subtitle')}
            </p>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="text-4xl font-bold text-green-600 mb-1">{totalTerms || 0}</div>
              <div className="text-gray-600 mb-4">{t('stats.termsExplained')}</div>

              {topCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topCategories.map(([category, count]) => {
                    const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
                    const translatedCategory = t(`glossaryCategories.${categoryKey}`) || category;
                    return (
                    <Link
                      key={category}
                      href={localizedHref(`/glossary/category/${categoryKey}`)}
                      className="text-xs px-2 py-1 bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 rounded-full transition-colors"
                    >
                      {translatedCategory} ({count})
                    </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href={localizedHref('/glossary')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              {t('glossary.browseAll')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Right side - term cards */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">
                {t('research.recentlyAdded')}
              </h3>
              <Link
                href={localizedHref('/glossary')}
                className="text-xs md:text-sm text-green-600 hover:text-green-700"
              >
                {t('common.viewAll')} →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              {recentTerms.slice(0, 6).map((term) => (
                <Link
                  key={term.slug}
                  href={localizedHref(`/glossary/${term.slug}`)}
                  className="group bg-white p-3 md:p-4 rounded-lg border border-gray-100 hover:border-green-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-1 mb-1 md:mb-2">
                    <h4 className="font-semibold text-sm md:text-base text-gray-900 group-hover:text-green-700 line-clamp-1">
                      {term.term}
                    </h4>
                    {term.category && (
                      <span className="hidden sm:inline text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full whitespace-nowrap">
                        {t(`glossaryCategories.${term.category.toLowerCase().replace(/\s+/g, '-')}`) || term.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                    {term.simple_definition}
                  </p>
                </Link>
              ))}
            </div>

            {/* Mobile CTA */}
            <div className="mt-4 text-center md:hidden">
              <Link
                href={localizedHref('/glossary')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
              >
                {t('glossary.browseAllCount', { count: totalTerms || 0 })}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
