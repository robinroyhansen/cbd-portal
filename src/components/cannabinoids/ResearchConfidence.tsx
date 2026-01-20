'use client';

import { ResearchLevel, RESEARCH_LEVEL_META } from '@/lib/cannabinoids';

interface ResearchConfidenceProps {
  level: ResearchLevel;
  studyCount?: number;
  showDescription?: boolean;
}

/**
 * Visual indicator of research confidence level
 */
export function ResearchConfidence({ level, studyCount, showDescription = false }: ResearchConfidenceProps) {
  const info = RESEARCH_LEVEL_META[level];

  const colorClasses: Record<ResearchLevel, string> = {
    extensive: 'text-green-600 bg-green-50 border-green-200',
    moderate: 'text-blue-600 bg-blue-50 border-blue-200',
    emerging: 'text-amber-600 bg-amber-50 border-amber-200',
    limited: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <div className={showDescription ? 'space-y-2' : ''}>
      <div className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border
        ${colorClasses[level]}
      `}>
        {/* Stars */}
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-sm ${i < info.stars ? '' : 'opacity-30'}`}
            >
              ★
            </span>
          ))}
        </div>
        <span className="text-sm font-medium">{info.label}</span>
        {studyCount && studyCount > 0 && (
          <span className="text-xs opacity-75">({studyCount}+ studies)</span>
        )}
      </div>
      {showDescription && (
        <p className="text-sm text-gray-500">{info.description}</p>
      )}
    </div>
  );
}

/**
 * Compact version for cards
 */
export function ResearchStars({ level, size = 'sm' }: { level: ResearchLevel; size?: 'sm' | 'md' }) {
  const info = RESEARCH_LEVEL_META[level];
  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-1" title={info.description}>
      <div className={`flex gap-0.5 ${sizeClass}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={i < info.stars ? 'text-amber-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Research level badge
 */
export function ResearchBadge({ level }: { level: ResearchLevel }) {
  const info = RESEARCH_LEVEL_META[level];

  const colorClasses: Record<ResearchLevel, string> = {
    extensive: 'bg-green-100 text-green-700',
    moderate: 'bg-blue-100 text-blue-700',
    emerging: 'bg-amber-100 text-amber-700',
    limited: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium
      ${colorClasses[level]}
    `}>
      <span className="text-[10px]">{'★'.repeat(info.stars)}</span>
      {info.label}
    </span>
  );
}

/**
 * Research overview section showing all levels
 */
export function ResearchOverview() {
  const levels: ResearchLevel[] = ['extensive', 'moderate', 'emerging', 'limited'];

  const levelExamples: Record<ResearchLevel, string[]> = {
    extensive: ['CBD', 'THC'],
    moderate: ['CBG', 'CBN'],
    emerging: ['CBC', 'THCV', 'CBDA'],
    limited: ['HHC', 'Delta-8', 'THCP'],
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>📊</span>
        Understanding Research Levels
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Not all cannabinoids have equal research backing. Here&apos;s how we categorize the evidence:
      </p>

      <div className="space-y-4">
        {levels.map(level => {
          const info = RESEARCH_LEVEL_META[level];
          const examples = levelExamples[level];

          const bgColors: Record<ResearchLevel, string> = {
            extensive: 'bg-green-50 border-green-200',
            moderate: 'bg-blue-50 border-blue-200',
            emerging: 'bg-amber-50 border-amber-200',
            limited: 'bg-gray-100 border-gray-200',
          };

          return (
            <div key={level} className={`rounded-lg border p-4 ${bgColors[level]}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">{'★'.repeat(info.stars)}{'☆'.repeat(5 - info.stars)}</span>
                    <span className="font-semibold text-gray-900">{info.label}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-gray-500">Examples:</span>
                {examples.map(ex => (
                  <span key={ex} className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-700">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> Research levels reflect the quantity and quality of scientific studies,
          not effectiveness. Even cannabinoids with limited research may have therapeutic value -
          they simply haven&apos;t been studied as extensively yet.
        </p>
      </div>
    </div>
  );
}
