import { LocaleLink as Link } from '@/components/LocaleLink';

interface ComparisonCardProps {
  slug: string;
  title: string;
  excerpt?: string;
  itemA: {
    name: string;
    pros: string[];
  };
  itemB: {
    name: string;
    pros: string[];
  };
  winner?: string;
}

// Extract comparison info from article data
export function parseComparisonFromTitle(title: string): { itemA: string; itemB: string } {
  // Handle "X vs Y" pattern
  const vsMatch = title.match(/^(.+?)\s+vs\.?\s+(.+?)(?:\s*[:|-]|$)/i);
  if (vsMatch) {
    return {
      itemA: vsMatch[1].replace(/^CBD\s*/i, '').trim() || 'CBD',
      itemB: vsMatch[2].replace(/^CBD\s*/i, '').trim(),
    };
  }
  return { itemA: 'Option A', itemB: 'Option B' };
}

export function ComparisonCard({
  slug,
  title,
  excerpt,
  itemA,
  itemB,
  winner,
}: ComparisonCardProps) {
  return (
    <Link
      href={`/articles/${slug}`}
      className="block group"
    >
      <div className="border border-gray-200 rounded-xl overflow-hidden hover:border-green-500 hover:shadow-lg transition-all duration-200 bg-white">
        {/* Header with VS badge */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold text-sm truncate flex-1">{itemA.name}</span>
            <span className="mx-3 px-2 py-0.5 bg-white/20 rounded-full text-white text-xs font-bold">VS</span>
            <span className="text-white font-semibold text-sm truncate flex-1 text-right">{itemB.name}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 mb-2">
            {title}
          </h3>

          {excerpt && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{excerpt}</p>
          )}

          {/* Quick comparison */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{itemA.name}</p>
              {itemA.pros.slice(0, 2).map((pro, i) => (
                <p key={i} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span className="line-clamp-1">{pro}</span>
                </p>
              ))}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{itemB.name}</p>
              {itemB.pros.slice(0, 2).map((pro, i) => (
                <p key={i} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-green-500 mt-0.5">+</span>
                  <span className="line-clamp-1">{pro}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Winner badge if specified */}
          {winner && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Best for most: <span className="font-semibold text-green-700">{winner}</span>
              </p>
            </div>
          )}

          {/* Read more */}
          <p className="mt-3 text-sm font-medium text-green-600 group-hover:text-green-700">
            Read full comparison →
          </p>
        </div>
      </div>
    </Link>
  );
}

// Simple version for sidebar/list display
export function ComparisonCardSimple({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const { itemA, itemB } = parseComparisonFromTitle(title);

  return (
    <Link
      href={`/articles/${slug}`}
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
    >
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
        <span className="text-white text-xs font-bold">VS</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 truncate">
          {itemA} vs {itemB}
        </p>
        <p className="text-xs text-gray-500">Comparison guide</p>
      </div>
      <span className="text-gray-400 group-hover:text-green-600">→</span>
    </Link>
  );
}
