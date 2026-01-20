'use client';

import Link from 'next/link';
import {
  Cannabinoid,
  EFFECT_META,
  LEGAL_STATUS_META,
  RESEARCH_LEVEL_META,
  TYPE_META,
  SAFETY_TIER_META,
  PrimaryEffect,
} from '@/lib/cannabinoids';

interface CannabinoidFeatureCardProps {
  cannabinoid: Cannabinoid;
  articleSlug?: string;
  studyCount?: number;
}

export function CannabinoidFeatureCard({
  cannabinoid,
  articleSlug,
  studyCount,
}: CannabinoidFeatureCardProps) {
  const typeInfo = TYPE_META[cannabinoid.type];
  const legalInfo = LEGAL_STATUS_META[cannabinoid.legalStatus];
  const researchInfo = RESEARCH_LEVEL_META[cannabinoid.researchLevel];
  const safetyInfo = SAFETY_TIER_META[cannabinoid.safetyTier];

  // Get top 3 effects
  const topEffects = cannabinoid.primaryEffects.slice(0, 3);

  return (
    <div className="group relative bg-white rounded-2xl border-2 border-gray-100 overflow-hidden transition-all duration-300 hover:border-gray-200 hover:shadow-xl">
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${typeInfo.bgGradient} px-6 py-4 relative overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />

        <div className="relative flex items-center justify-between">
          <div>
            <span className="text-white/80 text-sm font-medium">{typeInfo.label}</span>
            <h3 className="text-2xl font-bold text-white flex items-baseline gap-2">
              {cannabinoid.abbreviation}
              <span className="text-base font-normal text-white/80">({cannabinoid.fullName})</span>
            </h3>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              cannabinoid.intoxicating
                ? 'bg-amber-400/90 text-amber-900'
                : 'bg-green-400/90 text-green-900'
            }`}>
              {cannabinoid.intoxicating ? 'Intoxicating' : 'Non-intoxicating'}
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-medium bg-white/20 text-white`}>
              {safetyInfo.icon} {safetyInfo.label}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Tagline */}
        <p className="text-lg font-medium text-gray-900 mb-2">{cannabinoid.tagline}</p>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {cannabinoid.shortDescription}
        </p>

        {/* Effect badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {topEffects.map(effect => {
            const effectInfo = EFFECT_META[effect];
            return (
              <span
                key={effect}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-${effectInfo.color}-100 text-${effectInfo.color}-700`}
                style={{
                  backgroundColor: `var(--color-${effectInfo.color}-100, #f3f4f6)`,
                  color: `var(--color-${effectInfo.color}-700, #374151)`,
                }}
              >
                <span>{effectInfo.icon}</span>
                {effectInfo.label}
              </span>
            );
          })}
        </div>

        {/* Key Benefits */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Benefits</h4>
          <ul className="space-y-1">
            {cannabinoid.keyBenefits.slice(0, 3).map((benefit, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 py-3 border-t border-gray-100">
          {/* Legal Status */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full bg-${legalInfo.color}-500`}
              style={{ backgroundColor: `var(--color-${legalInfo.color}-500, #6b7280)` }}
            />
            <span className="text-xs text-gray-600">{legalInfo.label}</span>
          </div>

          {/* Research Level */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-xs ${i < researchInfo.stars ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </span>
            ))}
            <span className="text-xs text-gray-500 ml-1">Research</span>
          </div>

          {/* Study Count */}
          {studyCount !== undefined && studyCount > 0 && (
            <div className="text-xs text-gray-500">
              {studyCount} studies
            </div>
          )}
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-3 mt-4">
          {cannabinoid.glossarySlug && (
            <Link
              href={`/glossary/${cannabinoid.glossarySlug}`}
              className="flex-1 text-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Definition
            </Link>
          )}
          {articleSlug && (
            <Link
              href={`/articles/${articleSlug}`}
              className={`flex-1 text-center px-4 py-2 bg-gradient-to-r ${typeInfo.bgGradient} text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity`}
            >
              Learn More
            </Link>
          )}
          {studyCount !== undefined && studyCount > 0 && (
            <Link
              href={`/research?search=${cannabinoid.abbreviation}`}
              className="flex-1 text-center px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Research
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Simplified badge component for effect pills
export function EffectBadge({ effect }: { effect: PrimaryEffect }) {
  const info = EFFECT_META[effect];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
      <span>{info.icon}</span>
      {info.label}
    </span>
  );
}
