import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getArticles, getCategories } from '@/lib/articles';
import { getLanguageFromHostname } from '@/lib/language';


export const metadata: Metadata = {
  title: 'All Articles',
  description:
    'Browse our complete collection of evidence-based articles about CBD, cannabidiol research, and wellness.',
};

export default async function ArticlesPage() {
  // Get hostname from headers to detect language
  const headersList = headers();
  const host = headersList.get('host') || 'localhost';
  const language = getLanguageFromHostname(host);

  // Fetch articles and categories for the detected language
  const { data: articles } = await getArticles(language);
  const { data: categories } = await getCategories(language);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          All Articles
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Evidence-based information about CBD, backed by scientific research.
        </p>
      </header>

      <div className="grid gap-12 lg:grid-cols-4">
        {/* Sidebar with categories */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Filter by Topic
            </h2>
            <nav className="space-y-2">
              <Link
                href="/articles"
                className="block rounded-lg bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700"
              >
                All Articles
              </Link>
              {categories?.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  {category.name}
                  <span className="ml-2 text-xs text-gray-400">
                    ({category.article_count})
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Articles grid */}
        <main className="lg:col-span-3">
          {articles && articles.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {articles.map((article: any) => (
                <article
                  key={article.id}
                  className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-primary-300 hover:shadow-md"
                >
                  {article.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {article.category && (
                      <Link
                        href={`/categories/${article.category.slug}`}
                        className="text-xs font-medium uppercase tracking-wide text-primary-600"
                      >
                        {article.category.name}
                      </Link>
                    )}
                    <h2 className="mt-2 text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                      <Link href={`/articles/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>
                    {article.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                      {article.reading_time && (
                        <span>{article.reading_time} min read</span>
                      )}
                      {article.published_at && (
                        <span>
                          {new Date(article.published_at).toLocaleDateString(
                            'en-GB',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500">
                No articles published yet. Check back soon!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
