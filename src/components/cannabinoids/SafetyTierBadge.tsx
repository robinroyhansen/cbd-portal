'use client';

import { SafetyTier, SAFETY_TIER_META } from '@/lib/cannabinoids';

interface SafetyTierBadgeProps {
  tier: SafetyTier;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SafetyTierBadge({ tier, showDescription = false, size = 'md' }: SafetyTierBadgeProps) {
  const info = SAFETY_TIER_META[tier];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const colorClasses = {
    safe: 'bg-green-100 text-green-700 border-green-200',
    moderate: 'bg-blue-100 text-blue-700 border-blue-200',
    caution: 'bg-amber-100 text-amber-700 border-amber-200',
    'high-risk': 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className={showDescription ? 'space-y-1' : ''}>
      <span className={`
        inline-flex items-center gap-1 rounded-full font-medium border
        ${sizeClasses[size]}
        ${colorClasses[tier]}
      `}>
        <span>{info.icon}</span>
        {info.label}
      </span>
      {showDescription && (
        <p className="text-xs text-gray-500">{info.description}</p>
      )}
    </div>
  );
}

/**
 * Safety tier legend for explaining the tier system
 */
export function SafetyTierLegend() {
  const tiers: SafetyTier[] = ['safe', 'moderate', 'caution', 'high-risk'];

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>🛡️</span>
        Safety & Research Tiers
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map(tier => {
          const info = SAFETY_TIER_META[tier];
          const colorClasses = {
            safe: 'border-green-200 bg-green-50',
            moderate: 'border-blue-200 bg-blue-50',
            caution: 'border-amber-200 bg-amber-50',
            'high-risk': 'border-red-200 bg-red-50',
          };

          return (
            <div
              key={tier}
              className={`rounded-lg border-2 p-4 ${colorClasses[tier]}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{info.icon}</span>
                <span className="font-semibold text-gray-900">{info.label}</span>
              </div>
              <p className="text-sm text-gray-600">{info.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact safety indicator for cards
 */
export function SafetyIndicator({ tier }: { tier: SafetyTier }) {
  const dotColors = {
    safe: 'bg-green-500',
    moderate: 'bg-blue-500',
    caution: 'bg-amber-500',
    'high-risk': 'bg-red-500',
  };

  const info = SAFETY_TIER_META[tier];

  return (
    <div className="flex items-center gap-1.5" title={info.description}>
      <span className={`w-2 h-2 rounded-full ${dotColors[tier]}`}></span>
      <span className="text-xs text-gray-500">{info.label}</span>
    </div>
  );
}
