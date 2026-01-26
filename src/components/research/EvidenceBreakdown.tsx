'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// ============================================================================
// Types
// ============================================================================

export interface StudyData {
  id: string;
  study_type?: string;
  study_subject?: 'human' | 'review' | 'animal' | 'in_vitro';
  quality_score?: number;
  year?: number;
}

export interface EvidenceBreakdownProps {
  studies: StudyData[];
  compact?: boolean;
  className?: string;
  showTitle?: boolean;
}

// ============================================================================
// Color Configuration (Emerald Theme)
// ============================================================================

const STUDY_TYPE_COLORS = {
  Human: '#059669',      // emerald-600
  Review: '#10b981',     // emerald-500
  Animal: '#34d399',     // emerald-400
  'In-vitro': '#6ee7b7', // emerald-300
};

const QUALITY_COLORS = {
  High: '#047857',       // emerald-700
  Medium: '#10b981',     // emerald-500
  Low: '#a7f3d0',        // emerald-200
};

const TREND_COLOR = '#059669'; // emerald-600

// ============================================================================
// Helper Functions
// ============================================================================

function normalizeStudySubject(subject?: string): string {
  if (!subject) return 'Unknown';
  const map: Record<string, string> = {
    human: 'Human',
    review: 'Review',
    animal: 'Animal',
    in_vitro: 'In-vitro',
    'in-vitro': 'In-vitro',
  };
  return map[subject.toLowerCase()] || 'Unknown';
}

function getQualityTier(score?: number): string {
  if (score === undefined || score === null) return 'Unknown';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

// ============================================================================
// Custom Tooltip Component
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { name: string; value: number } }>;
  label?: string;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-emerald-100 px-3 py-2">
      <p className="text-sm font-medium text-gray-900">
        {payload[0].payload.name}: <span className="text-emerald-600">{payload[0].value}</span>
      </p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function EvidenceBreakdown({
  studies,
  compact = false,
  className = '',
  showTitle = true,
}: EvidenceBreakdownProps) {
  // Calculate study type distribution
  const studyTypeData = useMemo(() => {
    const counts: Record<string, number> = {
      Human: 0,
      Review: 0,
      Animal: 0,
      'In-vitro': 0,
    };

    studies.forEach((study) => {
      const type = normalizeStudySubject(study.study_subject);
      if (type in counts) {
        counts[type]++;
      }
    });

    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [studies]);

  // Calculate quality distribution
  const qualityData = useMemo(() => {
    const counts: Record<string, number> = {
      High: 0,
      Medium: 0,
      Low: 0,
    };

    studies.forEach((study) => {
      const tier = getQualityTier(study.quality_score);
      if (tier in counts) {
        counts[tier]++;
      }
    });

    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [studies]);

  // Calculate year trend data
  const yearTrendData = useMemo(() => {
    const yearCounts: Record<number, number> = {};

    studies.forEach((study) => {
      if (study.year) {
        yearCounts[study.year] = (yearCounts[study.year] || 0) + 1;
      }
    });

    const years = Object.keys(yearCounts)
      .map(Number)
      .sort((a, b) => a - b);

    // Get last 10 years or all if less
    const recentYears = years.slice(-10);

    return recentYears.map((year) => ({
      year: year.toString(),
      count: yearCounts[year],
    }));
  }, [studies]);

  const totalStudies = studies.length;

  // Compact mode - single row with sparklines
  if (compact) {
    return (
      <div className={`bg-white rounded-lg border border-emerald-100 p-4 ${className}`}>
        <div className="flex items-center justify-between gap-4">
          {/* Total Count */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-lg">{totalStudies}</span>
            </div>
            <span className="text-sm text-gray-600">Studies</span>
          </div>

          {/* Study Type Mini Pie */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studyTypeData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={10}
                    outerRadius={20}
                    paddingAngle={2}
                  >
                    {studyTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STUDY_TYPE_COLORS[entry.name as keyof typeof STUDY_TYPE_COLORS]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-gray-500">
              Types
            </div>
          </div>

          {/* Year Trend Sparkline */}
          {yearTrendData.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearTrendData}>
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={TREND_COLOR}
                      fill={TREND_COLOR}
                      fillOpacity={0.2}
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="text-xs text-gray-500">
                Trend
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full mode - detailed breakdown
  return (
    <div className={`bg-white rounded-xl border border-emerald-100 shadow-sm ${className}`}>
      {showTitle && (
        <div className="px-6 py-4 border-b border-emerald-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Evidence Breakdown</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-600">{totalStudies}</span>
              <span className="text-sm text-gray-500">total studies</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Study Type Distribution - Pie Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Study Types</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studyTypeData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {studyTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STUDY_TYPE_COLORS[entry.name as keyof typeof STUDY_TYPE_COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {studyTypeData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        STUDY_TYPE_COLORS[entry.name as keyof typeof STUDY_TYPE_COLORS],
                    }}
                  />
                  <span className="text-xs text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quality Distribution - Bar Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quality Distribution</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualityData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={60}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {qualityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={QUALITY_COLORS[entry.name as keyof typeof QUALITY_COLORS]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Quality Legend */}
            <div className="flex justify-center gap-4 mt-2">
              <div className="text-xs text-gray-500">
                <span className="font-medium text-emerald-700">High:</span> 70+
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium text-emerald-500">Med:</span> 50-69
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium text-emerald-300">Low:</span> &lt;50
              </div>
            </div>
          </div>

          {/* Publication Trend - Area Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Publication Trend</h4>
            {yearTrendData.length > 0 ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yearTrendData}>
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis hide />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        return (
                          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-emerald-100 px-3 py-2">
                            <p className="text-sm font-medium text-gray-900">
                              {label}: <span className="text-emerald-600">{payload[0].value} studies</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={TREND_COLOR}
                      fill={TREND_COLOR}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-sm text-gray-400">
                No year data available
              </div>
            )}
            {yearTrendData.length > 0 && (
              <div className="text-center text-xs text-gray-500 mt-2">
                {yearTrendData[0]?.year} - {yearTrendData[yearTrendData.length - 1]?.year}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvidenceBreakdown;
