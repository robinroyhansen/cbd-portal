'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';

export default function ResearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-5xl mb-4">🔬</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Unable to load research
        </h2>
        <p className="text-gray-600 mb-6">
          There was a problem loading the research data. This might be a temporary issue.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Retry
          </button>
          <Link
            href="/"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
