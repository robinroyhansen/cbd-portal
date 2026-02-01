'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';
import { ComparisonCardSimple } from './ComparisonCard';

interface Comparison {
  slug: string;
  title: string;
  excerpt?: string;
}

interface RelatedComparisonsProps {
  comparisons: Comparison[];
  title?: string;
}

export function RelatedComparisons({
  comparisons,
  title = 'Related Comparisons',
}: RelatedComparisonsProps) {
  if (!comparisons || comparisons.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        {title}
      </h2>
      <div className="space-y-3">
        {comparisons.map((comparison) => (
          <ComparisonCardSimple
            key={comparison.slug}
            slug={comparison.slug}
            title={comparison.title}
          />
        ))}
      </div>
    </section>
  );
}

// Visual comparison showcase for homepage or category pages
export function ComparisonShowcase({
  comparisons,
  title = 'CBD Comparisons',
  description = 'Make informed decisions with our in-depth comparison guides',
}: RelatedComparisonsProps & { description?: string }) {
  if (!comparisons || comparisons.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((comparison) => (
            <ComparisonCardFull
              key={comparison.slug}
              slug={comparison.slug}
              title={comparison.title}
              excerpt={comparison.excerpt}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/categories/comparisons"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            View all comparisons
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Full card with visual VS design
function ComparisonCardFull({
  slug,
  title,
  excerpt,
}: Comparison) {
  // Parse the comparison items from title
  const parseItems = (title: string) => {
    const match = title.match(/^(.+?)\s+vs\.?\s+(.+?)(?:\s*[:|-]|$)/i);
    if (match) {
      return {
        itemA: match[1].trim(),
        itemB: match[2].split(':')[0].split('|')[0].trim(),
      };
    }
    return { itemA: 'Option A', itemB: 'Option B' };
  };

  const { itemA, itemB } = parseItems(title);

  return (
    <Link
      href={`/articles/${slug}`}
      className="block group"
    >
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-500 hover:shadow-xl transition-all duration-300">
        {/* Visual header */}
        <div className="relative h-24 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-white font-bold text-sm">{itemA}</span>
              </div>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-green-600 font-bold text-xs">VS</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-white font-bold text-sm">{itemB}</span>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-2 left-2 w-8 h-8 bg-white/10 rounded-full" />
          <div className="absolute bottom-2 right-2 w-12 h-12 bg-white/10 rounded-full" />
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2 line-clamp-2">
            {title}
          </h3>
          {excerpt && (
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{excerpt}</p>
          )}
          <span className="inline-flex items-center text-sm font-medium text-green-600 group-hover:text-green-700">
            Compare now
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
