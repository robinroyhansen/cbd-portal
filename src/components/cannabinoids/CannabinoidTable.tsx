'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Cannabinoid,
  EFFECT_META,
  RESEARCH_LEVEL_META,
  SAFETY_TIER_META,
  TYPE_META,
  PrimaryEffect,
  SafetyTier,
} from '@/lib/cannabinoids';

interface CannabinoidTableProps {
  cannabinoids: Cannabinoid[];
  articleSlugs?: Record<string, string>; // slug -> articleSlug
}

type SortKey = 'name' | 'type' | 'research' | 'intoxicating' | 'safety';
type SortDir = 'asc' | 'desc';

export function CannabinoidTable({ cannabinoids, articleSlugs = {} }: CannabinoidTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterEffect, setFilterEffect] = useState<PrimaryEffect | 'all'>('all');

  // Sort function
  const sortedCannabinoids = [...cannabinoids]
    .filter(c => filterEffect === 'all' || c.primaryEffects.includes(filterEffect))
    .sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'name':
          comparison = a.abbreviation.localeCompare(b.abbreviation);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'research':
          const researchOrder = { extensive: 4, moderate: 3, emerging: 2, limited: 1 };
          comparison = researchOrder[b.researchLevel] - researchOrder[a.researchLevel];
          break;
        case 'intoxicating':
          comparison = (a.intoxicating ? 1 : 0) - (b.intoxicating ? 1 : 0);
          break;
        case 'safety':
          const safetyOrder: Record<SafetyTier, number> = { 'safe': 4, 'moderate': 3, 'caution': 2, 'high-risk': 1 };
          comparison = safetyOrder[b.safetyTier] - safetyOrder[a.safetyTier];
          break;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(sortKeyName)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyName && (
          <span className="text-green-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );

  const effects: PrimaryEffect[] = ['sleep', 'calm', 'focus', 'energy', 'pain', 'mood', 'inflammation'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Filter bar */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Filter by effect:</span>
          <button
            onClick={() => setFilterEffect('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterEffect === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {effects.map(effect => {
            const info = EFFECT_META[effect];
            return (
              <button
                key={effect}
                onClick={() => setFilterEffect(effect)}
                className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                  filterEffect === effect
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{info.icon}</span>
                {info.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <SortHeader label="Name" sortKeyName="name" />
              <SortHeader label="Type" sortKeyName="type" />
              <SortHeader label="Intoxicating" sortKeyName="intoxicating" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Primary Effects
              </th>
              <SortHeader label="Safety" sortKeyName="safety" />
              <SortHeader label="Research" sortKeyName="research" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedCannabinoids.map(cannabinoid => {
              const typeInfo = TYPE_META[cannabinoid.type];
              const researchInfo = RESEARCH_LEVEL_META[cannabinoid.researchLevel];
              const safetyInfo = SAFETY_TIER_META[cannabinoid.safetyTier];
              const articleSlug = articleSlugs[cannabinoid.slug];

              return (
                <tr key={cannabinoid.slug} className="hover:bg-gray-50 transition-colors">
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeInfo.bgGradient} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-xs">{cannabinoid.abbreviation}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{cannabinoid.abbreviation}</p>
                        <p className="text-xs text-gray-500">{cannabinoid.fullName}</p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-700`}
                      style={{
                        backgroundColor: `var(--color-${typeInfo.color}-100, #f3f4f6)`,
                        color: `var(--color-${typeInfo.color}-700, #374151)`,
                      }}
                    >
                      {typeInfo.label}
                    </span>
                  </td>

                  {/* Intoxicating */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      cannabinoid.intoxicating
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {cannabinoid.intoxicating ? '⚠️ Yes' : '✓ No'}
                    </span>
                  </td>

                  {/* Effects */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {cannabinoid.primaryEffects.slice(0, 3).map(effect => {
                        const info = EFFECT_META[effect];
                        return (
                          <span
                            key={effect}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                            title={info.label}
                          >
                            {info.icon}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Safety */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${safetyInfo.bgColor} ${
                      safetyInfo.color === 'green' ? 'text-green-700' :
                      safetyInfo.color === 'blue' ? 'text-blue-700' :
                      safetyInfo.color === 'amber' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {safetyInfo.icon} {safetyInfo.label}
                    </span>
                  </td>

                  {/* Research */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${i < researchInfo.stars ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cannabinoid.glossarySlug && (
                        <Link
                          href={`/glossary/${cannabinoid.glossarySlug}`}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Definition
                        </Link>
                      )}
                      {articleSlug && (
                        <Link
                          href={`/articles/${articleSlug}`}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          Article
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {sortedCannabinoids.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          No cannabinoids match the selected filter.
        </div>
      )}
    </div>
  );
}
