'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';
import { StudyType } from '@/lib/quality-tiers';
import { CONDITION_COLORS, ConditionKey, SampleInfo } from './types';
import { useLocale } from '@/hooks/useLocale';

// Country code to flag emoji mapping
const COUNTRY_FLAGS: Record<string, string> = {
  'US': '🇺🇸', 'UK': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'DE': '🇩🇪',
  'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱', 'CH': '🇨🇭',
  'IL': '🇮🇱', 'JP': '🇯🇵', 'CN': '🇨🇳', 'BR': '🇧🇷', 'IN': '🇮🇳',
  'KR': '🇰🇷', 'SE': '🇸🇪', 'DK': '🇩🇰', 'NO': '🇳🇴', 'FI': '🇫🇮',
  'PL': '🇵🇱', 'CZ': '🇨🇿', 'AT': '🇦🇹', 'BE': '🇧🇪', 'PT': '🇵🇹',
  'IE': '🇮🇪', 'NZ': '🇳🇿', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CO': '🇨🇴',
  'ZA': '🇿🇦', 'TR': '🇹🇷', 'RU': '🇷🇺', 'GR': '🇬🇷', 'HU': '🇭🇺', 'RO': '🇷🇴'
};

function getCountryFlag(countryCode?: string): string | null {
  if (!countryCode) return null;
  return COUNTRY_FLAGS[countryCode.toUpperCase()] || null;
}

function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > maxLength * 0.6) {
    return truncated.slice(0, lastPeriod + 1);
  }
  return truncated.trim() + '...';
}

// Circular quality score indicator component
function CircularQualityScore({ score, size = 48 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return { stroke: '#22c55e', bg: '#dcfce7', text: '#166534' };
    if (s >= 40) return { stroke: '#eab308', bg: '#fef9c3', text: '#854d0e' };
    return { stroke: '#ef4444', bg: '#fee2e2', text: '#991b1b' };
  };

  const colors = getColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={colors.bg}
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-300"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-bold text-sm"
        style={{ color: colors.text }}
      >
        {score}
      </div>
    </div>
  );
}

interface ResearchCardProps {
  study: {
    id: string;
    title: string;
    authors: string;
    year: number;
    url: string;
    doi?: string;
    abstract?: string;
    slug?: string;
    country?: string;
    display_title?: string;
    plain_summary?: string;
    qualityScore: number;
    qualityTier: string;
    studyType: StudyType;
    sampleInfo: SampleInfo | null;
    treatment: string | null;
    studyStatus: 'completed' | 'ongoing' | 'recruiting' | null;
    primaryCondition: { key: ConditionKey; data: { label: string; icon: string } } | null;
  };
  onConditionClick?: (condition: ConditionKey) => void;
  topicStats?: { total: number; rank: number };
}

