import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function TrendingTopics() {
  const supabase = await createClient();

  const { data: trendingConditions } = await supabase
    .from('kb_conditions')
    .select('slug, name, display_name, research_count')
    .eq('is_published', true)
    .gt('research_count', 0)
    .order('research_count', { ascending: false })
    .limit(8);

  const popularSearches = [
    { label: 'Dosage Guide', href: '/tools/dosage-calculator', icon: '💊' },
    { label: 'Drug Interactions', href: '/tools/interactions', icon: '⚠️' },
    { label: 'For Pets', href: '/pets', icon: '🐾' },
  ];

  return (
    <section className="relative -mt-8 z-10 pb-8">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 p-4 lg:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Label */}
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400 uppercase tracking-wider flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Trending
            </div>

            {/* Trending conditions - horizontal scroll on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide flex-1">
              {trendingConditions?.slice(0, 5).map((condition) => (
                <Link
                  key={condition.slug}
                  href={`/conditions/${condition.slug}`}
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-all flex-shrink-0"
                >
                  <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 whitespace-nowrap">
                    {condition.display_name || condition.name}
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-emerald-500 bg-white px-1.5 py-0.5 rounded">
                    {condition.research_count}
                  </span>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-8 bg-slate-200 flex-shrink-0" />

            {/* Quick links */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {popularSearches.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
