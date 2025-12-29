'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export default function SearchPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function searchArticles() {
      if (!query.trim()) {
        setArticles([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Search in titles, descriptions, and tags
        const { data, error } = await supabase
          .from('kb_articles')
          .select('*')
          .or(
            `title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query.toLowerCase()}}`
          )
          .order('created_at', { ascending: false });

        if (error) throw error;

        setArticles(data || []);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search articles. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    searchArticles();
  }, [query, supabase]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Search Results
        </h1>
        {query && (
          <p className="mt-2 text-lg text-gray-600">
            Showing results for: <span className="font-semibold">{query}</span>
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No results found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {query
              ? `Try adjusting your search terms or browse our articles.`
              : 'Enter a search term to find articles.'}
          </p>
          <div className="mt-6">
            <a
              href="/articles"
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              Browse All Articles
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4">
                <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-0.5 text-xs font-medium text-primary-700">
                  {article.category}
                </span>
              </div>
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                <a
                  href={`/articles/${article.slug}`}
                  className="hover:text-primary-600"
                >
                  {article.title}
                </a>
              </h2>
              <p className="mb-4 text-gray-600 line-clamp-3">
                {article.description}
              </p>
              <div className="flex items-center justify-between">
                <time className="text-sm text-gray-500">
                  {new Date(article.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <a
                  href={`/articles/${article.slug}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Read more →
                </a>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Related searches */}
      {!loading && query && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Related Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {['CBD Oil', 'Anxiety', 'Pain Relief', 'Sleep', 'Dosage', 'Research', 'Benefits'].map(
              (term) => (
                <a
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {term}
                </a>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}