import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Topics | CBD Portal',
  description: 'Explore our comprehensive CBD knowledge base. Browse articles on CBD basics, products, guides, science, cannabinoids, terpenes, pet CBD, and more.',
  alternates: {
    canonical: '/categories',
  },
};

// Category configuration with styling and organization
const CATEGORY_CONFIG: Record<string, {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
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
    tier: 'main',
    order: 1,
  },
  'products': {
    icon: '🧴',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    tier: 'main',
    order: 2,
  },
  'guides': {
    icon: '📖',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    tier: 'main',
    order: 3,
  },
  'science': {
    icon: '🔬',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    tier: 'main',
    order: 4,
  },
  'legal': {
    icon: '⚖️',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-slate-400',
    tier: 'main',
    order: 5,
  },
  'safety-quality': {
    icon: '🛡️',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverBorder: 'hover:border-red-400',
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
    tier: 'specialty',
    order: 1,
  },
  'terpenes': {
    icon: '🌸',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverBorder: 'hover:border-pink-400',
    tier: 'specialty',
    order: 2,
  },
  'hemp-cultivation': {
    icon: '🌱',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverBorder: 'hover:border-green-400',
    tier: 'specialty',
    order: 3,
  },
  'comparisons': {
    icon: '⚖️',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    hoverBorder: 'hover:border-amber-400',
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
    tier: 'audience',
    order: 1,
  },
  'demographics': {
    icon: '👥',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    hoverBorder: 'hover:border-teal-400',
    tier: 'audience',
    order: 2,
  },
  'faq': {
    icon: '❓',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hoverBorder: 'hover:border-yellow-400',
    tier: 'audience',
    order: 3,
  },
  'research-studies': {
    icon: '📊',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-400',
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
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Browse Topics</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore our comprehensive CBD knowledge base with {totalArticles}+ evidence-based articles
        </p>
      </div>

      {/* Featured: Health Conditions */}
      <Link
        href="/categories/conditions"
        className="block mb-10 group"
      >
        <div className="relative overflow-hidden rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 transition-all hover:border-green-400 hover:shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">🏥</span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Health Conditions</h2>
                  <span className="text-sm text-green-700 font-medium">
                    {conditionsCount || 39} conditions covered
                  </span>
                </div>
              </div>
              <p className="text-gray-600 max-w-xl">
                Research-backed information on how CBD may help with anxiety, pain, sleep, inflammation, and 35+ other health conditions. Each guide includes scientific evidence and practical guidance.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-green-700 font-medium group-hover:translate-x-1 transition-transform">
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
                className="px-3 py-1 bg-white/70 rounded-full text-sm text-gray-700 border border-green-100"
              >
                {condition}
              </span>
            ))}
            <span className="px-3 py-1 bg-green-100 rounded-full text-sm text-green-700 font-medium">
              +{(conditionsCount || 39) - 6} more
            </span>
          </div>
        </div>
      </Link>

      {/* Main Categories Grid */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-0.5 bg-green-500"></span>
          Learn About CBD
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`rounded-xl border-2 p-5 transition-all hover:shadow-md ${category.style.bgColor} ${category.style.borderColor} ${category.style.hoverBorder}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{category.style.icon}</span>
                <div>
                  <h3 className={`font-bold ${category.style.color}`}>{category.name}</h3>
                  <span className="text-sm text-gray-500">
                    {category.articleCount > 0 ? (
                      <>{category.articleCount} articles</>
                    ) : (
                      <span className="text-amber-600">Coming soon</span>
                    )}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Specialty Topics */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-0.5 bg-purple-500"></span>
          Specialty Topics
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {specialtyCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`rounded-xl border-2 p-4 transition-all hover:shadow-md ${category.style.bgColor} ${category.style.borderColor} ${category.style.hoverBorder}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{category.style.icon}</span>
                <h3 className={`font-semibold text-sm ${category.style.color}`}>{category.name}</h3>
              </div>
              <span className="text-xs text-gray-500">
                {category.articleCount > 0 ? (
                  <>{category.articleCount} articles</>
                ) : (
                  <span className="text-amber-600">Coming soon</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Audience & Quick Info */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-0.5 bg-orange-500"></span>
          Audience & Quick Info
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {audienceCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={`rounded-xl border-2 p-4 transition-all hover:shadow-md ${category.style.bgColor} ${category.style.borderColor} ${category.style.hoverBorder}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{category.style.icon}</span>
                <h3 className={`font-semibold text-sm ${category.style.color}`}>{category.name}</h3>
              </div>
              <span className="text-xs text-gray-500">
                {category.articleCount > 0 ? (
                  <>{category.articleCount} articles</>
                ) : (
                  <span className="text-amber-600">Coming soon</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-center mb-6">Evidence-Based Information</h2>
        <div className="grid sm:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600">{totalArticles}+</div>
            <div className="text-sm text-gray-600">In-Depth Articles</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{conditionsCount || 39}</div>
            <div className="text-sm text-gray-600">Health Conditions</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{researchCount || 771}+</div>
            <div className="text-sm text-gray-600">Research Studies</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">15</div>
            <div className="text-sm text-gray-600">Topic Categories</div>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-center mt-6">
          All information is backed by peer-reviewed research and regularly updated
        </p>
      </div>
    </div>
  );
}
