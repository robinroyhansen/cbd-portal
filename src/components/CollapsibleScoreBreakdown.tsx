'use client';

import { useState } from 'react';
import { StarRating } from './StarRating';

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
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Header - always visible */}
            <button
              onClick={() => canExpand && toggleItem(criterion.id)}
              className={`w-full px-4 py-3 flex items-center justify-between bg-white ${
                canExpand ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
              } transition-colors`}
              disabled={!canExpand}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-medium text-gray-900 truncate">{criterion.name}</span>
                <span className="text-sm text-gray-400 flex-shrink-0">({criterion.max_points} pts)</span>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Progress bar */}
                <div className="w-24 sm:w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getScoreColor(criterion.score, criterion.max_points)}`}
                    style={{ width: `${(criterion.score / criterion.max_points) * 100}%` }}
                  />
                </div>

                {/* Score */}
                <span className="font-bold text-gray-900 w-16 text-right">
                  {criterion.score}/{criterion.max_points}
                </span>

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
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-100">
                {/* Sub-scores with star ratings - horizontal layout */}
                {criterion.subcriteria && criterion.subcriteria.length > 0 && Object.keys(criterion.sub_scores).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2 mb-3">
                    {criterion.subcriteria.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between gap-2 py-1">
                        <span className="text-sm text-gray-700 truncate" title={sub.name}>
                          {sub.name}
                        </span>
                        <StarRating
                          score={criterion.sub_scores[sub.id] ?? 0}
                          maxScore={sub.max_points}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                {criterion.description && (
                  <p className="text-sm text-gray-600">{criterion.description}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
