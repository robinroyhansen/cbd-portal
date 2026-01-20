import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CBD Product Finder | Coming Soon',
  description: 'Find the perfect CBD product for your needs. Our product finder tool is coming soon.',
};

export default function ProductFinderPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Product Finder Coming Soon
        </h1>
        <p className="text-gray-600 mb-8">
          We&apos;re building an intelligent product finder to help you discover
          the perfect CBD product based on your needs, preferences, and goals.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            In the meantime, try our other tools:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tools/dosage-calculator"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Dosage Calculator
            </Link>
            <Link
              href="/tools/interactions"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Drug Interactions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
