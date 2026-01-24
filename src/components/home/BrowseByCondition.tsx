import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const categoryConfig: Record<string, { icon: string; gradient: string; bgColor: string }> = {
  'mental_health': { icon: '🧠', gradient: 'from-purple-500 to-indigo-500', bgColor: 'bg-purple-50' },
  'neurological': { icon: '⚡', gradient: 'from-amber-500 to-yellow-500', bgColor: 'bg-amber-50' },
  'pain': { icon: '💪', gradient: 'from-red-500 to-orange-500', bgColor: 'bg-red-50' },
  'gastrointestinal': { icon: '🍃', gradient: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50' },
  'cancer': { icon: '🎗️', gradient: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-50' },
  'skin': { icon: '✨', gradient: 'from-cyan-500 to-teal-500', bgColor: 'bg-cyan-50' },
  'cardiovascular': { icon: '❤️', gradient: 'from-rose-500 to-red-500', bgColor: 'bg-rose-50' },
  'metabolic': { icon: '⚖️', gradient: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50' },
  'other': { icon: '🏥', gradient: 'from-gray-500 to-slate-500', bgColor: 'bg-gray-50' },
};

export async function BrowseByCondition() {
  const supabase = await createClient();

  // Get featured conditions from the database with real research counts
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('slug, name, display_name, short_description, category, research_count')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(6);

  // Get total condition count for the "View all" link
  const { count: totalConditions } = await supabase
    .from('kb_conditions')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  if (!conditions || conditions.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Research-Backed
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Browse by Health Condition
            </h2>
            <p className="text-gray-600 max-w-xl">
              Explore CBD research for {totalConditions || 39} health conditions with evidence-based summaries and scientific studies
            </p>
          </div>
          <Link
            href="/conditions"
            className="hidden md:inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold group"
          >
            View all conditions
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Conditions Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {conditions.map((condition, index) => {
            const config = categoryConfig[condition.category] || categoryConfig.other;
            return (
              <Link
                key={condition.slug}
                href={`/research/${condition.slug}`}
                className="group relative bg-white rounded-2xl border border-gray-200 p-5 md:p-6 hover:border-emerald-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                <div className="flex items-start gap-4">
                  <div className={`text-2xl md:text-3xl p-3 rounded-xl ${config.bgColor} group-hover:scale-110 transition-transform`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-emerald-700 transition-colors mb-1">
                      {condition.display_name || condition.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 hidden sm:block">
                      {condition.short_description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        {condition.research_count || 0} studies
                      </span>
                      <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-8 md:mt-12">
          <Link
            href="/conditions"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            View All {totalConditions || 39} Conditions
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
