import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

interface TrendingTopicsProps {
  lang?: LanguageCode;
}

export async function TrendingTopics({ lang = 'en' }: TrendingTopicsProps) {
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  const supabase = await createClient();

  const { data: trendingConditions } = await supabase
    .from('kb_conditions')
    .select('id, slug, name, display_name, research_count')
    .eq('is_published', true)
    .gt('research_count', 0)
    .order('research_count', { ascending: false })
    .limit(8);

  // Fetch translations for non-English
  let translationMap = new Map<string, { name?: string; display_name?: string }>();
  if (lang !== 'en' && trendingConditions?.length) {
    const conditionIds = trendingConditions.map(c => c.id);
    const { data: translations } = await supabase
      .from('condition_translations')
      .select('condition_id, name, display_name')
      .eq('language', lang)
      .in('condition_id', conditionIds);

    translationMap = new Map(
      (translations || []).map(t => [t.condition_id, t])
    );
  }

  const popularSearches = [
    { label: t('quickLinks.dosageGuide'), href: '/tools/dosage-calculator', icon: '💊' },
    { label: t('quickLinks.drugInteractions'), href: '/tools/interactions', icon: '⚠️' },
    { label: t('quickLinks.forPets'), href: '/pets', icon: '🐾' },
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
              {t('trending.label')}
            </div>

            {/* Trending conditions - horizontal scroll on mobile */}
            <div className="relative flex-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {trendingConditions?.slice(0, 5).map((condition) => {
                  const trans = translationMap.get(condition.id);
                  const displayName = trans?.display_name || trans?.name || condition.display_name || condition.name;
                  return (
                  <Link
                    key={condition.slug}
                    href={`/conditions/${condition.slug}`}
                    className="group inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-slate-50 hover:bg-emerald-50 rounded-lg transition-all flex-shrink-0"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 whitespace-nowrap">
                      {displayName}
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-emerald-500 bg-white px-1.5 py-0.5 rounded">
                      {condition.research_count}
                    </span>
                  </Link>
                  );
                })}
              </div>
              {/* Gradient fade indicator for scroll */}
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden" />
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-8 bg-slate-200 flex-shrink-0" />

            {/* Quick links */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {popularSearches.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-sm font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
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