export function ResearchCard({ study, onConditionClick, topicStats }: ResearchCardProps) {
  const { t } = useLocale();

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
    completed: { label: t('researchCard.completed'), bg: 'bg-green-100', text: 'text-green-700', icon: '✓' },
    ongoing: { label: t('researchCard.ongoing'), bg: 'bg-blue-100', text: 'text-blue-700', icon: '⏳' },
    recruiting: { label: t('researchCard.recruiting'), bg: 'bg-amber-100', text: 'text-amber-700', icon: '📢' }
  };

  const conditionColors = study.primaryCondition
    ? CONDITION_COLORS[study.primaryCondition.key] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
    : null;

  const countryFlag = getCountryFlag(study.country);
  const isHighQuality = study.qualityScore >= 70;
  const isPreclinical = study.studyType === StudyType.ANIMAL_STUDY || study.studyType === StudyType.IN_VITRO_STUDY;
  const displayTitle = study.display_title || study.title;
  const firstAuthor = study.authors?.split(',')[0]?.trim()?.split(' ').pop() || 'Unknown';
  const truncatedSummary = study.plain_summary ? truncateText(study.plain_summary, 150) : null;

  return (
    <article
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      itemScope
      itemType="https://schema.org/ScholarlyArticle"
      role="listitem"
    >
      <meta itemProp="datePublished" content={study.year?.toString()} />
      {study.doi && <meta itemProp="identifier" content={study.doi} />}
      {study.abstract && <meta itemProp="abstract" content={study.abstract} />}

      {/* Row 1: Title with flag and Quality Score */}
      <div className="flex items-start gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2" itemProp="name">
            {countryFlag && <span className="mr-1.5" title={study.country}>{countryFlag}</span>}
            {study.slug ? (
              <Link href={`/research/study/${study.slug}`} className="hover:text-green-600 transition-colors">
                {displayTitle}
              </Link>
            ) : (
              displayTitle
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>{firstAuthor}</span>
            <span>•</span>
            <span>{study.year}</span>
            <span>•</span>
            <span>{study.studyType}</span>
            {isHighQuality && !isPreclinical && (
              <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold">
                {t('researchCard.topQuality')} ⭐
              </span>
            )}
          </p>
        </div>
        <div className="shrink-0">
          {isPreclinical ? (
            <div className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-purple-100 border-2 border-purple-200" title="Preclinical Study">
              <span className="text-base">🧪</span>
              <span className="text-[8px] font-semibold text-purple-700 -mt-0.5">{t('researchCard.preclinical')}</span>
            </div>
          ) : (
            <div title={`Quality Score: ${study.qualityScore}/100`}>
              <CircularQualityScore score={study.qualityScore} size={44} />
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Key Info Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {study.primaryCondition && conditionColors && (
          <button
            onClick={() => onConditionClick?.(study.primaryCondition!.key)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${conditionColors.bg} ${conditionColors.text} border ${conditionColors.border} hover:opacity-80 transition-opacity cursor-pointer`}
            title={`Filter by ${study.primaryCondition.data.label}`}
          >
            <span aria-hidden="true">{study.primaryCondition.data.icon}</span>
            {study.primaryCondition.data.label}
          </button>
        )}

        {study.sampleInfo && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
            study.sampleInfo.subjectType === 'cells' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
            study.sampleInfo.subjectType === 'mice' || study.sampleInfo.subjectType === 'rats' || study.sampleInfo.subjectType === 'animals' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            study.sampleInfo.subjectType === 'dogs' || study.sampleInfo.subjectType === 'cats' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
            'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            <span aria-hidden="true">
              {study.sampleInfo.subjectType === 'cells' ? '🧫' :
               study.sampleInfo.subjectType === 'mice' ? '🐁' :
               study.sampleInfo.subjectType === 'rats' ? '🐀' :
               study.sampleInfo.subjectType === 'dogs' ? '🐕' :
               study.sampleInfo.subjectType === 'cats' ? '🐈' :
               study.sampleInfo.subjectType === 'animals' ? '🐾' : '👥'}
            </span>
            {study.sampleInfo.label}
          </span>
        )}

        {study.studyStatus && statusConfig[study.studyStatus] && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig[study.studyStatus].bg} ${statusConfig[study.studyStatus].text}`}>
            <span aria-hidden="true">{statusConfig[study.studyStatus].icon}</span>
            {statusConfig[study.studyStatus].label}
          </span>
        )}

        {study.treatment && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            💊 {study.treatment.length > 20 ? study.treatment.slice(0, 20) + '...' : study.treatment}
          </span>
        )}
      </div>

      {/* Row 3: Truncated Summary */}
      {truncatedSummary && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          {truncatedSummary}
        </p>
      )}

      {/* Row 4: Research Context + CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        {topicStats && study.primaryCondition && (
          <p className="text-xs text-gray-400">
            📊 {t('researchCard.studiesCount').replace('{{total}}', topicStats.total.toString()).replace('{{condition}}', study.primaryCondition.data.label.toLowerCase())}
            {topicStats.rank > 0 && !isPreclinical && ` • ${t('researchCard.ranksForQuality').replace('{{rank}}', topicStats.rank.toString())}`}
          </p>
        )}
        {!topicStats && <div />}

        {study.slug ? (
          <Link
            href={`/research/study/${study.slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap shrink-0"
          >
            {t('researchCard.view')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <a
            href={study.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap shrink-0"
          >
            {t('researchCard.view')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
