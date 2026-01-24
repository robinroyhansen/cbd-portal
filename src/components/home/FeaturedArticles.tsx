import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function FeaturedArticles() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from('kb_articles')
    .select(`
      slug, title, meta_description, reading_time, updated_at,
      category:kb_categories(name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6);

  if (!articles || articles.length === 0) return null;

  const [featured, ...rest] = articles;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Expert Guides
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Latest Articles</h2>
            <p className="text-gray-600">Evidence-based CBD guides, research analysis, and expert insights</p>
          </div>
          <Link
            href="/articles"
            className="hidden md:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group"
          >
            View all articles
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Featured large card */}
          <div className="md:col-span-2 md:row-span-2">
            <Link
              href={`/articles/${featured.slug}`}
              className="group block h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Gradient accent */}
              <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <div className="p-6 md:p-8 h-full flex flex-col">
                {featured.category && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4 w-fit">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {featured.category.name}
                  </span>
                )}
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-4">
                  {featured.title}
                </h3>
                <p className="text-gray-600 mb-6 flex-1 text-base md:text-lg leading-relaxed">{featured.meta_description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {featured.reading_time && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {featured.reading_time}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(featured.updated_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-blue-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Read article
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Smaller cards */}
          {rest.slice(0, 4).map((article, index) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 md:p-6 border border-gray-100 hover:border-blue-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {article.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mb-3">
                  {article.category.name}
                </span>
              )}
              <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{article.meta_description}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{article.reading_time}</span>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 md:hidden">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            View all articles
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
