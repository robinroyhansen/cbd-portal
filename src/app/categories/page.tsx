import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';
import { getHreflangAlternates } from '@/components/HreflangTags';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Browse Topics | CBD Portal',
    description: 'Explore our comprehensive CBD knowledge base. Browse articles on CBD basics, products, guides, science, cannabinoids, terpenes, pet CBD, and more.',
    alternates: getHreflangAlternates('/categories'),
  };
}

// Category configuration with styling and organization
const CATEGORY_CONFIG: Record<string, {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
  gradientFrom: string;
  gradientTo: string;
  tier: 'main' | 'specialty' | 'audience';
  order: number;
}> = {
  // Main Categories (core educational content)
  'cbd-basics': {
    icon: '📚',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-cyan-50',
    tier: 'main',
    order: 1,
  },
  'products': {
    icon: '🧴',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    gradientFrom: 'from-emerald-50',
    gradientTo: 'to-green-50',
    tier: 'main',
    order: 2,
  },
  'guides': {
    icon: '📖',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    gradientFrom: 'from-orange-50',
    gradientTo: 'to-amber-50',
    tier: 'main',
    order: 3,
  },
  'science': {
    icon: '🔬',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    gradientFrom: 'from-purple-50',
    gradientTo: 'to-violet-50',
    tier: 'main',
    order: 4,
  },
  'legal': {
    icon: '⚖️',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-slate-400',
    gradientFrom: 'from-slate-50',
    gradientTo: 'to-gray-50',
    tier: 'main',
    order: 5,
  },
  'safety-quality': {
    icon: '🛡️',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverBorder: 'hover:border-red-400',
    gradientFrom: 'from-red-50',
    gradientTo: 'to-rose-50',
    tier: 'main',
    order: 6,
  },

  // Specialty Topics (deep dives)
  'cannabinoids': {
    icon: '🧬',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-400',
    gradientFrom: 'from-indigo-50',
    gradientTo: 'to-purple-50',
    tier: 'specialty',
    order: 1,
  },
  'terpenes': {
    icon: '🌸',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverBorder: 'hover:border-pink-400',
    gradientFrom: 'from-pink-50',
    gradientTo: 'to-rose-50',
    tier: 'specialty',
    order: 2,
  },
  'hemp-cultivation': {
    icon: '🌱',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverBorder: 'hover:border-green-400',
    gradientFrom: 'from-green-50',
    gradientTo: 'to-emerald-50',
    tier: 'specialty',
    order: 3,
  },
  'comparisons': {
    icon: '⚖️',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400',
    gradientFrom: 'from-amber-50',
    gradientTo: 'to-yellow-50',
    tier: 'specialty',
    order: 4,
  },

  // Audience & Quick Info
  'pets': {
    icon: '🐾',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    gradientFrom: 'from-orange-50',
    gradientTo: 'to-amber-50',
    tier: 'audience',
    order: 1,
  },
  'demographics': {
    icon: '👥',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    hoverBorder: 'hover:border-teal-400',
    gradientFrom: 'from-teal-50',
    gradientTo: 'to-cyan-50',
    tier: 'audience',
    order: 2,
  },
  'faq': {
    icon: '❓',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hoverBorder: 'hover:border-yellow-400',
    gradientFrom: 'from-yellow-50',
    gradientTo: 'to-amber-50',
    tier: 'audience',
    order: 3,
  },
  'research-studies': {
    icon: '📊',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-400',
    gradientFrom: 'from-cyan-50',
    gradientTo: 'to-blue-50',
    tier: 'audience',
    order: 4,
  },

  // Health Conditions (special - links to /conditions)
  'conditions': {
    icon: '🏥',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverBorder: 'hover:border-green-400',
    gradientFrom: 'from-green-50',
    gradientTo: 'to-emerald-50',
    tier: 'main',
    order: 0,
  },
};

