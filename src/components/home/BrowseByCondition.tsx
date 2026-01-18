import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const categoryIcons: Record<string, string> = {
  'mental_health': '🧠',
  'neurological': '⚡',
  'pain': '💪',
  'gastrointestinal': '🌿',
  'cancer': '🎗️',
  'skin': '✨',
  'cardiovascular': '❤️',
  'metabolic': '🔬',
  'other': '🏥',
};

const categoryColors: Record<string, string> = {
  'mental_health': 'bg-purple-50 hover:bg-purple-100 border-purple-200',
  'neurological': 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  'pain': 'bg-orange-50 hover:bg-orange-100 border-orange-200',
  'gastrointestinal': 'bg-green-50 hover:bg-green-100 border-green-200',
  'cancer': 'bg-pink-50 hover:bg-pink-100 border-pink-200',
  'skin': 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200',
  'cardiovascular': 'bg-red-50 hover:bg-red-100 border-red-200',
  'metabolic': 'bg-amber-50 hover:bg-amber-100 border-amber-200',
  'other': 'bg-gray-50 hover:bg-gray-100 border-gray-200',
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
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Health Condition</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore CBD research for {totalConditions || 39} health conditions with evidence-based summaries
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {conditions.map((condition) => (
            <Link
              key={condition.slug}
              href={`/conditions/${condition.slug}`}
              className={`group p-6 rounded-xl border transition-all shadow-sm hover:shadow-md ${categoryColors[condition.category] || categoryColors.other}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{categoryIcons[condition.category] || '🏥'}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-green-700 mb-1">
                    {condition.display_name || condition.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {condition.short_description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {condition.research_count || 0} studies
                    </span>
                    <span className="text-xs text-gray-400 group-hover:text-green-600 transition-colors">
                      View research →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/conditions"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
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
