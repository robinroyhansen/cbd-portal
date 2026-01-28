import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';
import { PET_CATEGORIES, categorizePetArticles, getPetCategoryStats, PetType } from '@/lib/pets';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { getLanguage } from '@/lib/get-language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

interface Props {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  return {
    title: t('petsPage.metaTitle') || 'CBD for Pets | Complete Guide for Dogs, Cats, Horses & More | CBD Portal',
    description: t('petsPage.metaDescription') || 'Comprehensive CBD guides for pets: 78+ articles and 40+ conditions covering dogs, cats, horses, birds, and small animals. Dosage calculators, safety info, and veterinary perspectives.',
    alternates: getHreflangAlternates('/pets'),
  };
}

interface Condition {
  slug: string;
  name: string;
  display_name: string;
  short_description: string | null;
}

export default async function PetsHubPage({ searchParams }: Props) {
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  const supabase = await createClient();

  // Get pets category for articles
  const { data: category } = await supabase
    .from('kb_categories')
    .select('id')
    .eq('slug', 'pets')
    .single();

  // Fetch articles and conditions in parallel
  const [articlesResult, conditionsResult] = await Promise.all([
    supabase
      .from('kb_articles')
      .select('slug, title, excerpt, reading_time')
      .eq('category_id', category?.id)
      .eq('status', 'published')
      .order('title'),
    supabase
      .from('kb_conditions')
      .select('slug, name, display_name, short_description')
      .eq('category', 'pets')
      .order('name'),
  ]);

  const articles = articlesResult.data || [];
  const conditions = conditionsResult.data || [];
  const categorizedArticles = categorizePetArticles(articles);
  const stats = getPetCategoryStats(categorizedArticles);

  // Categorize conditions by pet type
  const categorizeConditions = (conds: Condition[]) => {
    const result: Record<PetType, Condition[]> = {
      dogs: [],
      cats: [],
      horses: [],
      birds: [],
      'small-pets': [],
      general: [],
    };

    for (const condition of conds) {
      const slug = condition.slug.toLowerCase();
      if (slug.startsWith('dog-') || slug === 'puppies' || slug === 'aggressive-dogs' || slug === 'senior-dogs') {
        result.dogs.push(condition);
      } else if (slug.startsWith('cat-') || slug === 'senior-cats') {
        result.cats.push(condition);
      } else if (slug.startsWith('horse-')) {
        result.horses.push(condition);
      } else if (slug.startsWith('bird-') || slug === 'birds' || slug === 'parrots' || slug === 'feather-plucking') {
        result.birds.push(condition);
      } else if (['ferrets', 'hamsters', 'rabbits', 'guinea-pigs', 'reptiles', 'small-pets'].includes(slug)) {
        result['small-pets'].push(condition);
      } else {
        result.general.push(condition);
      }
    }
    return result;
  };

  const categorizedConditions = categorizeConditions(conditions);

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'CBD for Pets', url: 'https://cbd-portal.vercel.app/pets' }
  ];

  // Species sections for display
  const speciesSections = [
    { id: 'dogs' as PetType, href: '/pets/dogs' },
    { id: 'cats' as PetType, href: '/pets/cats' },
    { id: 'horses' as PetType, href: '/pets/horses' },
    { id: 'small-pets' as PetType, href: '/pets/small-pets' },
    { id: 'birds' as PetType, href: '/pets/birds' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl border-2 border-orange-200 p-6 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl md:text-6xl">🐾</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{t('petsPage.title')}</h1>
                <p className="text-orange-700 font-semibold">{stats.total} {t('petsPage.articles')} • {conditions.length} {t('petsPage.conditions')}</p>
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-6">{t('petsPage.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/tools/animal-dosage-calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors"
              >
                <span>💊</span>
                {t('petsPage.petDosageCalculator')}
              </Link>
              <Link
                href="/research?topic=veterinary"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-orange-700 rounded-xl font-semibold border-2 border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <span>🔬</span>
                {t('petsPage.petResearchStudies')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Species Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('petsPage.browseByPetType')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {speciesSections.map(({ id, href }) => {
            const category = PET_CATEGORIES.find(c => c.id === id)!;
            const articleCount = categorizedArticles[id]?.length || 0;
            const conditionCount = categorizedConditions[id]?.length || 0;

            return (
              <Link
                key={id}
                href={href}
                className={`group p-5 rounded-xl border-2 ${category.borderColor} ${category.bgColor} hover:shadow-lg transition-all`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{category.icon}</span>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold ${category.color} group-hover:underline`}>
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 mb-3">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {articleCount > 0 && (
                        <span className="px-2 py-1 bg-white/70 rounded-full text-gray-600">
                          {articleCount} {t('petsPage.articles')}
                        </span>
                      )}
                      {conditionCount > 0 && (
                        <span className="px-2 py-1 bg-white/70 rounded-full text-gray-600">
                          {conditionCount} {t('petsPage.conditions')}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Popular Pet Conditions */}
      {conditions.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('petsPage.popularConditions')}</h2>
            <Link
              href="/conditions?category=pets"
              className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              {t('petsPage.viewAll')} {conditions.length}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {conditions.slice(0, 15).map((condition) => (
              <Link
                key={condition.slug}
                href={`/conditions/${condition.slug}`}
                className="p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all text-center group"
              >
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-700">
                  {condition.display_name || condition.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Pet Articles by Category */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('petsPage.latestArticles')}</h2>
        <div className="space-y-8">
          {speciesSections.map(({ id, href }) => {
            const category = PET_CATEGORIES.find(c => c.id === id)!;
            const sectionArticles = categorizedArticles[id] || [];

            if (sectionArticles.length === 0) return null;

            return (
              <div key={id}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className={`text-lg font-bold ${category.color}`}>{category.name}</h3>
                  </div>
                  <Link
                    href={href}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    {t('petsPage.seeAll')} {sectionArticles.length}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sectionArticles.slice(0, 3).map((article) => (
                    <Link
                      key={article.slug}
                      href={`/articles/${article.slug}`}
                      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
                    >
                      <h4 className="font-medium text-gray-900 line-clamp-2 text-sm mb-2">
                        {article.title}
                      </h4>
                      {article.excerpt && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Safety Notice */}
      <section className="mb-12">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">{t('petsPage.safetyTitle')}</h3>
              <ul className="text-blue-800 space-y-2 text-sm">
                <li>• {t('petsPage.safetyConsultVet')}</li>
                <li>• {t('petsPage.safetyHumanProducts')}</li>
                <li>• {t('petsPage.safetyCats')}</li>
                <li>• {t('petsPage.safetyLowDose')}</li>
                <li>• {t('petsPage.safetyHorses')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{t('petsPage.notSureTitle')}</h3>
            <p className="text-gray-600">{t('petsPage.notSureDesc')}</p>
          </div>
          <Link
            href="/tools/animal-dosage-calculator"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            {t('petsPage.petDosageCalculator')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