const DEFAULT_STYLE = {
  icon: '📄',
  color: 'text-gray-700',
  bgColor: 'bg-gray-50',
  borderColor: 'border-gray-200',
  hoverBorder: 'hover:border-gray-400',
  gradientFrom: 'from-gray-50',
  gradientTo: 'to-gray-100',
  tier: 'audience' as const,
  order: 99,
};

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Get all categories
  const { data: categories } = await supabase
    .from('kb_categories')
    .select('*')
    .order('name');

  // Get article counts per category
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('category_id')
    .eq('status', 'published');

  // Get conditions count
  const { count: conditionsCount } = await supabase
    .from('kb_conditions')
    .select('*', { count: 'exact', head: true });

  // Get research studies count
  const { count: researchCount } = await supabase
    .from('kb_research_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  // Count articles per category
  const countMap: Record<string, number> = {};
  articles?.forEach(a => {
    if (a.category_id) {
      countMap[a.category_id] = (countMap[a.category_id] || 0) + 1;
    }
  });

  // Process and sort categories
  const processedCategories = categories?.map(cat => ({
    ...cat,
    articleCount: countMap[cat.id] || 0,
    style: CATEGORY_CONFIG[cat.slug] || DEFAULT_STYLE,
  })) || [];

  // Split into tiers (exclude 'conditions' as it's handled separately)
  const mainCategories = processedCategories
    .filter(c => c.style.tier === 'main' && c.slug !== 'conditions')
    .sort((a, b) => a.style.order - b.style.order);

  const specialtyCategories = processedCategories
    .filter(c => c.style.tier === 'specialty')
    .sort((a, b) => a.style.order - b.style.order);

  const audienceCategories = processedCategories
    .filter(c => c.style.tier === 'audience')
    .sort((a, b) => a.style.order - b.style.order);

  const totalArticles = articles?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Header */}
      <div className="relative text-center mb-16 py-8">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl -z-10 botanical-pattern opacity-60" />

        <div className="relative z-10 py-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-sm font-medium mb-6">
            <span>🌿</span>
            Knowledge Base
          </span>

          <h1 className="hub-display-heading text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-4">
            Browse Topics
          </h1>

          <p className="hub-body-text text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore our comprehensive CBD knowledge base with <span className="font-semibold text-emerald-700">{totalArticles}+</span> evidence-based articles
          </p>
        </div>
      </div>

      {/* Featured: Health Conditions */}
      <Link
        href="/conditions"
        className="block mb-12 group"
      >
        <div className="relative overflow-hidden rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 transition-all duration-300 hover:border-green-400 hover:shadow-xl hover:-translate-y-1">
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 text-3xl opacity-10">✦</div>
          <div className="absolute bottom-8 right-16 text-xl opacity-5">✦</div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">🏥</span>
                <div>
                  <h2 className="hub-display-heading text-2xl sm:text-3xl text-gray-900">Health Conditions</h2>
                  <span className="text-sm text-green-700 font-medium hub-stat-number">
                    {conditionsCount || 39} conditions covered
                  </span>
                </div>
              </div>
              <p className="hub-body-text text-gray-600 max-w-xl leading-relaxed">
                Research-backed information on how CBD may help with anxiety, pain, sleep, inflammation, and 35+ other health conditions. Each guide includes scientific evidence and practical guidance.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-green-700 font-medium group-hover:translate-x-2 transition-transform duration-300">
              View all
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Popular conditions preview */}
          <div className="mt-6 flex flex-wrap gap-2">
            {['Anxiety', 'Pain', 'Sleep', 'Inflammation', 'Depression', 'Arthritis'].map(condition => (
              <span
                key={condition}
                className="px-3 py-1.5 bg-white/80 rounded-full text-sm text-gray-700 border border-green-100 shadow-sm"
              >
                {condition}
              </span>
            ))}
            <span className="px-3 py-1.5 bg-green-100 rounded-full text-sm text-green-700 font-medium">
              +{(conditionsCount || 39) - 6} more
            </span>
          </div>
        </div>
      </Link>

      {/* Main Categories Grid */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-green-500 rounded-full" />
          <h2 className="hub-display-heading text-2xl text-gray-900">Learn About CBD</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mainCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${category.style.gradientFrom} ${category.style.gradientTo} ${category.style.borderColor} ${category.style.hoverBorder}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${category.style.bgColor} group-hover:w-1.5 transition-all duration-200`} />

              <div className="flex items-start gap-4">
                <span className="text-3xl">{category.style.icon}</span>
                <div className="flex-1">
                  <h3 className={`hub-body-text font-bold text-lg ${category.style.color}`}>{category.name}</h3>
                  <span className="text-sm text-gray-500 hub-stat-number">
                    {category.articleCount > 0 ? (
                      <>{category.articleCount} articles</>
                    ) : (
                      <span className="text-amber-600">Coming soon</span>
                    )}
                  </span>
                </div>
              </div>

              <p className="hub-body-text text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                {category.description}
              </p>

              {/* Hover arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                <span className={`text-sm font-medium ${category.style.color}`}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Specialty Topics */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
          <h2 className="hub-display-heading text-2xl text-gray-900">Specialty Topics</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {specialtyCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`group relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-br ${category.style.gradientFrom} ${category.style.gradientTo} ${category.style.borderColor} ${category.style.hoverBorder}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{category.style.icon}</span>
                <h3 className={`hub-body-text font-semibold ${category.style.color}`}>{category.name}</h3>
              </div>
              <span className="text-xs text-gray-500 hub-stat-number">
                {category.articleCount > 0 ? (
                  <>{category.articleCount} articles</>
                ) : (
                  <span className="text-amber-600">Coming soon</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Audience & Quick Info */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full" />
          <h2 className="hub-display-heading text-2xl text-gray-900">Audience & Quick Info</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {audienceCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`group relative overflow-hidden rounded-xl border-2 p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 bg-gradient-to-br ${category.style.gradientFrom} ${category.style.gradientTo} ${category.style.borderColor} ${category.style.hoverBorder}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{category.style.icon}</span>
                <h3 className={`hub-body-text font-semibold ${category.style.color}`}>{category.name}</h3>
              </div>
              <span className="text-xs text-gray-500 hub-stat-number">
                {category.articleCount > 0 ? (
                  <>{category.articleCount} articles</>
                ) : (
                  <span className="text-amber-600">Coming soon</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-3xl p-10 border border-green-100">
        {/* Decorative pattern */}
        <div className="absolute inset-0 botanical-pattern opacity-40" />

        <div className="relative z-10">
          <h2 className="hub-display-heading text-2xl text-center text-gray-900 mb-8">Evidence-Based Information</h2>

          <div className="grid sm:grid-cols-4 gap-8 text-center">
            <div className="bg-white/60 rounded-2xl p-6 border border-green-100">
              <div className="hub-stat-number text-4xl font-bold text-emerald-600">{totalArticles}+</div>
              <div className="text-sm text-gray-600 mt-1 hub-body-text">In-Depth Articles</div>
            </div>
            <div className="bg-white/60 rounded-2xl p-6 border border-green-100">
              <div className="hub-stat-number text-4xl font-bold text-emerald-600">{conditionsCount || 39}</div>
              <div className="text-sm text-gray-600 mt-1 hub-body-text">Health Conditions</div>
            </div>
            <div className="bg-white/60 rounded-2xl p-6 border border-green-100">
              <div className="hub-stat-number text-4xl font-bold text-emerald-600">{researchCount || 771}+</div>
              <div className="text-sm text-gray-600 mt-1 hub-body-text">Research Studies</div>
            </div>
            <div className="bg-white/60 rounded-2xl p-6 border border-green-100">
              <div className="hub-stat-number text-4xl font-bold text-emerald-600">15</div>
              <div className="text-sm text-gray-600 mt-1 hub-body-text">Topic Categories</div>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mt-8 hub-body-text">
            All information is backed by peer-reviewed research and regularly updated
          </p>
        </div>
      </section>
    </div>
  );
}
