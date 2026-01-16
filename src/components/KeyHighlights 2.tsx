'use client';

import { InlineStarRating } from './StarRating';

interface ScoreBreakdownItem {
  id: string;
  name: string;
  max_points: number;
  score: number;
}

interface KeyHighlightsProps {
  scoreBreakdown: ScoreBreakdownItem[];
  brandName: string;
}

function getStrengthColorClass(isStrength: boolean): string {
  return isStrength ? 'text-green-700' : 'text-red-700';
}

export function KeyHighlights({ scoreBreakdown, brandName }: KeyHighlightsProps) {
  if (scoreBreakdown.length < 4) {
    return null;
  }

  // Calculate percentages and sort by score (highest first)
  const withPercentages = scoreBreakdown.map(item => ({
    ...item,
    percentage: item.max_points > 0 ? (item.score / item.max_points) * 100 : 0
  }));

  const sortedByScore = [...withPercentages].sort((a, b) => b.percentage - a.percentage);

  // Get top 2 BEST (highest percentages)
  const best = sortedByScore.slice(0, 2);

  // Get top 2 WORST (lowest percentages)
  const worst = sortedByScore.slice(-2).reverse();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-xl">📊</span>
        {brandName} Key Highlights
      </h2>

      <div className="space-y-3">
        {/* Best items */}
        {best.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-green-100"
          >
            <span className="text-lg flex-shrink-0">✅</span>
            <span className={`font-medium flex-shrink-0 w-16 ${getStrengthColorClass(true)}`}>
              Strong:
            </span>
            <span className="text-gray-800 flex-1 truncate">
              {item.name}
            </span>
            <InlineStarRating
              score={item.score}
              maxScore={item.max_points}
              colorCode={true}
              showPoints={true}
            />
          </div>
        ))}

        {/* Worst items */}
        {worst.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-red-100"
          >
            <span className="text-lg flex-shrink-0">❌</span>
            <span className={`font-medium flex-shrink-0 w-16 ${getStrengthColorClass(false)}`}>
              Weak:
            </span>
            <span className="text-gray-800 flex-1 truncate">
              {item.name}
            </span>
            <InlineStarRating
              score={item.score}
              maxScore={item.max_points}
              colorCode={true}
              showPoints={true}
            />
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Based on our 100-point scoring methodology
      </p>
    </div>
  );
}
