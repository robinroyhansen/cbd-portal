import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const productTypes = [
  {
    name: 'CBD Oils',
    slug: 'cbd-oil',
    icon: '💧',
    description: 'Full spectrum, broad spectrum, and isolate oils',
    glossarySlug: 'cbd-oil',
    searchQuery: 'CBD oil',
  },
  {
    name: 'CBD Capsules',
    slug: 'cbd-capsules',
    icon: '💊',
    description: 'Convenient pre-measured doses',
    glossarySlug: 'capsule',
    searchQuery: 'CBD capsules',
  },
  {
    name: 'CBD Topicals',
    slug: 'cbd-topicals',
    icon: '🧴',
    description: 'Creams, balms, and lotions for targeted relief',
    glossarySlug: 'topical',
    searchQuery: 'CBD topical cream',
  },
  {
    name: 'CBD Edibles',
    slug: 'cbd-edibles',
    icon: '🍬',
    description: 'Gummies and food products',
    glossarySlug: 'edible',
    searchQuery: 'CBD gummies edibles',
  },
  {
    name: 'CBD Vapes',
    slug: 'cbd-vapes',
    icon: '💨',
    description: 'Fast-acting inhalation products',
    glossarySlug: 'vaporization',
    searchQuery: 'CBD vape',
  },
  {
    name: 'CBD Isolate',
    slug: 'cbd-isolate',
    icon: '💎',
    description: 'Pure CBD crystal powder',
    glossarySlug: 'isolate',
    searchQuery: 'CBD isolate',
  },
];

export async function BrowseByProduct() {
  const supabase = await createClient();

  // Check which glossary terms exist
  const { data: glossaryTerms } = await supabase
    .from('kb_glossary')
    .select('slug, term')
    .in('slug', productTypes.map(p => p.glossarySlug));

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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore CBD Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn about different CBD product types, how they work, and find what&apos;s right for you
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {productTypes.map((product) => {
            // Link to glossary if term exists, otherwise to search
            const href = existingGlossarySlugs.has(product.glossarySlug)
              ? `/glossary/${product.glossarySlug}`
              : `/search?q=${encodeURIComponent(product.searchQuery)}`;

            return (
              <Link
                key={product.slug}
                href={href}
                className="group bg-white p-3 md:p-5 rounded-xl shadow-sm hover:shadow-lg transition-all text-center border border-gray-100 hover:border-green-200"
              >
                <span className="text-3xl md:text-4xl block mb-2 md:mb-3">{product.icon}</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 mb-0.5 md:mb-1 text-xs md:text-sm">
                  {product.name}
                </h3>
                <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2 hidden sm:block">{product.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Additional resources - scrollable on mobile */}
        <div className="mt-6 md:mt-10 flex overflow-x-auto pb-2 md:pb-0 md:flex-wrap md:justify-center gap-3 md:gap-4 scrollbar-hide">
          <Link
            href="/glossary/bioavailability"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-300 hover:text-green-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span>📊</span>
            Bioavailability
          </Link>
          <Link
            href="/tools/dosage-calculator"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-300 hover:text-green-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span>💊</span>
            Dosage Calculator
          </Link>
          <Link
            href="/glossary/full-spectrum"
            className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-green-300 hover:text-green-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span>🌿</span>
            Full vs Broad
          </Link>
          {brandCount && brandCount > 0 && (
            <Link
              href="/brands"
              className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 hover:bg-green-100 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <span>⭐</span>
              {brandCount} Reviews
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
