import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getCategories } from '@/lib/articles';
import { getLanguageFromHostname } from '@/lib/language';

export const metadata: Metadata = {
  title: 'Browse Topics',
  description:
    'Explore CBD articles organized by topic. Find research-backed information on health conditions, usage, and scientific evidence.',
  alternates: {
    canonical: 'https://cbd-portal.vercel.app/categories',
  },
};

export default async function CategoriesPage() {
  // Get hostname from headers to detect language
  const headersList = headers();
  const host = headersList.get('host') || 'localhost';
  const language = getLanguageFromHostname(host);

  const { data: categories } = await getCategories(language);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary-600">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>Topics</span>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Browse Topics
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Explore evidence-based CBD articles organized by health condition and topic
        </p>
      </header>

      {categories && categories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group rounded-lg border border-gray-200 bg-white p-6 transition hover:border-primary-300 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                {category.name}
              </h2>
              {category.description && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {category.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {category.article_count} {category.article_count === 1 ? 'article' : 'articles'}
                </span>
                <span className="text-primary-600 group-hover:text-primary-700">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">
            No categories available yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
