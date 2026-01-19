import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Health Conditions | CBD Portal',
  description: 'Explore research-backed information on how CBD may help with anxiety, pain, sleep, inflammation, and 35+ other health conditions.',
  alternates: {
    canonical: '/conditions',
  },
};

// Category styling configuration
const CATEGORY_STYLES: Record<string, { icon: string; color: string; bgColor: string; borderColor: string }> = {
  'mental-health': {
    icon: '🧠',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  'pain': {
    icon: '💪',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  'sleep': {
    icon: '😴',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  'neurological': {
    icon: '⚡',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  'inflammation': {
    icon: '🔥',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  'skin': {
    icon: '✨',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
  'digestive': {
    icon: '🍃',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  'cardiovascular': {
    icon: '❤️',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  'immune': {
    icon: '🛡️',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  'other': {
    icon: '🏥',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
};

const DEFAULT_STYLE = CATEGORY_STYLES['other'];

// Category display names
const CATEGORY_NAMES: Record<string, string> = {
  'mental-health': 'Mental Health',
  'pain': 'Pain & Discomfort',
  'sleep': 'Sleep Disorders',
  'neurological': 'Neurological',
  'inflammation': 'Inflammation & Autoimmune',
  'skin': 'Skin Conditions',
  'digestive': 'Digestive Health',
  'cardiovascular': 'Cardiovascular',
  'immune': 'Immune System',
  'other': 'Other Conditions',
};

interface Condition {
  id: string;
  slug: string;
  name: string;
  display_name: string;
  short_description: string;
  category: string;
  research_count: number;
  is_featured: boolean;
}

export default async function ConditionsPage() {
  const supabase = await createClient();

  // Get all published conditions
  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name, short_description, category, research_count, is_featured')
    .eq('is_published', true)
    .order('display_order', { ascending: true });

  // Group conditions by category
  const groupedConditions: Record<string, Condition[]> = {};
  const featuredConditions: Condition[] = [];

  conditions?.forEach((condition: Condition) => {
    if (condition.is_featured) {
      featuredConditions.push(condition);
    }

    const category = condition.category || 'other';
    if (!groupedConditions[category]) {
      groupedConditions[category] = [];
    }
    groupedConditions[category].push(condition);
  });

  // Calculate totals
  const totalConditions = conditions?.length || 0;
  const totalResearch = conditions?.reduce((sum, c) => sum + (c.research_count || 0), 0) || 0;

  // Sort categories by number of conditions
  const sortedCategories = Object.entries(groupedConditions)
    .sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Health Conditions</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Research-backed information on how CBD may help with {totalConditions} health conditions
        </p>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-10 border border-green-200">
        <div className="grid sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-green-600">{totalConditions}</div>
            <div className="text-sm text-gray-600">Conditions Covered</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{totalResearch}+</div>
            <div className="text-sm text-gray-600">Research Studies</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{sortedCategories.length}</div>
            <div className="text-sm text-gray-600">Health Categories</div>
          </div>
        </div>
      </div>

      {/* Featured Conditions */}
      {featuredConditions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-0.5 bg-green-500"></span>
            Most Researched Conditions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredConditions.slice(0, 6).map((condition) => {
              const style = CATEGORY_STYLES[condition.category] || DEFAULT_STYLE;
              return (
                <Link
                  key={condition.id}
                  href={`/conditions/${condition.slug}`}
                  className={`rounded-xl border-2 p-5 transition-all hover:shadow-md ${style.bgColor} ${style.borderColor} hover:border-green-400`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{style.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{condition.display_name || condition.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {condition.short_description}
                      </p>
                      {condition.research_count > 0 && (
                        <span className="inline-block mt-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          {condition.research_count} studies
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Conditions by Category */}
      <div className="space-y-10">
        {sortedCategories.map(([category, categoryConditions]) => {
          const style = CATEGORY_STYLES[category] || DEFAULT_STYLE;
          const categoryName = CATEGORY_NAMES[category] || category;

          return (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className={`text-xl`}>{style.icon}</span>
                {categoryName}
                <span className="text-sm font-normal text-gray-400">({categoryConditions.length})</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryConditions.map((condition) => (
                  <Link
                    key={condition.id}
                    href={`/conditions/${condition.slug}`}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:border-green-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {condition.display_name || condition.name}
                      </h3>
                      {condition.research_count > 0 && (
                        <span className="text-xs text-gray-500">
                          {condition.research_count} studies
                        </span>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Back to Categories */}
      <div className="mt-12 text-center">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Topics
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="mt-12 p-6 bg-gray-50 rounded-xl text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-2">Medical Disclaimer</p>
        <p>
          The information provided on this page is for educational purposes only and is not intended as medical advice.
          CBD research is ongoing, and results may vary. Always consult with a healthcare professional before starting
          any new supplement regimen, especially if you have a medical condition or are taking medications.
        </p>
      </div>
    </div>
  );
}
