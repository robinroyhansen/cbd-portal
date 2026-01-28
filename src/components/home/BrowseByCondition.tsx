import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { createLocalizedHref } from '@/lib/utils/locale-href';

const categoryConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  'mental_health': { icon: '🧠', color: 'text-violet-600', bgColor: 'bg-violet-500/10' },
  'neurological': { icon: '⚡', color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  'pain': { icon: '💪', color: 'text-rose-600', bgColor: 'bg-rose-500/10' },
  'gastrointestinal': { icon: '🍃', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
  'cancer': { icon: '🎗️', color: 'text-pink-600', bgColor: 'bg-pink-500/10' },
  'skin': { icon: '✨', color: 'text-cyan-600', bgColor: 'bg-cyan-500/10' },
  'cardiovascular': { icon: '❤️', color: 'text-red-600', bgColor: 'bg-red-500/10' },
  'metabolic': { icon: '⚖️', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  'pets': { icon: '🐾', color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
  'other': { icon: '🏥', color: 'text-slate-600', bgColor: 'bg-slate-500/10' },
};

interface BrowseByConditionProps {
  lang?: LanguageCode;
}

export async function BrowseByCondition({ lang = 'en' }: BrowseByConditionProps) {
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);
  const localizedHref = createLocalizedHref(lang);
  const supabase = await createClient();

  const { data: conditions } = await supabase
    .from('kb_conditions')
    .select('slug, name, display_name, short_description, category, research_count')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true })
    .limit(6);

  const { count: totalConditions } = await supabase
    .from('kb_conditions')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  if (!conditions || conditions.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 bg-slate-50 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="inline-block text-emerald-600 font-semibold text-sm uppercase tracking-wider mb-4">
            {t('conditions.sectionLabel')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-slate-900 mb-6">
            {t('conditions.title')}
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            {t('conditions.description', { count: totalConditions || 312 })}
          </p>
        </div>

        {/* Conditions Grid - Bento style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {conditions.map((condition, index) => {
            const config = categoryConfig[condition.category] || categoryConfig.other;
            const isLarge = index === 0;

            return (
              <Link
                key={condition.slug}
                href={localizedHref(`/conditions/${condition.slug}`)}
                className={`group relative bg-white rounded-2xl p-6 lg:p-8 border border-slate-200/80 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 ${isLarge ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/[0.02] to-teal-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  {/* Icon and category */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-3xl p-3 rounded-xl ${config.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      {config.icon}
                    </span>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                      {condition.category?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                    {condition.display_name || condition.name}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2">
                    {condition.short_description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-sm">
                        <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-slate-700">{condition.research_count || 0}</span>
                        <span className="text-slate-400">{t('common.studies')}</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:gap-2 transition-all">
                      {t('common.explore')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Link
            href={localizedHref('/conditions')}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
          >
            <span>{t('conditions.browseAll', { count: totalConditions || 312 })}</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
