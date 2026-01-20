'use client';

import Link from 'next/link';
import {
  Cannabinoid,
  EFFECT_META,
  LEGAL_STATUS_META,
  TYPE_META,
} from '@/lib/cannabinoids';

interface CannabinoidCompactCardProps {
  cannabinoid: Cannabinoid;
  articleSlug?: string;
}

export function CannabinoidCompactCard({
  cannabinoid,
  articleSlug,
}: CannabinoidCompactCardProps) {
  const typeInfo = TYPE_META[cannabinoid.type];
  const legalInfo = LEGAL_STATUS_META[cannabinoid.legalStatus];

  // Get top 2 effects
  const topEffects = cannabinoid.primaryEffects.slice(0, 2);

  const linkHref = articleSlug
    ? `/articles/${articleSlug}`
    : cannabinoid.glossarySlug
    ? `/glossary/${cannabinoid.glossarySlug}`
    : '#';

  return (
    <Link
      href={linkHref}
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:border-gray-300 hover:shadow-lg"
    >
      {/* Mini gradient header */}
      <div className={`bg-gradient-to-r ${typeInfo.bgGradient} px-4 py-2`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {cannabinoid.abbreviation}
          </h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            cannabinoid.intoxicating
              ? 'bg-amber-400/90 text-amber-900'
              : 'bg-green-400/90 text-green-900'
          }`}>
            {cannabinoid.intoxicating ? 'Intox.' : 'Non-intox.'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{cannabinoid.fullName}</p>
        <p className="text-sm font-medium text-gray-900 mb-2">{cannabinoid.tagline}</p>

        {/* Effect badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {topEffects.map(effect => {
            const effectInfo = EFFECT_META[effect];
            return (
              <span
                key={effect}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
              >
                <span>{effectInfo.icon}</span>
                {effectInfo.label}
              </span>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">{legalInfo.label}</span>
          <span className="text-green-600 group-hover:text-green-700 font-medium">
            Learn more →
          </span>
        </div>
      </div>
    </Link>
  );
}

// Even smaller version for lists
export function CannabinoidMiniCard({ cannabinoid }: { cannabinoid: Cannabinoid }) {
  const typeInfo = TYPE_META[cannabinoid.type];
  const topEffect = cannabinoid.primaryEffects[0];
  const effectInfo = topEffect ? EFFECT_META[topEffect] : null;

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      {/* Colored badge */}
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeInfo.bgGradient} flex items-center justify-center`}>
        <span className="text-white font-bold text-sm">{cannabinoid.abbreviation}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{cannabinoid.fullName}</p>
        <p className="text-xs text-gray-500 truncate">{cannabinoid.tagline}</p>
      </div>

      {/* Effect */}
      {effectInfo && (
        <span className="text-lg" title={effectInfo.label}>{effectInfo.icon}</span>
      )}
    </div>
  );
}
