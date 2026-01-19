import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

interface Props {
  params: Promise<{ slug: string }>;
}

// Category configuration with styling - must match categories/page.tsx
const CATEGORY_CONFIG: Record<string, {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
  activeBg: string;
  activeText: string;
}> = {
  'cbd-basics': {
    icon: '📚',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverBorder: 'hover:border-blue-400',
    activeBg: 'bg-blue-50',
    activeText: 'text-blue-700',
  },
  'products': {
    icon: '🧴',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-400',
    activeBg: 'bg-emerald-50',
    activeText: 'text-emerald-700',
  },
  'guides': {
    icon: '📖',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverBorder: 'hover:border-orange-400',
    activeBg: 'bg-orange-50',
    activeText: 'text-orange-700',
  },
  'science': {
    icon: '🔬',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverBorder: 'hover:border-purple-400',
    activeBg: 'bg-purple-50',
    activeText: 'text-purple-700',
  },
  'legal': {
    icon: '⚖️',
    color: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    hoverBorder: 'hover:border-slate-400',
    activeBg: 'bg-slate-50',
    activeText: 'text-slate-700',
  },
  'cannabinoids': {
    icon: '🧬',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverBorder: 'hover:border-indigo-400',
    activeBg: 'bg-indigo-50',
    activeText: 'text-indigo-700',
  },
  'terpenes': {
    icon: '🌸',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverBorder: 'hover:border-pink-400',
    activeBg: 'bg-pink-50',
    activeText: 'text-pink-700',
  },
  'hemp-cultivation': {
    icon: '🌱',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverBorder: 'hover:border-green-400',
    activeBg: 'bg-green-50',
    activeText: 'text-green-700',
  },
  'conditions': {
    icon: '🏥',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverBorder: 'hover:border-red-400',
    activeBg: 'bg-red-50',
    activeText: 'text-red-700',
  },
  'research-studies': {
    icon: '📊',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    hoverBorder: 'hover:border-cyan-400',
    activeBg: 'bg-cyan-50',
    activeText: 'text-cyan-700',
  },
};

const DEFAULT_STYLE = {
  icon: '📄',
  color: 'text-gray-700',
  bgColor: 'bg-gray-50',
  borderColor: 'border-gray-200',
  hoverBorder: 'hover:border-gray-400',
  activeBg: 'bg-gray-100',
  activeText: 'text-gray-700',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from('kb_categories')
    .select('name, description, slug')
    .eq('slug', slug)
    .single();

  return {
    title: `${category?.name || 'Category'} | CBD Portal`,
    description: category?.description,
    alternates: {
      canonical: `/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get category
  const { data: category } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) notFound();

  // Get articles in this category
  const { data: articles } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt, reading_time, published_at, updated_at')
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Get all categories for sidebar
  const { data: allCategories } = await supabase
    .from('kb_categories')
    .select('id, name, slug')
    .order('name');

  // Get article counts for each category
  const { data: articleCounts } = await supabase
    .from('kb_articles')
    .select('category_id')
    .eq('status', 'published');

  const countMap: Record<string, number> = {};
  articleCounts?.forEach(a => {
    if (a.category_id) {
      countMap[a.category_id] = (countMap[a.category_id] || 0) + 1;
    }
  });

  const totalArticles = articleCounts?.length || 0;

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Topics', url: 'https://cbd-portal.vercel.app/categories' },
    { name: category.name, url: `https://cbd-portal.vercel.app/categories/${slug}` }
  ];

  const style = CATEGORY_CONFIG[category.slug] || DEFAULT_STYLE;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />

      {/* Category Header */}
      <div className={`rounded-xl border-2 p-6 mb-8 ${style.bgColor} ${style.borderColor}`}>
        <div className="flex items-center gap-4 mb-3">
          <span className="text-5xl">{style.icon}</span>
          <div>
            <h1 className={`text-3xl font-bold ${style.color}`}>{category.name}</h1>
            <span className="text-sm text-gray-500">
              {articles?.length || 0} articles
            </span>
          </div>
        </div>
        <p className="text-gray-600 max-w-2xl">{category.description}</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-4">
        {/* Sidebar with categories */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <h2 className="mb-4 text-lg font-semibold">Browse Topics</h2>
            <nav className="space-y-1">
              <Link
                href="/categories"
                className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                All Topics
                <span className="ml-2 text-xs text-gray-400">({totalArticles})</span>
              </Link>

              {/* Health Conditions - special link */}
              <Link
                href="/conditions"
                className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                🏥 Health Conditions
                <span className="ml-2 text-xs text-gray-400">(39)</span>
              </Link>

              <div className="my-2 border-t border-gray-200"></div>

              {allCategories?.map((cat) => {
                const count = countMap[cat.id] || 0;
                const catStyle = CATEGORY_CONFIG[cat.slug] || DEFAULT_STYLE;
                const isActive = cat.slug === slug;

                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className={`block rounded-lg px-4 py-2 text-sm transition ${
                      isActive
                        ? `${catStyle.activeBg} font-medium ${catStyle.activeText}`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{catStyle.icon}</span>
                    {cat.name}
                    <span className="ml-2 text-xs text-gray-400">({count})</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Articles grid */}
        <main className="lg:col-span-3">
          {articles && articles.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className={`block border-2 rounded-xl p-5 bg-white transition-all hover:shadow-md ${style.borderColor} ${style.hoverBorder}`}
                >
                  <h2 className="font-semibold text-lg mb-2 text-gray-900">
                    {article.title}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {article.reading_time && <span>{article.reading_time} min read</span>}
                    <span>•</span>
                    <span>{new Date(article.updated_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <span className="text-4xl mb-4 block">{style.icon}</span>
              <p className="text-gray-500 mb-2">No articles in this category yet.</p>
              <p className="text-sm text-gray-400">Check back soon for new content.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
