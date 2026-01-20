import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function TrendingTopics() {
  const supabase = await createClient();

  // Get conditions with the most research (trending by research volume)
  const { data: trendingConditions } = await supabase
    .from('kb_conditions')
    .select('slug, name, display_name, research_count')
    .eq('is_published', true)
    .gt('research_count', 0)
    .order('research_count', { ascending: false })
    .limit(8);

  // Get popular glossary terms (by view count if available, otherwise by update)
  const { data: popularTerms } = await supabase
    .from('kb_glossary')
    .select('slug, term')
    .order('view_count', { ascending: false })
    .limit(6);

  // Static popular searches (common user queries)
  const popularSearches = [
    { label: 'CBD Dosage', href: '/tools/dosage-calculator' },
    { label: 'CBD vs THC', href: '/glossary/thc' },
    { label: 'CBD Oil Benefits', href: '/articles' },
    { label: 'Side Effects', href: '/glossary/side-effects' },
    { label: 'Drug Interactions', href: '/glossary/drug-interactions' },
  ];

  return (
    <section className="py-4 md:py-6 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Mobile: horizontal scroll */}
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide md:flex-wrap">
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap flex-shrink-0">Popular:</span>

          {/* Trending conditions */}
          {trendingConditions?.slice(0, 4).map((condition) => (
            <Link
              key={condition.slug}
              href={`/research/${condition.slug}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm rounded-full transition-colors whitespace-nowrap flex-shrink-0"
            >
              <span>{condition.display_name || condition.name}</span>
              <span className="text-xs text-green-500">({condition.research_count})</span>
            </Link>
          ))}

          {/* Divider */}
          <span className="hidden md:block w-px h-5 bg-gray-200 flex-shrink-0" />

          {/* Popular searches */}
          {popularSearches.slice(0, 3).map((search) => (
            <Link
              key={search.label}
              href={search.href}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-full transition-colors whitespace-nowrap flex-shrink-0"
            >
              {search.label}
            </Link>
          ))}

          {/* Popular glossary terms (on larger screens) */}
          {popularTerms?.slice(0, 2).map((term) => (
            <Link
              key={term.slug}
              href={`/glossary/${term.slug}`}
              className="hidden lg:inline-block px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm rounded-full transition-colors whitespace-nowrap flex-shrink-0"
            >
              📖 {term.term}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
