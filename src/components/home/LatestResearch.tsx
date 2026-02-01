import { LocaleLink as Link } from '@/components/LocaleLink';
import { createClient } from '@/lib/supabase/server';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';
import { createLocalizedHref } from '@/lib/utils/locale-href';

interface QualityBadgeProps {
  score: number;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function QualityBadge({ score, t }: QualityBadgeProps) {
  let color = 'bg-slate-100 text-slate-500';
  let label = t('research.qualityBadge.unrated');

  if (score >= 80) {
    color = 'bg-emerald-100 text-emerald-700';
    label = t('research.qualityBadge.highQuality');
  } else if (score >= 60) {
    color = 'bg-blue-100 text-blue-700';
    label = t('research.qualityBadge.good');
  } else if (score >= 40) {
    color = 'bg-amber-100 text-amber-700';
    label = t('research.qualityBadge.moderate');
  } else if (score > 0) {
    color = 'bg-orange-100 text-orange-700';
    label = t('research.qualityBadge.low');
  }

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${color}`}>
      {score > 0 ? `${score}%` : label}
    </span>
  );
}

interface StudyTypeBadgeProps {
  type: string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function StudyTypeBadge({ type, t }: StudyTypeBadgeProps) {
  const badges: Record<string, { color: string; icon: string; labelKey: string }> = {
    human: { color: 'text-blue-600', icon: '👤', labelKey: 'research.studyType.human' },
    animal: { color: 'text-orange-600', icon: '🐭', labelKey: 'research.studyType.animal' },
    review: { color: 'text-violet-600', icon: '📚', labelKey: 'research.studyType.review' },
    in_vitro: { color: 'text-cyan-600', icon: '🧫', labelKey: 'research.studyType.inVitro' },
  };

  const badge = badges[type] || { color: 'text-slate-600', icon: '📄', labelKey: type };

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${badge.color}`}>
      <span>{badge.icon}</span>
      <span className="font-medium">{t(badge.labelKey)}</span>
    </span>
  );
}

interface LatestResearchProps {
  lang?: LanguageCode;
}

export async function LatestResearch({ lang = 'en' }: LatestResearchProps) {
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);
  const localizedHref = createLocalizedHref(lang);
  const supabase = await createClient();

  const { data: latestResearch, count: totalCount } = await supabase
    .from('kb_research_queue')
    .select('id, title, authors, publication, year, url, relevant_topics, quality_score, study_subject, plain_summary, slug', { count: 'exact' })
    .eq('status', 'approved')
    .order('year', { ascending: false })
    .order('quality_score', { ascending: false })
    .limit(4);

  // Fetch translations for non-English
  let researchTranslationMap = new Map<string, { plain_summary?: string }>();
  if (lang !== 'en' && latestResearch?.length) {
    const researchIds = latestResearch.map(r => r.id);
    const { data: translations } = await supabase
      .from('research_translations')
      .select('research_id, plain_summary')
      .eq('language', lang)
      .in('research_id', researchIds);

    researchTranslationMap = new Map(
      (translations || []).map(t => [t.research_id, t])
    );
  }

  const research = (latestResearch || []).map(r => {
    const trans = researchTranslationMap.get(r.id);
    return {
      ...r,
      plain_summary: trans?.plain_summary || r.plain_summary,
    };
  });

  return (
    <section className="py-24 bg-[#0a1f1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left column - Info */}
          <div className="lg:col-span-1">
            <span className="inline-block text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-4">
              {t('research.sectionLabel')}
            </span>
            <h2 className="text-4xl font-serif font-bold text-white mb-6">
              {t('research.title')}
            </h2>
            <p className="text-emerald-100/60 text-lg leading-relaxed mb-8">
              {t('research.description')}
            </p>

            {/* Stats card */}
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10 mb-8">
              <div className="text-5xl font-bold text-white font-mono mb-2">
                {totalCount?.toLocaleString() || 0}
              </div>
              <p className="text-emerald-400/80 mb-4">{t('stats.peerReviewedStudies')}</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <div className="text-2xl font-bold text-white font-mono">100%</div>
                  <div className="text-xs text-white/40">{t('stats.qualityScored')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-mono">AI</div>
                  <div className="text-xs text-white/40">{t('stats.aiSummarized')}</div>
                </div>
              </div>
            </div>

            <Link
              href={localizedHref('/research')}
              className="group inline-flex items-center gap-3 px-6 py-3.5 bg-white text-slate-900 rounded-xl font-semibold hover:bg-emerald-50 transition-all"
            >
              <span>{t('research.browseAll')}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Right column - Research cards */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">
                {t('research.recentlyAdded')}
              </h3>
              <Link href={localizedHref('/research')} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
                {t('common.viewAll')} →
              </Link>
            </div>

            <div className="space-y-4">
              {research.map((item) => (
                <Link
                  key={item.id}
                  href={item.slug ? localizedHref(`/research/study/${item.slug}`) : item.url}
                  target={item.slug ? undefined : "_blank"}
                  rel={item.slug ? undefined : "noopener noreferrer"}
                  className="group block bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all"
                >
                  {/* Badges row */}
                  <div className="flex items-center gap-3 mb-3">
                    {item.quality_score && <QualityBadge score={item.quality_score} t={t} />}
                    {item.study_subject && <StudyTypeBadge type={item.study_subject} t={t} />}
                    <span className="text-xs text-white/30 ml-auto">{item.year}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors mb-3 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  {item.plain_summary && (
                    <p className="text-sm text-white/50 mb-4 line-clamp-2 leading-relaxed">
                      {item.plain_summary}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <p className="text-sm text-white/40 truncate max-w-[70%]">
                      {item.authors?.split(',').slice(0, 2).join(', ')}
                      {item.authors?.split(',').length > 2 ? ' et al.' : ''}
                    </p>
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t('research.readStudy')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
