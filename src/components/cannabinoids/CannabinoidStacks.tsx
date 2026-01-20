'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CannabinoidStack,
  CANNABINOID_STACKS,
  getCannabinoidBySlug,
  TYPE_META,
  EFFECT_META,
} from '@/lib/cannabinoids';

interface CannabinoidStacksProps {
  articleSlugs?: Record<string, string>;
}

function StackCard({
  stack,
  articleSlugs,
  isExpanded,
  onToggle,
}: {
  stack: CannabinoidStack;
  articleSlugs: Record<string, string>;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const stackCannabinoids = stack.cannabinoids
    .map(slug => getCannabinoidBySlug(slug))
    .filter(Boolean);

  // Determine if any are intoxicating
  const hasIntoxicating = stackCannabinoids.some(c => c?.intoxicating);

  return (
    <div
      className={`
        rounded-xl border-2 transition-all duration-200
        ${isExpanded
          ? 'border-green-400 shadow-lg bg-white'
          : 'border-gray-200 bg-white hover:border-gray-300'}
      `}
    >
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full p-5 text-left"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{stack.icon}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{stack.name}</h3>
              <p className="text-sm text-gray-500">{stack.goal}</p>
            </div>
          </div>
          <span className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>

        {/* Cannabinoid pills preview */}
        <div className="flex flex-wrap gap-2 mt-3">
          {stackCannabinoids.map(cannabinoid => {
            if (!cannabinoid) return null;
            const typeInfo = TYPE_META[cannabinoid.type];

            return (
              <span
                key={cannabinoid.slug}
                className={`
                  px-2 py-1 rounded-full text-xs font-medium text-white
                  bg-gradient-to-r ${typeInfo.bgGradient}
                `}
              >
                {cannabinoid.abbreviation}
              </span>
            );
          })}
          {stack.ratio && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {stack.ratio}
            </span>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-gray-600 mb-4">{stack.description}</p>

          {/* Warning for intoxicating stacks */}
          {hasIntoxicating && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800 flex items-center gap-2">
                <span>⚠️</span>
                This stack includes intoxicating cannabinoids. Use responsibly.
              </p>
            </div>
          )}

          {/* Detailed cannabinoid breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Stack Components:</h4>
            {stackCannabinoids.map((cannabinoid, index) => {
              if (!cannabinoid) return null;
              const typeInfo = TYPE_META[cannabinoid.type];
              const ratioValue = stack.ratio?.split(':')[index];
              const href = articleSlugs[cannabinoid.slug]
                ? `/articles/${articleSlugs[cannabinoid.slug]}`
                : cannabinoid.glossarySlug
                  ? `/glossary/${cannabinoid.glossarySlug}`
                  : '#';

              return (
                <Link
                  key={cannabinoid.slug}
                  href={href}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm
                    bg-gradient-to-br ${typeInfo.bgGradient}
                  `}>
                    {cannabinoid.abbreviation}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{cannabinoid.abbreviation}</span>
                      {ratioValue && (
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                          {ratioValue} part{Number(ratioValue) > 1 ? 's' : ''}
                        </span>
                      )}
                      {cannabinoid.intoxicating && (
                        <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                          Intoxicating
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{cannabinoid.tagline}</p>
                    <div className="flex gap-1 mt-1">
                      {cannabinoid.primaryEffects.slice(0, 3).map(effect => {
                        const info = EFFECT_META[effect];
                        return (
                          <span key={effect} className="text-sm" title={info.label}>
                            {info.icon}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* How to use */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">How to Use This Stack:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                Look for products that contain these cannabinoids together
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                Or combine separate products in the suggested ratio
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                Start low and adjust based on your response
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function CannabinoidStacks({ articleSlugs = {} }: CannabinoidStacksProps) {
  const [expandedStack, setExpandedStack] = useState<string | null>('sleep');

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 lg:p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
          <span>🧪</span>
          Build Your Stack
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cannabinoid Combinations
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Cannabinoids often work better together through the "entourage effect."
          These research-backed combinations are designed for specific goals.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CANNABINOID_STACKS.map(stack => (
          <StackCard
            key={stack.id}
            stack={stack}
            articleSlugs={articleSlugs}
            isExpanded={expandedStack === stack.id}
            onToggle={() => setExpandedStack(expandedStack === stack.id ? null : stack.id)}
          />
        ))}
      </div>

      {/* Entourage effect info */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>💡</span>
          What is the Entourage Effect?
        </h3>
        <p className="text-sm text-gray-600">
          The entourage effect is the theory that cannabinoids, terpenes, and other cannabis compounds
          work synergistically, producing effects that are greater than the sum of their parts.
          This is why full-spectrum products (containing multiple cannabinoids) are often preferred
          over isolates for therapeutic use.
        </p>
      </div>
    </div>
  );
}
