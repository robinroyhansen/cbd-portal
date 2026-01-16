'use client';

import Link from 'next/link';

export default function StudyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-5xl mb-4">📄</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Study not available
        </h2>
        <p className="text-gray-600 mb-6">
          This study may have been removed, is still being processed, or the URL is incorrect.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Try again
          </button>
          <Link
            href="/research"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Browse all studies
          </Link>
        </div>
      </div>
    </div>
  );
}
