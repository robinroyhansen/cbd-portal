import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { createLocalizedHref } from '@/lib/utils/locale-href';

// Product types with translation keys
const productTypeKeys = [
  {
    nameKey: 'productTypes.cbdOils',
    descKey: 'productTypes.cbdOilsDesc',
    slug: 'cbd-oil',
    icon: '💧',
    glossarySlug: 'cbd-oil',
    searchQuery: 'CBD oil',
  },
  {
    nameKey: 'productTypes.cbdCapsules',
    descKey: 'productTypes.cbdCapsulesDesc',
    slug: 'cbd-capsules',
    icon: '💊',
    glossarySlug: 'capsule',
    searchQuery: 'CBD capsules',
  },
  {
    nameKey: 'productTypes.cbdTopicals',
    descKey: 'productTypes.cbdTopicalsDesc',
    slug: 'cbd-topicals',
    icon: '🧴',
    glossarySlug: 'topical',
    searchQuery: 'CBD topical cream',
  },
  {
    nameKey: 'productTypes.cbdEdibles',
    descKey: 'productTypes.cbdEdiblesDesc',
    slug: 'cbd-edibles',
    icon: '🍬',
    glossarySlug: 'edible',
    searchQuery: 'CBD gummies edibles',
  },
  {
    nameKey: 'productTypes.cbdVapes',
    descKey: 'productTypes.cbdVapesDesc',
    slug: 'cbd-vapes',
    icon: '💨',
    glossarySlug: 'vaporization',
    searchQuery: 'CBD vape',
  },
  {
    nameKey: 'productTypes.cbdIsolate',
    descKey: 'productTypes.cbdIsolateDesc',
    slug: 'cbd-isolate',
    icon: '💎',
    glossarySlug: 'isolate',
    searchQuery: 'CBD isolate',
  },
];

interface BrowseByProductProps {
  lang?: LanguageCode;
}

export async function BrowseByProduct({ lang = 'en' }: BrowseByProductProps) {
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);
  const localizedHref = createLocalizedHref(lang);

  const supabase = await createClient();

  // Check which glossary terms exist
  const { data: glossaryTerms } = await supabase
    .from('kb_glossary')
    .select('slug, term')
    .in('slug', productTypeKeys.map(p => p.glossarySlug));

  const existingGlossarySlugs = new Set(glossaryTerms?.map(t => t.slug) || []);

  // Get brand count if we have brands
  const { count: brandCount } = await supabase
    .from('brands')
    .select('*', { count: 'exact', head: true })
    .not('review_content', 'is', null);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('products.exploreTitle')}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('products.exploreDescription')}
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {productTypeKeys.map((product) => {
            // Link to glossary if term exists, otherwise to search
            const href = existingGlossarySlugs.has(product.glossarySlug)
              ? localizedHref(`/glossary/${product.glossarySlug}`)
              : localizedHref(`/search?q=${encodeURIComponent(product.searchQuery)}`);

            return (
              <Link
                key={product.slug}
                href={href}
                className="group bg-white p-3 md:p-5 rounded-xl shadow-sm hover:shadow-lg transition-all text-center border border-gray-100 hover:border-green-200"
              >
                <span className="text-3xl md:text-4xl block mb-2 md:mb-3">{product.icon}</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 mb-0.5 md:mb-1 text-xs md:text-sm">
                  {t(product.nameKey)}
                </h3>
                <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2 hidden sm:block">{t(product.descKey)}</p>
              </Link>
            );
          })}
        </div>

        {/* Additional resources - scrollable on mobile */}
        <div className="mt-6 md:mt-10 flex overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-center gap-3 md:gap-4 scrollbar-hide">
          <Link
            href={localizedHref('/glossary/bioavailability')}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-300 hover:text-green-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span>📊</span>
            {t('products.bioavailability')}
          </Link>
          <Link
            href={localizedHref('/tools/dosage-calculator')}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-300 hover:text-green-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span>💊</span>
            {t('tools.dosageCalculator')}
          </Link>
          <Link
            href={localizedHref('/glossary/full-spectrum')}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-300 hover:text-green-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span>🌿</span>
            {t('products.fullVsBroad')}
          </Link>
          {brandCount && brandCount > 0 && (
            <Link
              href={localizedHref('/reviews')}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 hover:bg-green-100 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <span>⭐</span>
              {brandCount} {t('nav.reviews')}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
