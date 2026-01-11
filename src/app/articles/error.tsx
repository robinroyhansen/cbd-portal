'use client';

import Link from 'next/link';

export default function ArticlesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-5xl mb-4">📰</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Unable to load article
        </h2>
        <p className="text-gray-600 mb-6">
          There was a problem loading this article.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Retry
          </button>
          <Link
            href="/articles"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Browse articles
          </Link>
        </div>
      </div>
    </div>
  );
}
