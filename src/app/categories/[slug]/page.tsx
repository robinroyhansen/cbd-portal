import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';

type Article = Database['public']['Tables']['kb_articles']['Row'];
type Category = Database['public']['Tables']['kb_categories']['Row'];

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('kb_categories')
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle();

  const category = data as Pick<Category, 'name' | 'description'> | null;

  if (!category) {
    return { title: 'Category Not Found' };
  }

  const baseUrl = 'https://cbd-portal.vercel.app';

  return {
    title: `${category.name} - CBD Research & Information | CBD Knowledge Base`,
    description: category.description || `Evidence-based articles about ${category.name} and CBD. Research-backed information from peer-reviewed studies.`,
    alternates: {
      canonical: `${baseUrl}/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch category
  const { data: categoryData } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  const category = categoryData as Category | null;

  if (!category) {
    notFound();
  }

  // Fetch articles in this category
  const { data: articlesData } = await supabase
    .from('kb_articles')
    .select('id, title, slug, excerpt, published_at, reading_time, featured_image')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('published_at', { ascending: false });

  const articles = articlesData as Pick<Article, 'id' | 'title' | 'slug' | 'excerpt' | 'published_at' | 'reading_time' | 'featured_image'>[] | null;

  // Fetch all categories for sidebar
  const { data: categoriesData } = await supabase
    .from('kb_categories')
    .select('id, name, slug, article_count')
    .gt('article_count', 0)
    .order('name');

  const categories = categoriesData as Pick<Category, 'id' | 'name' | 'slug' | 'article_count'>[] | null;

  const baseUrl = 'https://cbd-portal.vercel.app';

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: `${baseUrl}/articles`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `${baseUrl}/categories/${slug}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/articles" className="hover:text-primary-600">
            Articles
          </Link>
          <span className="mx-2">/</span>
          <span>{category.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-4 text-lg text-gray-600">{category.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            {category.article_count} {category.article_count === 1 ? 'article' : 'articles'}
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
                  className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  All Articles
                </Link>
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className={`block rounded-lg px-4 py-2 text-sm transition ${
                      cat.slug === slug
                        ? 'bg-primary-50 font-medium text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-2 text-xs text-gray-400">
                      ({cat.article_count})
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
                {articles.map((article) => (
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
                      <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
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
                  No articles in this category yet. Check back soon!
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
