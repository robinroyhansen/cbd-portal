import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { PET_CATEGORY_META, categorizePetArticles } from '@/lib/pets';
import { getHreflangAlternates } from '@/components/HreflangTags';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CBD for Dogs | Complete Canine Guide | CBD Portal',
    description: 'Comprehensive CBD guides for dogs: anxiety, pain relief, seizures, hip dysplasia, and more. Vet-guided dosing, safety information, and research-backed recommendations.',
    alternates: getHreflangAlternates('/pets/dogs'),
  };
}

export default async function DogsPage() {
  const supabase = await createClient();
  const category = PET_CATEGORY_META.dogs;

  // Get pets category for articles
  const { data: articleCategory } = await supabase
    .from('kb_categories')
    .select('id')
    .eq('slug', 'pets')
    .single();

  // Fetch articles and conditions in parallel
  const [articlesResult, conditionsResult] = await Promise.all([
    supabase
      .from('kb_articles')
      .select('slug, title, excerpt, reading_time')
      .eq('category_id', articleCategory?.id)
      .eq('status', 'published')
      .order('title'),
    supabase
      .from('kb_conditions')
      .select('slug, name, display_name, short_description')
      .eq('category', 'pets')
      .or('slug.like.dog-%,slug.eq.puppies,slug.eq.aggressive-dogs,slug.eq.senior-dogs')
      .order('name'),
  ]);

  const allArticles = articlesResult.data || [];
  const conditions = conditionsResult.data || [];
  const categorized = categorizePetArticles(allArticles);
  const articles = categorized.dogs;

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Pets', url: 'https://cbd-portal.vercel.app/pets' },
    { name: 'Dogs', url: 'https://cbd-portal.vercel.app/pets/dogs' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section */}
      <div className={`${category.bgColor} rounded-2xl border-2 ${category.borderColor} p-6 md:p-10 mb-8`}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl md:text-6xl">{category.icon}</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">CBD for Dogs</h1>
                <p className={`${category.color} font-semibold`}>{articles.length} articles • {conditions.length} conditions</p>
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-4">
              {category.description}. From puppies to senior dogs, find research-backed information
              on CBD dosing, safety, and effectiveness for canine companions.
            </p>
            <div className="bg-white/60 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Safety Note:</strong> {category.safetyNote}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/tools/animal-dosage-calculator?species=dog"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors`}
              >
                <span>💊</span>
                Dog Dosage Calculator
              </Link>
              <Link
                href="/pets"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-amber-700 rounded-xl font-semibold border-2 border-amber-300 hover:bg-amber-50 transition-colors"
              >
                <span>🐾</span>
                All Pets
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dog Conditions */}
      {conditions.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dog Health Conditions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {conditions.map((condition) => (
              <Link
                key={condition.slug}
                href={`/conditions/${condition.slug}`}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-amber-700 text-sm mb-1">
                  {condition.display_name || condition.name}
                </h3>
                {condition.short_description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{condition.short_description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Dog Articles */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dog CBD Articles</h2>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="p-5 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all"
              >
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                )}
                {article.reading_time && (
                  <span className="text-xs text-gray-400">{article.reading_time} min read</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No dog-specific articles yet. Check back soon!</p>
        )}
      </section>

      {/* Common Topics */}
      <section className="mb-12">
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Common Uses of CBD for Dogs</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '😰', label: 'Anxiety & Stress', desc: 'Separation, thunderstorms' },
              { icon: '💪', label: 'Pain & Mobility', desc: 'Arthritis, hip dysplasia' },
              { icon: '⚡', label: 'Seizures', desc: 'Epilepsy management' },
              { icon: '🍽️', label: 'Appetite', desc: 'Nausea, picky eaters' },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-white/60 rounded-lg">
                <span className="text-2xl block mb-2">{item.icon}</span>
                <span className="font-medium text-sm text-gray-900 block">{item.label}</span>
                <span className="text-xs text-gray-500">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Calculate Your Dog&apos;s CBD Dose</h3>
            <p className="text-gray-600">Get personalized dosing based on your dog&apos;s weight and condition</p>
          </div>
          <Link
            href="/tools/animal-dosage-calculator?species=dog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            Dog Dosage Calculator
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
