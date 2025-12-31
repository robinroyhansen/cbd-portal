import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q} | CBD Portal` : 'Search | CBD Portal',
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q || '';
  const supabase = await createClient();

  let articles: any[] = [];
  let categories: any[] = [];

  if (query.length >= 2) {
    // Search articles
    const { data: articleResults } = await supabase
      .from('kb_articles')
      .select('slug, title, excerpt, reading_time, updated_at')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .limit(20);

    // Search categories
    const { data: categoryResults } = await supabase
      .from('kb_categories')
      .select('slug, name, description')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);

    articles = articleResults || [];
    categories = categoryResults || [];
  }

  const totalResults = articles.length + categories.length;

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    'conditions': '🏥',
    'products': '🧴',
    'science': '🔬',
    'guides': '📚',
    'legal': '⚖️'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>

      {query ? (
        <>
          <p className="text-gray-600 mb-8">
            {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
          </p>

          {/* Categories */}
          {categories.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-500 mb-4">Categories</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center gap-3 p-4 border rounded-lg hover:border-green-400 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl">{categoryIcons[cat.slug] || '📄'}</span>
                    <div>
                      <h3 className="font-semibold">{cat.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{cat.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Articles */}
          {articles.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-500 mb-4">Articles</h2>
              <div className="space-y-4">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/articles/${article.slug}`}
                    className="block p-5 border rounded-lg hover:border-green-400 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{article.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {article.reading_time && <span>{article.reading_time} min read</span>}
                      <span>Updated {new Date(article.updated_at).toLocaleDateString('en-GB')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No results found for "{query}"</p>
              <p className="text-sm text-gray-400">Try different keywords or browse our categories</p>
              <Link
                href="/categories"
                className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Browse Categories
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Enter a search term to find articles</p>
        </div>
      )}
    </div>
  );
}