import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/BreadcrumbSchema';

interface Props {
  params: Promise<{ slug: string }>;
}

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
      canonical: `/categories/${params.slug}`,
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

  const breadcrumbs = [
    { name: 'Home', url: 'https://cbd-portal.vercel.app' },
    { name: 'Topics', url: 'https://cbd-portal.vercel.app/categories' },
    { name: category.name, url: `https://cbd-portal.vercel.app/categories/${slug}` }
  ];

  // Add visual styling for category
  const categoryStyles: Record<string, { icon: string; color: string }> = {
    'conditions': { icon: '🏥', color: 'green' },
    'products': { icon: '🧴', color: 'blue' },
    'science': { icon: '🔬', color: 'purple' },
    'guides': { icon: '📚', color: 'orange' },
    'legal': { icon: '⚖️', color: 'gray' }
  };

  const style = categoryStyles[category.slug] || categoryStyles.legal;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumbs items={breadcrumbs} />

      <div className="flex items-center gap-3 mb-4">
        {style.icon && <span className="text-4xl">{style.icon}</span>}
        <h1 className="text-4xl font-bold">{category.name}</h1>
      </div>

      <p className="text-xl text-gray-600 mb-8">{category.description}</p>

      <div className="grid gap-12 lg:grid-cols-4">
        {/* Sidebar with categories */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <h2 className="mb-4 text-lg font-semibold">Browse Topics</h2>
            <nav className="space-y-2">
              <Link
                href="/categories"
                className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                All Topics
                <span className="ml-2 text-xs text-gray-400">({articleCounts?.length || 0})</span>
              </Link>
              {allCategories?.map((cat) => {
                const count = countMap[cat.id] || 0;
                return (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className={`block rounded-lg px-4 py-2 text-sm transition ${
                      cat.slug === slug
                        ? 'bg-green-50 font-medium text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
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
                  className="block border rounded-lg p-5 bg-white hover:shadow-md hover:border-green-300 transition-all"
                >
                  <h2 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-green-700">
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
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">No articles in this category yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
