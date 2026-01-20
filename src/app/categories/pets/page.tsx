import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'CBD for Pets | Complete Guide for Dogs, Cats & Horses | CBD Portal',
  description: 'Comprehensive CBD guides for pets: 78 articles covering dogs, cats, horses, and small animals. Safety information, dosage calculators, and veterinary perspectives.',
  alternates: {
    canonical: '/categories/pets',
  },
};

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  reading_time: number | null;
}

interface AnimalSection {
  id: string;
  name: string;
  icon: string;
  description: string;
  articles: Article[];
  keywords: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

// Categorize articles by animal type based on title keywords
function categorizeArticles(articles: Article[]): AnimalSection[] {
  const sections: AnimalSection[] = [
    {
      id: 'dogs',
      name: 'Dogs',
      icon: '🐕',
      description: 'Complete CBD guides for canines of all sizes and ages',
      articles: [],
      keywords: ['dog', 'puppy', 'puppies', 'canine'],
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      id: 'cats',
      name: 'Cats',
      icon: '🐱',
      description: 'Feline-specific CBD information and safety guides',
      articles: [],
      keywords: ['cat', 'kitten', 'feline'],
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'horses',
      name: 'Horses',
      icon: '🐴',
      description: 'Equine CBD applications for performance and wellness',
      articles: [],
      keywords: ['horse', 'equine', 'mare', 'stallion'],
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
    {
      id: 'small-pets',
      name: 'Small Pets',
      icon: '🐰',
      description: 'Guides for rabbits, hamsters, guinea pigs, ferrets, birds, and more',
      articles: [],
      keywords: ['rabbit', 'guinea pig', 'ferret', 'bird', 'parrot', 'hamster', 'small pet'],
      color: 'text-pink-700',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
    },
    {
      id: 'general',
      name: 'All Pets',
      icon: '🐾',
      description: 'Universal pet CBD guides and safety information',
      articles: [],
      keywords: [],
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
  ];

  articles.forEach(article => {
    const titleLower = article.title.toLowerCase();
    let matched = false;

    for (const section of sections) {
      if (section.id === 'general') continue;

      if (section.keywords.some(kw => titleLower.includes(kw))) {
        section.articles.push(article);
        matched = true;
        break;
      }
    }

    if (!matched) {
      sections.find(s => s.id === 'general')!.articles.push(article);
    }
  });

  return sections;
}

export default async function PetsCategoryPage() {
  const supabase = await createClient();

  // Get pets category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', 'pets')
    .single();

  // Get all pet articles
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt, reading_time')
    .eq('category_id', category?.id)
    .eq('status', 'published')
    .order('title');

  const allArticles = articles || [];
  const sections = categorizeArticles(allArticles);
  const activeSections = sections.filter(s => s.articles.length > 0);

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Topics', url: 'https://cbd-portal.vercel.app/categories' },
    { name: 'CBD for Pets', url: 'https://cbd-portal.vercel.app/categories/pets' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 p-5 md:p-8 mb-6 md:mb-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl md:text-5xl">🐾</span>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900">CBD for Pets</h1>
              <p className="text-orange-700 font-medium text-sm md:text-base">{allArticles.length} comprehensive guides</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm md:text-base">
            Evidence-based CBD information for dogs, cats, horses, and small animals.
            Safety guides, dosage calculators, and veterinary perspectives.
          </p>
          <Link
            href="/tools/animal-dosage-calculator"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors text-sm md:text-base w-full md:w-auto md:self-start"
          >
            <span>🧮</span>
            Pet Dosage Calculator
          </Link>
        </div>
      </div>

      {/* Quick Navigation - Horizontally Scrollable on Mobile */}
      <nav className="mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 md:flex-wrap scrollbar-hide">
          {activeSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 ${section.borderColor} ${section.bgColor} hover:shadow-md transition-all text-sm font-medium ${section.color}`}
            >
              <span>{section.icon}</span>
              <span className="whitespace-nowrap">{section.name}</span>
              <span className="bg-white/70 px-2 py-0.5 rounded-full text-xs">{section.articles.length}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Animal Sections */}
      <div className="space-y-10 md:space-y-12">
        {activeSections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            {/* Section Header */}
            <div className={`${section.bgColor} rounded-xl border-2 ${section.borderColor} p-4 md:p-5 mb-4`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl">{section.icon}</span>
                <div>
                  <h2 className={`text-xl md:text-2xl font-bold ${section.color}`}>
                    CBD for {section.name}
                  </h2>
                  <p className="text-sm text-gray-600">{section.articles.length} articles • {section.description}</p>
                </div>
              </div>
            </div>

            {/* Articles Grid - Responsive */}
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {section.articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm md:text-base">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs md:text-sm text-gray-500 line-clamp-2 mb-2">
                      {article.excerpt}
                    </p>
                  )}
                  {article.reading_time && (
                    <span className="text-xs text-gray-400">{article.reading_time} min read</span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 md:mt-12 p-5 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Need help finding the right dose?</h3>
            <p className="text-gray-600 text-sm md:text-base">Species-specific CBD dosage recommendations for your pet</p>
          </div>
          <Link
            href="/tools/animal-dosage-calculator"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap w-full md:w-auto"
          >
            Calculate Pet Dosage
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Back to Top - Mobile Helper */}
      <div className="mt-8 text-center md:hidden">
        <a
          href="#"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Back to top
        </a>
      </div>
    </div>
  );
}
