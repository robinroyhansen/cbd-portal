'use client';

import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-5xl mb-4">⚙️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Error
        </h2>
        <p className="text-gray-600 mb-4">
          Something went wrong in the admin area.
        </p>
        {error.message && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-6 font-mono">
            {error.message}
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Retry
          </button>
          <Link
            href="/admin"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Admin Home
          </Link>
        </div>
      </div>
    </div>
  );
}
