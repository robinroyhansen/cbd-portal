'use client';

import { useState } from 'react';
import { CategoryStarRating, InlineStarRating } from './StarRating';

interface SubCriterion {
  id: string;
  name: string;
  max_points: number;
  description: string;
}

interface ScoreBreakdownItem {
  id: string;
  name: string;
  description: string;
  max_points: number;
  score: number;
  subcriteria: SubCriterion[];
  sub_scores: Record<string, number>;
}

interface CollapsibleScoreBreakdownProps {
  scoreBreakdown: ScoreBreakdownItem[];
}

function getScoreColor(score: number, maxPoints: number): string {
  const percentage = (score / maxPoints) * 100;
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-yellow-500';
  if (percentage >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function getScoreBgColor(score: number, maxPoints: number): string {
  const percentage = (score / maxPoints) * 100;
  if (percentage >= 80) return 'bg-green-50 border-green-200';
  if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
  if (percentage >= 40) return 'bg-orange-50 border-orange-200';
  return 'bg-red-50 border-red-200';
}

export function CollapsibleScoreBreakdown({ scoreBreakdown }: CollapsibleScoreBreakdownProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasExpandableContent = (criterion: ScoreBreakdownItem) => {
    return (
      (criterion.subcriteria && criterion.subcriteria.length > 0 && Object.keys(criterion.sub_scores).length > 0) ||
      criterion.description
    );
  };

  return (
    <div className="space-y-3">
      {scoreBreakdown.map(criterion => {
        const isExpanded = expandedItems.has(criterion.id);
        const canExpand = hasExpandableContent(criterion);

        return (
          <div
            key={criterion.id}
            className={`border rounded-lg overflow-hidden ${getScoreBgColor(criterion.score, criterion.max_points)}`}
          >
            {/* Header - always visible */}
            <button
              onClick={() => canExpand && toggleItem(criterion.id)}
              className={`w-full px-4 py-4 flex items-center justify-between ${
                canExpand ? 'hover:bg-white/50 cursor-pointer' : 'cursor-default'
              } transition-colors`}
              disabled={!canExpand}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-semibold text-gray-900">{criterion.name}</span>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Star rating with points */}
                <CategoryStarRating
                  score={criterion.score}
                  maxScore={criterion.max_points}
                  colorCode={true}
                />

                {/* Chevron */}
                {canExpand && (
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                {!canExpand && <div className="w-5" />}
              </div>
            </button>

            {/* Expandable content */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4 pt-2 bg-white/70 border-t border-gray-100/50">
                {/* Sub-scores with inline star ratings */}
                {criterion.subcriteria && criterion.subcriteria.length > 0 && Object.keys(criterion.sub_scores).length > 0 && (
                  <div className="space-y-2 mb-3">
                    {criterion.subcriteria.map(sub => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100"
                      >
                        <span className="text-sm text-gray-700 font-medium">
                          {sub.name}
                        </span>
                        <InlineStarRating
                          score={criterion.sub_scores[sub.id] ?? 0}
                          maxScore={sub.max_points}
                          colorCode={true}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                {criterion.description && (
                  <p className="text-sm text-gray-600 italic">{criterion.description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
