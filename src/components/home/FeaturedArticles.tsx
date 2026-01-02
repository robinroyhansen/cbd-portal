import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function FeaturedArticles() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from('articles')
    .select(`
      slug, title, meta_description, read_time, updated_at,
      category:categories(name, slug)
    `)
    .eq('published', true)
    .order('published_date', { ascending: false })
    .limit(6);

  if (!articles || articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Articles</h2>
            <p className="text-gray-600">Evidence-based CBD guides and research analysis</p>
          </div>
          <Link
            href="/articles"
            className="hidden md:block text-green-600 hover:text-green-800 font-medium"
          >
            View all articles →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Featured large card */}
          <div className="md:col-span-2 md:row-span-2">
            <Link
              href={`/articles/${featured.slug}`}
              className="block h-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-all overflow-hidden group"
            >
              <div className="p-8 h-full flex flex-col">
                {featured.category && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-4 w-fit">
                    {featured.category.name}
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-700 mb-4">
                  {featured.title}
                </h3>
                <p className="text-gray-600 mb-6 flex-1">{featured.meta_description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  {featured.read_time && <span>{featured.read_time}</span>}
                  <span>•</span>
                  <span>{new Date(featured.updated_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Smaller cards */}
          {rest.slice(0, 4).map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 group"
            >
              {article.category && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded mb-3">
                  {article.category.name}
                </span>
              )}
              <h3 className="font-semibold text-gray-900 group-hover:text-green-700 mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.meta_description}</p>
              <div className="text-xs text-gray-400">
                {article.read_time && article.read_time}
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link
            href="/articles"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            View all articles →
          </Link>
        </div>
      </div>
    </section>
  );
}