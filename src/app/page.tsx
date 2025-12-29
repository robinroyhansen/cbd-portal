import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';

type Article = Database['public']['Tables']['kb_articles']['Row'];
type Category = Database['public']['Tables']['kb_categories']['Row'];

export default async function HomePage() {
  const supabase = await createClient();

  const { data: featuredData } = await supabase
    .from('kb_articles')
    .select('id, title, slug, excerpt, published_at, reading_time, category:kb_categories(name, slug)')
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(3);

  const featuredArticles = featuredData as (Pick<Article, 'id' | 'title' | 'slug' | 'excerpt' | 'published_at' | 'reading_time'> & {
    category: { name: string; slug: string } | null;
  })[] | null;

  const { data: latestData } = await supabase
    .from('kb_articles')
    .select('id, title, slug, excerpt, published_at, reading_time, category:kb_categories(name, slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6);

  const latestArticles = latestData as (Pick<Article, 'id' | 'title' | 'slug' | 'excerpt' | 'published_at' | 'reading_time'> & {
    category: { name: string; slug: string } | null;
  })[] | null;

  const { data: categoriesData } = await supabase
    .from('kb_categories')
    .select('id, name, slug, description, article_count')
    .order('article_count', { ascending: false })
    .limit(6);

  const categories = categoriesData as Pick<Category, 'id' | 'name' | 'slug' | 'description' | 'article_count'>[] | null;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Evidence-Based
              <span className="block text-primary-600">CBD Information</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Your trusted source for scientifically-backed information about
              CBD. Explore peer-reviewed research, expert insights, and
              practical guidance.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/articles"
                className="rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-primary-700"
              >
                Browse Articles
              </Link>
              <Link
                href="/research"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                View Research
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      {featuredArticles && featuredArticles.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Featured Articles
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-gray-900">
              Explore Topics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="rounded-lg border border-gray-200 bg-white p-6 transition hover:border-primary-300 hover:shadow-md"
                >
                  <h3 className="font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {category.description}
                  </p>
                  <p className="mt-3 text-xs text-primary-600">
                    {category.article_count} articles →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {latestArticles && latestArticles.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Latest Articles
              </h2>
              <Link
                href="/articles"
                className="text-primary-600 hover:text-primary-700"
              >
                View all →
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Signals */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-primary-600">100+</div>
              <div className="mt-2 text-gray-600">Research Citations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">
                Peer-Reviewed
              </div>
              <div className="mt-2 text-gray-600">Sources Only</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600">
                Updated
              </div>
              <div className="mt-2 text-gray-600">Regularly</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArticleCard({ article }: { article: any }) {
  return (
    <article className="group rounded-lg border border-gray-200 bg-white p-6 transition hover:border-primary-300 hover:shadow-md">
      {article.category && (
        <Link
          href={`/categories/${article.category.slug}`}
          className="text-xs font-medium uppercase tracking-wide text-primary-600"
        >
          {article.category.name}
        </Link>
      )}
      <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-primary-600">
        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
        {article.excerpt}
      </p>
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        {article.reading_time && <span>{article.reading_time} min read</span>}
        {article.published_at && (
          <span>
            {new Date(article.published_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        )}
      </div>
    </article>
  );
}
