'use client';

import { useState } from 'react';
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

interface ResearchFiltersProps {
  selectedConditions: ConditionKey[];
  toggleCondition: (cond: ConditionKey) => void;
  conditionStats: Record<ConditionKey, number>;
  showAllConditions: boolean;
  setShowAllConditions: (show: boolean) => void;
  topConditions: ConditionKey[];
  yearRange: { min: number; max: number };
  setYearRange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
  dataYearRange: { min: number; max: number };
  qualityRange: { min: number; max: number };
  setQualityRange: React.Dispatch<React.SetStateAction<{ min: number; max: number }>>;
  selectedQualityTiers: QualityTier[];
  toggleQualityTier: (tier: QualityTier) => void;
  qualityStats: Record<QualityTier, number>;
  selectedStudyTypes: StudyType[];
  toggleStudyType: (type: StudyType) => void;
  availableStudyTypes: StudyType[];
  subjectType: SubjectType;
  setSubjectType: (type: SubjectType) => void;
  selectedCannabinoids: CannabinoidKey[];
  toggleCannabinoid: (cannabinoid: CannabinoidKey) => void;
  cannabinoidStats: Record<CannabinoidKey, number>;
  clearAllFilters: () => void;
  setCurrentPage: (page: number) => void;
}

export function ResearchFilters({
  selectedConditions,
  toggleCondition,
  conditionStats,
  showAllConditions,
  setShowAllConditions,
  topConditions,
  yearRange,
  setYearRange,
  dataYearRange,
  qualityRange,
  setQualityRange,
  selectedQualityTiers,
  toggleQualityTier,
  qualityStats,
  selectedStudyTypes,
  toggleStudyType,
  availableStudyTypes,
  subjectType,
  setSubjectType,
  selectedCannabinoids,
  toggleCannabinoid,
  cannabinoidStats,
  clearAllFilters,
  setCurrentPage,
}: ResearchFiltersProps) {
  const { t } = useLocale();
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  return (
    <>
      {/* Condition Filter - Top 8 with expand */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('researchFilters.condition')}</h3>
          {selectedConditions.length > 0 && (
            <button
              onClick={() => {
                selectedConditions.forEach(c => toggleCondition(c));
              }}
              className="text-xs text-gray-500 hover:text-red-600"
            >
              {t('researchFilters.clear')}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(showAllConditions
            ? (Object.keys(CONDITIONS) as ConditionKey[]).sort((a, b) => CONDITIONS[a].label.localeCompare(CONDITIONS[b].label))
            : topConditions
          ).map((key) => {
            const cond = CONDITIONS[key];
            const colors = CONDITION_COLORS[key] || { bg: 'bg-gray-100', text: 'text-gray-700' };
            const isSelected = selectedConditions.includes(key);
            const count = conditionStats[key] || 0;
            return (
              <button
                key={key}
                onClick={() => toggleCondition(key)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? `${colors.bg} ${colors.text} ring-2 ring-blue-500`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{cond.icon}</span>
                <span>{cond.label}</span>
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
        {!showAllConditions && (
          <button
            onClick={() => setShowAllConditions(true)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {t('researchFilters.showAllConditions').replace('{{count}}', Object.keys(CONDITIONS).length.toString())}
          </button>
        )}
        {showAllConditions && (
          <button
            onClick={() => setShowAllConditions(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            {t('researchFilters.showLess')}
          </button>
        )}
      </div>

      {/* Year Range */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('researchFilters.publicationYear')}</h3>
        <div className="flex items-center gap-2">
          <select
            value={yearRange.min}
            onChange={(e) => {
              const newMin = parseInt(e.target.value);
              setYearRange(prev => ({ min: newMin, max: Math.max(newMin, prev.max) }));
              setCurrentPage(1);
            }}
            className="flex-1 px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: dataYearRange.max - dataYearRange.min + 1 }, (_, i) => dataYearRange.min + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <span className="text-gray-400">-</span>
          <select
            value={yearRange.max}
            onChange={(e) => {
              const newMax = parseInt(e.target.value);
              setYearRange(prev => ({ min: Math.min(prev.min, newMax), max: newMax }));
              setCurrentPage(1);
            }}
            className="flex-1 px-2 py-1.5 text-sm bg-white border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: dataYearRange.max - dataYearRange.min + 1 }, (_, i) => dataYearRange.min + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quality Score */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('researchFilters.qualityScore')}</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${
              qualityRange.min >= 70 ? 'bg-green-500' : qualityRange.min >= 40 ? 'bg-yellow-500' : 'bg-red-400'
            }`} />
            <input
              type="number"
              min={0}
              max={100}
              value={qualityRange.min}
              onChange={(e) => {
                const newMin = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                setQualityRange(prev => ({ min: newMin, max: Math.max(newMin, prev.max) }));
                setCurrentPage(1);
              }}
              className="w-14 px-2 py-1.5 text-sm border border-gray-300 rounded text-center focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={100}
              value={qualityRange.max}
              onChange={(e) => {
                const newMax = Math.max(0, Math.min(100, parseInt(e.target.value) || 100));
                setQualityRange(prev => ({ min: Math.min(prev.min, newMax), max: newMax }));
                setCurrentPage(1);
              }}
              className="w-14 px-2 py-1.5 text-sm border border-gray-300 rounded text-center focus:ring-blue-500 focus:border-blue-500"
            />
            <span className={`w-2.5 h-2.5 rounded-full ${
              qualityRange.max >= 70 ? 'bg-green-500' : qualityRange.max >= 40 ? 'bg-yellow-500' : 'bg-red-400'
            }`} />
          </div>
        </div>
      </div>

      {/* Subject Type Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('researchFilters.subjectType')}</h3>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => { setSubjectType('all'); setCurrentPage(1); }}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
              subjectType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('researchFilters.all')}
          </button>
          <button
            onClick={() => { setSubjectType('human'); setCurrentPage(1); }}
            className={`flex-1 px-3 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${
              subjectType === 'human'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('researchFilters.human')}
          </button>
          <button
            onClick={() => { setSubjectType('animal'); setCurrentPage(1); }}
            className={`flex-1 px-3 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${
              subjectType === 'animal'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t('researchFilters.animal')}
          </button>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setAdvancedExpanded(!advancedExpanded)}
          className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('researchFilters.advanced')}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${advancedExpanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {advancedExpanded && (
          <div className="px-3 pb-3 space-y-3 border-t border-gray-100 pt-3">
            {/* Quality Tiers */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">{t('researchFilters.qualityTiers')}</label>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(qualityStats).map(([tier, count]) => (
                  <button
                    key={tier}
                    onClick={() => toggleQualityTier(tier as QualityTier)}
                    className={`p-1.5 rounded text-xs text-center transition-all ${
                      selectedQualityTiers.includes(tier as QualityTier)
                        ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{count}</div>
                    <div className="truncate text-[10px]">{tier}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Study Types */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">{t('researchFilters.studyTypes')}</label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableStudyTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudyTypes.includes(type)}
                      onChange={() => toggleStudyType(type)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-700 truncate">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Cannabinoids */}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">{t('researchFilters.cannabinoids')}</label>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {(Object.keys(CANNABINOIDS) as CannabinoidKey[]).map((key) => {
                  const cannabinoid = CANNABINOIDS[key];
                  const count = cannabinoidStats[key] || 0;
                  const isSelected = selectedCannabinoids.includes(key);
                  return (
                    <label
                      key={key}
                      className={`flex items-center justify-between gap-2 cursor-pointer p-1.5 rounded transition-all ${
                        isSelected ? 'bg-green-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCannabinoid(key)}
                          className="w-3.5 h-3.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className={`text-xs ${isSelected ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                          {cannabinoid.label}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ({cannabinoid.fullName})
                        </span>
                      </div>
                      <span className={`text-xs ${count > 0 ? 'text-gray-500' : 'text-gray-300'}`}>
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear All */}
      <button
        onClick={clearAllFilters}
        className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-gray-200 font-medium"
      >
        {t('researchFilters.clearAllFilters')}
      </button>
    </>
  );
}
