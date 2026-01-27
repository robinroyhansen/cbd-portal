'use client';

import { useEffect, useCallback } from 'react';
import { QualityTier, StudyType } from '@/lib/quality-tiers';
import {
  CONDITIONS,
  CANNABINOIDS,
  CONDITION_COLORS,
  ConditionKey,
  CannabinoidKey,
  SubjectType,
} from './types';
import { useLocale } from '@/hooks/useLocale';

export interface MobileFilterDrawerFilters {
  selectedConditions: ConditionKey[];
  selectedStudyTypes: StudyType[];
  selectedQualityTiers: QualityTier[];
  subjectType: SubjectType;
  yearRange: { min: number; max: number };
  qualityRange: { min: number; max: number };
  selectedCannabinoids: CannabinoidKey[];
}

export interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MobileFilterDrawerFilters;
  onFilterChange: <K extends keyof MobileFilterDrawerFilters>(
    key: K,
    value: MobileFilterDrawerFilters[K]
  ) => void;
  onClearAll: () => void;
  activeFilterCount: number;
  // Stats for displaying counts
  conditionStats: Record<ConditionKey, number>;
  qualityStats: Record<QualityTier, number>;
  cannabinoidStats: Record<CannabinoidKey, number>;
  availableStudyTypes: StudyType[];
  dataYearRange: { min: number; max: number };
  // Results count for apply button
  resultsCount: number;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearAll,
  activeFilterCount,
  conditionStats,
  qualityStats,
  cannabinoidStats,
  availableStudyTypes,
  dataYearRange,
  resultsCount,
}: MobileFilterDrawerProps) {
  const { t } = useLocale();

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  // Toggle functions
  const toggleCondition = (cond: ConditionKey) => {
    const newConditions = filters.selectedConditions.includes(cond)
      ? filters.selectedConditions.filter((c) => c !== cond)
      : [...filters.selectedConditions, cond];
    onFilterChange('selectedConditions', newConditions);
  };

  const toggleStudyType = (type: StudyType) => {
    const newTypes = filters.selectedStudyTypes.includes(type)
      ? filters.selectedStudyTypes.filter((t) => t !== type)
      : [...filters.selectedStudyTypes, type];
    onFilterChange('selectedStudyTypes', newTypes);
  };

  const toggleQualityTier = (tier: QualityTier) => {
    const newTiers = filters.selectedQualityTiers.includes(tier)
      ? filters.selectedQualityTiers.filter((t) => t !== tier)
      : [...filters.selectedQualityTiers, tier];
    onFilterChange('selectedQualityTiers', newTiers);
  };

  const toggleCannabinoid = (cannabinoid: CannabinoidKey) => {
    const newCannabinoids = filters.selectedCannabinoids.includes(cannabinoid)
      ? filters.selectedCannabinoids.filter((c) => c !== cannabinoid)
      : [...filters.selectedCannabinoids, cannabinoid];
    onFilterChange('selectedCannabinoids', newCannabinoids);
  };

  // Top conditions for display
  const TOP_CONDITIONS: ConditionKey[] = [
    'anxiety',
    'chronic_pain',
    'sleep',
    'epilepsy',
    'depression',
    'cancer',
    'inflammation',
    'addiction',
  ];

  if (!isOpen) return null;

  return (
    <div
      className="lg:hidden fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-filter-title"
    >
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet drawer */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl
                   transform transition-transform duration-300 ease-out
                   max-h-[85vh] flex flex-col"
        style={{
          animation: 'slideUp 0.3s ease-out forwards',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h2 id="mobile-filter-title" className="text-lg font-semibold text-gray-900">
              {t('researchFilters.filters')}
            </h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={t('researchFilters.closeFilters')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* Condition Filter */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{t('researchFilters.condition')}</h3>
              {filters.selectedConditions.length > 0 && (
                <button
                  onClick={() => onFilterChange('selectedConditions', [])}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('researchFilters.clear')}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {TOP_CONDITIONS.map((key) => {
                const cond = CONDITIONS[key];
                const colors = CONDITION_COLORS[key] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                const isSelected = filters.selectedConditions.includes(key);
                const count = conditionStats[key] || 0;
                return (
                  <button
                    key={key}
                    onClick={() => toggleCondition(key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? `${colors.bg} ${colors.text} ring-2 ring-blue-500`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{cond.icon}</span>
                    <span>{cond.label}</span>
                    <span className="text-xs opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Study Type Filter */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('researchFilters.studyTypes')}</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableStudyTypes.slice(0, 8).map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.selectedStudyTypes.includes(type)}
                    onChange={() => toggleStudyType(type)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Quality Tier Filter */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('researchFilters.qualityTiers')}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(qualityStats).map(([tier, count]) => (
                <button
                  key={tier}
                  onClick={() => toggleQualityTier(tier as QualityTier)}
                  className={`p-2.5 rounded-lg text-center transition-all ${
                    filters.selectedQualityTiers.includes(tier as QualityTier)
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-semibold text-sm">{count}</div>
                  <div className="text-xs truncate">{tier}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Subject Type Filter */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('researchFilters.subjectType')}</h3>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['all', 'human', 'animal'] as SubjectType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => onFilterChange('subjectType', type)}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                    filters.subjectType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } ${type !== 'all' ? 'border-l border-gray-200' : ''}`}
                >
                  {type === 'all' ? t('researchFilters.all') : type === 'human' ? t('researchFilters.human') : t('researchFilters.animal')}
                </button>
              ))}
            </div>
          </section>

          {/* Year Range Filter */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('researchFilters.publicationYear')}</h3>
            <div className="flex items-center gap-3">
              <select
                value={filters.yearRange.min}
                onChange={(e) => {
                  const newMin = parseInt(e.target.value);
                  onFilterChange('yearRange', {
                    min: newMin,
                    max: Math.max(newMin, filters.yearRange.max),
                  });
                }}
                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from(
                  { length: dataYearRange.max - dataYearRange.min + 1 },
                  (_, i) => dataYearRange.min + i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <span className="text-gray-400 font-medium">{t('researchFilters.to')}</span>
              <select
                value={filters.yearRange.max}
                onChange={(e) => {
                  const newMax = parseInt(e.target.value);
                  onFilterChange('yearRange', {
                    min: Math.min(filters.yearRange.min, newMax),
                    max: newMax,
                  });
                }}
                className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from(
                  { length: dataYearRange.max - dataYearRange.min + 1 },
                  (_, i) => dataYearRange.min + i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Cannabinoids Filter (collapsed by default) */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('researchFilters.cannabinoids')}</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CANNABINOIDS) as CannabinoidKey[]).slice(0, 6).map((key) => {
                const cannabinoid = CANNABINOIDS[key];
                const count = cannabinoidStats[key] || 0;
                const isSelected = filters.selectedCannabinoids.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleCannabinoid(key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{cannabinoid.label}</span>
                    <span className="text-xs opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Fixed footer with action buttons */}
        <div className="border-t border-gray-200 px-4 py-4 bg-white safe-area-bottom">
          <div className="flex gap-3">
            <button
              onClick={onClearAll}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              {t('researchFilters.clearAll')}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {t('researchFilters.apply')} ({resultsCount} {t('researchFilters.results')})
            </button>
          </div>
        </div>
      </div>

      {/* CSS for slide-up animation */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .safe-area-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}
