import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { PET_CATEGORY_META, categorizePetArticles } from '@/lib/pets';
import { getHreflangAlternates } from '@/components/HreflangTags';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'CBD for Birds | Parrots, Finches & Avian Guide | CBD Portal',
    description: 'CBD guides for birds: anxiety, feather plucking, stress, and more. Avian-specific safety information and dosing guidance for parrots and pet birds.',
    alternates: getHreflangAlternates('/pets/birds'),
  };
}

export default async function BirdsPage() {
  const supabase = await createClient();
  const category = PET_CATEGORY_META.birds;

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
      .or('slug.like.bird-%,slug.eq.birds,slug.eq.parrots,slug.eq.feather-plucking')
      .order('name'),
  ]);

  const allArticles = articlesResult.data || [];
  const conditions = conditionsResult.data || [];
  const categorized = categorizePetArticles(allArticles);
  const articles = categorized.birds;

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Pets', url: 'https://cbd-portal.vercel.app/pets' },
    { name: 'Birds', url: 'https://cbd-portal.vercel.app/pets/birds' }
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
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">CBD for Birds</h1>
                <p className={`${category.color} font-semibold`}>{articles.length} articles • {conditions.length} conditions</p>
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-4">
              {category.description}. Birds are highly sensitive creatures that require specialized
              knowledge when considering any supplement, including CBD.
            </p>
            <div className="bg-white/60 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Critical Note:</strong> {category.safetyNote}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/tools/animal-dosage-calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors"
              >
                <span>💊</span>
                Pet Dosage Calculator
              </Link>
              <Link
                href="/pets"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-sky-700 rounded-xl font-semibold border-2 border-sky-300 hover:bg-sky-50 transition-colors"
              >
                <span>🐾</span>
                All Pets
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bird Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bird Types</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { icon: '🦜', name: 'Parrots' },
            { icon: '🐦', name: 'Finches' },
            { icon: '🦅', name: 'Cockatoos' },
            { icon: '🐤', name: 'Budgies' },
            { icon: '🦆', name: 'Other Birds' },
          ].map((bird) => (
            <div
              key={bird.name}
              className="p-4 bg-white rounded-lg border border-gray-200 text-center hover:border-sky-300 hover:shadow-sm transition-all"
            >
              <span className="text-3xl block mb-2">{bird.icon}</span>
              <span className="font-medium text-sm text-gray-700">{bird.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bird Conditions */}
      {conditions.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Avian Conditions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {conditions.map((condition) => (
              <Link
                key={condition.slug}
                href={`/conditions/${condition.slug}`}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-sky-300 hover:shadow-md transition-all group"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-sky-700 text-sm mb-1">
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

      {/* Bird Articles */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bird CBD Articles</h2>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="p-5 bg-white rounded-xl border border-gray-200 hover:border-sky-300 hover:shadow-lg transition-all"
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
          <p className="text-gray-500">No bird-specific articles yet. Check back soon!</p>
        )}
      </section>

      {/* Common Topics */}
      <section className="mb-12">
        <div className="bg-sky-50 border-2 border-sky-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Common Avian Concerns</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '😰', label: 'Anxiety & Stress', desc: 'New environments, loud noises' },
              { icon: '🪶', label: 'Feather Plucking', desc: 'Self-destructive behavior' },
              { icon: '💤', label: 'Sleep Issues', desc: 'Night frights, restlessness' },
              { icon: '🍽️', label: 'Appetite', desc: 'Picky eating, weight loss' },
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

      {/* Safety Warning */}
      <section className="mb-12">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🚨</span>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Critical Safety Information for Birds</h3>
              <ul className="text-red-800 space-y-2 text-sm">
                <li>• Birds have extremely sensitive respiratory systems - avoid any aerosolized products</li>
                <li>• Avian metabolisms are much faster than mammals - doses must be tiny</li>
                <li>• Always consult an avian veterinarian before giving any supplement</li>
                <li>• Never use products containing THC - it can be fatal to birds</li>
                <li>• Watch for signs of distress including lethargy, fluffed feathers, or loss of appetite</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border-2 border-sky-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Consult Your Avian Vet First</h3>
            <p className="text-gray-600">Birds require specialized care - always seek professional guidance</p>
          </div>
          <Link
            href="/tools/animal-dosage-calculator"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors whitespace-nowrap"
          >
            Pet Dosage Calculator
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
