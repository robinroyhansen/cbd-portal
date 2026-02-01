import { LocaleLink as Link } from '@/components/LocaleLink';
import { createClient } from '@/lib/supabase/server';

interface Comparison {
  slug: string;
  title: string;
  excerpt: string;
}

// Parse comparison items from title
function parseItems(title: string) {
  const match = title.match(/^(.+?)\s+vs\.?\s+(.+?)(?:\s*[:|-]|$)/i);
  if (match) {
    return {
      itemA: match[1].trim(),
      itemB: match[2].split(':')[0].split('|')[0].trim(),
    };
  }
  return { itemA: 'Option A', itemB: 'Option B' };
}

export async function ComparisonShowcase() {
  const supabase = await createClient();

  const { data: comparisons } = await supabase
    .from('kb_articles')
    .select('slug, title, excerpt')
    .eq('article_type', 'comparison')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(4);

  if (!comparisons || comparisons.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full mb-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Compare Before You Choose
          </span>
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            CBD Comparisons
          </h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Not sure which option is right for you? Our expert comparisons break down the differences.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {comparisons.map((comparison) => {
            const { itemA, itemB } = parseItems(comparison.title);
            return (
              <Link
                key={comparison.slug}
                href={`/articles/${comparison.slug}`}
                className="group"
              >
                <div className="h-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-green-500 hover:shadow-xl transition-all duration-300">
                  {/* Visual Header */}
                  <div className="relative h-20 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />

                    {/* VS Badge */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-xs font-semibold truncate max-w-[80px]">
                          {itemA}
                        </span>
                        <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md">
                          <span className="text-green-600 text-[10px] font-bold">VS</span>
                        </div>
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-xs font-semibold truncate max-w-[80px]">
                          {itemB}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors text-sm line-clamp-2 mb-2">
                      {comparison.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                      {comparison.excerpt}
                    </p>
                    <span className="inline-flex items-center text-xs font-medium text-green-600 group-hover:text-green-700">
                      Read comparison
                      <svg className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link
            href="/categories/comparisons"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            View All Comparisons
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
