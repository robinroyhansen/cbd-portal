'use client';

import React, { useMemo, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface StudyForScoring {
  study_subject?: 'human' | 'review' | 'animal' | 'in_vitro';
  study_type?: string;
}

export type IndicatorSize = 'sm' | 'md' | 'lg';

export type StrengthLevel = 'strong' | 'moderate' | 'limited' | 'insufficient';

export interface EvidenceStrengthIndicatorProps {
  studies: StudyForScoring[];
  size?: IndicatorSize;
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export interface StrengthScore {
  score: number;
  level: StrengthLevel;
  bars: number;
  details: {
    totalStudies: number;
    humanStudies: number;
    humanPercentage: number;
    rctCount: number;
    reviewCount: number;
  };
}

// ============================================================================
// Size Configuration
// ============================================================================

const SIZE_CONFIG: Record<IndicatorSize, { barWidth: number; barHeight: number; gap: number; fontSize: string }> = {
  sm: { barWidth: 4, barHeight: 12, gap: 2, fontSize: 'text-xs' },
  md: { barWidth: 6, barHeight: 18, gap: 3, fontSize: 'text-sm' },
  lg: { barWidth: 8, barHeight: 24, gap: 4, fontSize: 'text-base' },
};

// ============================================================================
// Color Configuration
// ============================================================================

const LEVEL_COLORS: Record<StrengthLevel, { active: string; inactive: string; text: string; bg: string }> = {
  strong: {
    active: 'bg-emerald-500',
    inactive: 'bg-emerald-100',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  moderate: {
    active: 'bg-yellow-500',
    inactive: 'bg-yellow-100',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
  },
  limited: {
    active: 'bg-orange-500',
    inactive: 'bg-orange-100',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
  },
  insufficient: {
    active: 'bg-gray-400',
    inactive: 'bg-gray-100',
    text: 'text-gray-600',
    bg: 'bg-gray-50',
  },
};

const LEVEL_LABELS: Record<StrengthLevel, string> = {
  strong: 'Strong Evidence',
  moderate: 'Moderate Evidence',
  limited: 'Limited Evidence',
  insufficient: 'Insufficient Evidence',
};

// ============================================================================
// Scoring Functions
// ============================================================================

function isRCT(studyType?: string): boolean {
  if (!studyType) return false;
  const rctPatterns = [
    'randomized',
    'randomised',
    'rct',
    'controlled trial',
    'double-blind',
    'double blind',
    'placebo-controlled',
    'placebo controlled',
  ];
  const lowerType = studyType.toLowerCase();
  return rctPatterns.some((pattern) => lowerType.includes(pattern));
}

function isReview(subject?: string, studyType?: string): boolean {
  if (subject === 'review') return true;
  if (!studyType) return false;
  const reviewPatterns = ['review', 'meta-analysis', 'meta analysis', 'systematic'];
  const lowerType = studyType.toLowerCase();
  return reviewPatterns.some((pattern) => lowerType.includes(pattern));
}

function isHumanStudy(subject?: string): boolean {
  return subject === 'human';
}

/**
 * Calculate evidence strength score based on:
 * - Total number of studies (weighted: 30%)
 * - Percentage of human studies (weighted: 40%)
 * - Number of RCTs (weighted: 30%)
 *
 * Bonus points for systematic reviews/meta-analyses
 */
function calculateStrengthScore(studies: StudyForScoring[]): StrengthScore {
  const totalStudies = studies.length;
  const humanStudies = studies.filter((s) => isHumanStudy(s.study_subject)).length;
  const humanPercentage = totalStudies > 0 ? (humanStudies / totalStudies) * 100 : 0;
  const rctCount = studies.filter((s) => isRCT(s.study_type)).length;
  const reviewCount = studies.filter((s) => isReview(s.study_subject, s.study_type)).length;

  // Calculate component scores (0-100 scale)
  // Total studies score: 20+ studies = max, scaling down linearly
  const studyCountScore = Math.min(100, (totalStudies / 20) * 100);

  // Human percentage score: direct percentage (0-100)
  const humanScore = humanPercentage;

  // RCT score: 3+ RCTs = max, scaling down
  const rctScore = Math.min(100, (rctCount / 3) * 100);

  // Review bonus: up to 10 extra points
  const reviewBonus = Math.min(10, reviewCount * 5);

  // Weighted calculation
  const rawScore =
    (studyCountScore * 0.3) +
    (humanScore * 0.4) +
    (rctScore * 0.3) +
    reviewBonus;

  // Clamp to 0-100
  const score = Math.min(100, Math.max(0, rawScore));

  // Determine level and bars
  let level: StrengthLevel;
  let bars: number;

  if (score >= 70) {
    level = 'strong';
    bars = 5;
  } else if (score >= 50) {
    level = 'moderate';
    bars = score >= 60 ? 4 : 3;
  } else if (score >= 25) {
    level = 'limited';
    bars = 2;
  } else {
    level = 'insufficient';
    bars = totalStudies > 0 ? 1 : 0;
  }

  return {
    score: Math.round(score),
    level,
    bars,
    details: {
      totalStudies,
      humanStudies,
      humanPercentage: Math.round(humanPercentage),
      rctCount,
      reviewCount,
    },
  };
}

// ============================================================================
// Tooltip Component
// ============================================================================

interface TooltipContentProps {
  strength: StrengthScore;
}

function TooltipContent({ strength }: TooltipContentProps) {
  const { level, score, details } = strength;
  const colors = LEVEL_COLORS[level];

  return (
    <div className="w-64 p-3">
      <div className={`flex items-center gap-2 mb-2 pb-2 border-b border-gray-100`}>
        <span className={`font-semibold ${colors.text}`}>{LEVEL_LABELS[level]}</span>
        <span className="text-gray-400 text-xs">({score}/100)</span>
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Studies</span>
          <span className="font-medium text-gray-900">{details.totalStudies}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Human Studies</span>
          <span className="font-medium text-gray-900">
            {details.humanStudies} ({details.humanPercentage}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">RCTs</span>
          <span className="font-medium text-gray-900">{details.rctCount}</span>
        </div>
        {details.reviewCount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Reviews/Meta-analyses</span>
            <span className="font-medium text-gray-900">{details.reviewCount}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500 leading-relaxed">
          {level === 'strong' && 'Multiple high-quality human studies including RCTs support these findings.'}
          {level === 'moderate' && 'Growing body of human research, but more RCTs needed for confirmation.'}
          {level === 'limited' && 'Preliminary research shows promise, but human data is limited.'}
          {level === 'insufficient' && 'Not enough research to draw conclusions. More studies needed.'}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function EvidenceStrengthIndicator({
  studies,
  size = 'md',
  showLabel = true,
  showTooltip = true,
  className = '',
}: EvidenceStrengthIndicatorProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const strength = useMemo(() => calculateStrengthScore(studies), [studies]);
  const sizeConfig = SIZE_CONFIG[size];
  const colors = LEVEL_COLORS[strength.level];

  const barHeights = [
    sizeConfig.barHeight * 0.4,
    sizeConfig.barHeight * 0.55,
    sizeConfig.barHeight * 0.7,
    sizeConfig.barHeight * 0.85,
    sizeConfig.barHeight,
  ];

  return (
    <div
      className={`relative inline-flex items-center gap-2 ${className}`}
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      {/* Signal Bars */}
      <div
        className="flex items-end cursor-help"
        style={{ gap: sizeConfig.gap }}
        role="img"
        aria-label={`Evidence strength: ${LEVEL_LABELS[strength.level]}`}
      >
        {[1, 2, 3, 4, 5].map((barIndex) => {
          const isActive = barIndex <= strength.bars;
          return (
            <div
              key={barIndex}
              className={`rounded-sm transition-colors duration-200 ${
                isActive ? colors.active : colors.inactive
              }`}
              style={{
                width: sizeConfig.barWidth,
                height: barHeights[barIndex - 1],
              }}
            />
          );
        })}
      </div>

      {/* Label */}
      {showLabel && (
        <span className={`${sizeConfig.fontSize} font-medium ${colors.text}`}>
          {size === 'sm' ? strength.level.charAt(0).toUpperCase() + strength.level.slice(1) : LEVEL_LABELS[strength.level]}
        </span>
      )}

      {/* Tooltip */}
      {showTooltip && isTooltipVisible && (
        <div
          className="absolute z-50 bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 animate-in fade-in duration-150"
          role="tooltip"
        >
          <TooltipContent strength={strength} />
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-r border-b border-gray-200 transform rotate-45" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Utility Export
// ============================================================================

export { calculateStrengthScore };

export default EvidenceStrengthIndicator;
