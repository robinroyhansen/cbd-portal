'use client';

import { useState } from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';
import {
  Cannabinoid,
  PrimaryEffect,
  EFFECT_META,
  CANNABINOIDS,
  getMajorCannabinoids,
} from '@/lib/cannabinoids';

interface EffectComparisonMatrixProps {
  cannabinoids?: Cannabinoid[];
  articleSlugs?: Record<string, string>;
}

// Effect strength to visual bar
function EffectBar({ strength, maxStrength = 5 }: { strength: number; maxStrength?: number }) {
  const normalizedStrength = Math.max(0, Math.min(strength, maxStrength));
  const percentage = (normalizedStrength / maxStrength) * 100;

  // Handle negative values (like appetite suppression for THCV)
  const isNegative = strength < 0;
  const displayPercentage = isNegative ? (Math.abs(strength) / maxStrength) * 100 : percentage;

  return (
    <div className="flex items-center gap-1">
      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isNegative ? 'bg-red-400' : 'bg-green-500'
          }`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-4">
        {isNegative ? `${strength}` : strength}
      </span>
    </div>
  );
}

// Visual strength indicator (dots)
function StrengthDots({ strength, maxStrength = 5 }: { strength: number; maxStrength?: number }) {
  const normalizedStrength = Math.max(0, Math.min(strength, maxStrength));
  const isNegative = strength < 0;

  return (
    <div className="flex gap-0.5" title={`${strength}/${maxStrength}`}>
      {Array.from({ length: maxStrength }).map((_, i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < normalizedStrength
              ? isNegative ? 'bg-red-400' : 'bg-green-500'
              : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export function EffectComparisonMatrix({ cannabinoids, articleSlugs = {} }: EffectComparisonMatrixProps) {
  const [selectedEffect, setSelectedEffect] = useState<PrimaryEffect | null>(null);
  const [showAllCannabinoids, setShowAllCannabinoids] = useState(false);

  const effectList: PrimaryEffect[] = ['calm', 'sleep', 'focus', 'energy', 'pain', 'mood', 'inflammation', 'nausea', 'appetite'];

  // Use provided cannabinoids or default to major ones
  const displayCannabinoids = cannabinoids || (showAllCannabinoids
    ? CANNABINOIDS.filter(c => c.type !== 'rare')
    : getMajorCannabinoids());

  // Sort by selected effect if one is selected
  const sortedCannabinoids = selectedEffect
    ? [...displayCannabinoids].sort((a, b) =>
        (b.effectStrength[selectedEffect] || 0) - (a.effectStrength[selectedEffect] || 0)
      )
    : displayCannabinoids;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Effect Comparison Matrix
        </h2>
        <p className="text-gray-600 mb-4">
          Compare cannabinoids by their reported effects. Click any effect header to sort.
        </p>

        {/* Toggle for more cannabinoids */}
        <button
          onClick={() => setShowAllCannabinoids(!showAllCannabinoids)}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          {showAllCannabinoids ? 'Show major cannabinoids only' : `Show all ${CANNABINOIDS.filter(c => c.type !== 'rare').length} cannabinoids`}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-900 z-10">
                Cannabinoid
              </th>
              {effectList.map(effect => {
                const info = EFFECT_META[effect];
                const isSelected = selectedEffect === effect;

                return (
                  <th
                    key={effect}
                    onClick={() => setSelectedEffect(isSelected ? null : effect)}
                    className={`px-3 py-3 text-center cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-green-100 text-green-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{info.icon}</span>
                      <span className="text-xs font-medium text-gray-700">{info.label}</span>
                      {isSelected && <span className="text-[10px] text-green-600">▼ Sorted</span>}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedCannabinoids.map((cannabinoid, index) => {
              const href = articleSlugs[cannabinoid.slug]
                ? `/articles/${articleSlugs[cannabinoid.slug]}`
                : cannabinoid.glossarySlug
                  ? `/glossary/${cannabinoid.glossarySlug}`
                  : '#';

              return (
                <tr
                  key={cannabinoid.slug}
                  className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="sticky left-0 bg-inherit px-4 py-3 z-10">
                    <Link href={href} className="group">
                      <div className="flex items-center gap-2">
                        <span className={`
                          px-2 py-1 rounded text-xs font-bold text-white
                          ${cannabinoid.intoxicating ? 'bg-amber-500' : 'bg-green-500'}
                        `}>
                          {cannabinoid.abbreviation}
                        </span>
                        <div>
                          <span className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                            {cannabinoid.fullName}
                          </span>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {cannabinoid.intoxicating ? (
                              <span className="text-amber-600">Intoxicating</span>
                            ) : (
                              <span className="text-green-600">Non-intoxicating</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  {effectList.map(effect => {
                    const strength = cannabinoid.effectStrength[effect] || 0;
                    const isSelected = selectedEffect === effect;

                    return (
                      <td
                        key={effect}
                        className={`px-3 py-3 text-center ${
                          isSelected ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="flex justify-center">
                          <StrengthDots strength={strength} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-gray-500">Strength:</span>
          <div className="flex items-center gap-1">
            <StrengthDots strength={1} />
            <span className="text-gray-500">Weak</span>
          </div>
          <div className="flex items-center gap-1">
            <StrengthDots strength={3} />
            <span className="text-gray-500">Moderate</span>
          </div>
          <div className="flex items-center gap-1">
            <StrengthDots strength={5} />
            <span className="text-gray-500">Strong</span>
          </div>
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
            <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded">CBD</span>
            <span className="text-gray-500">Non-intoxicating</span>
            <span className="px-2 py-0.5 bg-amber-500 text-white text-xs rounded">THC</span>
            <span className="text-gray-500">Intoxicating</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simplified version for quick comparison
 */
export function QuickEffectComparison({ effects, cannabinoids }: {
  effects: PrimaryEffect[];
  cannabinoids: Cannabinoid[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {effects.map(effect => {
        const info = EFFECT_META[effect];
        const sorted = [...cannabinoids].sort((a, b) =>
          (b.effectStrength[effect] || 0) - (a.effectStrength[effect] || 0)
        );

        return (
          <div key={effect} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{info.icon}</span>
              <span className="font-semibold text-gray-900">{info.label}</span>
            </div>
            <div className="space-y-2">
              {sorted.slice(0, 3).map(c => (
                <div key={c.slug} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{c.abbreviation}</span>
                  <EffectBar strength={c.effectStrength[effect] || 0} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
