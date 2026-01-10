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
}

type StrengthLevel = 'strong' | 'average' | 'weak';

function getStrengthLevel(percentage: number): StrengthLevel {
  if (percentage >= 70) return 'strong';
  if (percentage >= 50) return 'average';
  return 'weak';
}

function getStrengthIcon(level: StrengthLevel): string {
  switch (level) {
    case 'strong': return '✅';
    case 'average': return '⚠️';
    case 'weak': return '❌';
  }
}

function getStrengthLabel(level: StrengthLevel): string {
  switch (level) {
    case 'strong': return 'Strong';
    case 'average': return 'Average';
    case 'weak': return 'Weak';
  }
}

function getStrengthColorClass(level: StrengthLevel): string {
  switch (level) {
    case 'strong': return 'text-green-700';
    case 'average': return 'text-amber-700';
    case 'weak': return 'text-red-700';
  }
}

export function KeyHighlights({ scoreBreakdown }: KeyHighlightsProps) {
  // Calculate percentages and sort
  const withPercentages = scoreBreakdown.map(item => ({
    ...item,
    percentage: item.max_points > 0 ? (item.score / item.max_points) * 100 : 0
  }));

  // Sort by percentage for strengths (highest first) and weaknesses (lowest first)
  const sortedByScore = [...withPercentages].sort((a, b) => b.percentage - a.percentage);

  // Get top 2 strengths (highest percentages that are above 60%)
  const strengths = sortedByScore
    .filter(item => item.percentage >= 60)
    .slice(0, 2);

  // Get top 2 weaknesses (lowest percentages that are below 60%)
  const weaknesses = [...sortedByScore]
    .reverse()
    .filter(item => item.percentage < 60)
    .slice(0, 2);

  // If we don't have enough in either category, fill with average items
  const middleItems = sortedByScore.filter(item =>
    item.percentage >= 40 && item.percentage < 70 &&
    !strengths.find(s => s.id === item.id) &&
    !weaknesses.find(w => w.id === item.id)
  );

  // Combine all highlights, prioritizing variety
  const allHighlights = [
    ...strengths.map(item => ({ ...item, level: getStrengthLevel(item.percentage) as StrengthLevel })),
    ...weaknesses.map(item => ({ ...item, level: getStrengthLevel(item.percentage) as StrengthLevel })),
    ...middleItems.slice(0, Math.max(0, 4 - strengths.length - weaknesses.length))
      .map(item => ({ ...item, level: getStrengthLevel(item.percentage) as StrengthLevel }))
  ];

  // Sort by level (strong first, then average, then weak)
  const sortedHighlights = allHighlights.sort((a, b) => {
    const order = { strong: 0, average: 1, weak: 2 };
    return order[a.level] - order[b.level];
  }).slice(0, 4);

  if (sortedHighlights.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-xl">📊</span>
        Key Highlights
      </h3>

      <div className="space-y-3">
        {sortedHighlights.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-100"
          >
            <span className="text-lg flex-shrink-0">
              {getStrengthIcon(item.level)}
            </span>
            <span className={`font-medium flex-shrink-0 w-16 ${getStrengthColorClass(item.level)}`}>
              {getStrengthLabel(item.level)}:
            </span>
            <span className="text-gray-800 flex-1 truncate">
              {item.name}
            </span>
            <InlineStarRating
              score={item.score}
              maxScore={item.max_points}
              colorCode={true}
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
