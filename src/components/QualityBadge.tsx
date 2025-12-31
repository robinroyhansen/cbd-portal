'use client';

import { QualityTier, getQualityTierColor, getQualityTierDescription } from '../lib/quality-tiers';

interface QualityBadgeProps {
  tier: QualityTier;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showTooltip?: boolean;
  className?: string;
}

/**
 * QualityBadge Component
 *
 * Displays a quality tier badge with color coding and optional score display.
 * Includes hover tooltips with detailed explanations of the quality tier.
 *
 * @param tier - The quality tier to display
 * @param score - Optional numerical score (0-100)
 * @param size - Badge size: sm, md, or lg
 * @param showScore - Whether to show the numerical score
 * @param showTooltip - Whether to show hover tooltip (default: true)
 * @param className - Additional CSS classes
 */
export function QualityBadge({
  tier,
  score,
  size = 'md',
  showScore = false,
  showTooltip = true,
  className = ''
}: QualityBadgeProps) {
  // Get tier-specific styling
  const colorClasses = getQualityTierColor(tier);
  const description = getQualityTierDescription(tier);

  // Size-specific classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  // Quality tier icons
  const tierIcons = {
    [QualityTier.GOLD_STANDARD]: '🏆',
    [QualityTier.HIGH_QUALITY]: '⭐',
    [QualityTier.MODERATE_QUALITY]: '📊',
    [QualityTier.LIMITED_EVIDENCE]: '🔍',
    [QualityTier.PRECLINICAL]: '🧪'
  };

  const badgeContent = (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${colorClasses}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span className="text-xs" aria-hidden="true">
        {tierIcons[tier]}
      </span>
      <span className="font-semibold">{tier}</span>
      {showScore && score !== undefined && (
        <span className="opacity-75 ml-1">
          ({score})
        </span>
      )}
    </span>
  );

  // If tooltips are disabled, return badge without wrapper
  if (!showTooltip) {
    return badgeContent;
  }

  // Tooltip wrapper
  return (
    <div className="group relative inline-block">
      {badgeContent}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg max-w-xs">
          <div className="font-semibold mb-1">{tier}</div>
          <div className="text-gray-200">{description}</div>
          {score !== undefined && (
            <div className="text-gray-400 mt-1 text-xs">
              Quality Score: {score}/100
            </div>
          )}

          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * QualityBadgeSimple Component
 *
 * A simplified version without tooltips for use in compact layouts
 */
export function QualityBadgeSimple({
  tier,
  score,
  size = 'sm',
  className = ''
}: Omit<QualityBadgeProps, 'showTooltip'>) {
  return (
    <QualityBadge
      tier={tier}
      score={score}
      size={size}
      showScore={false}
      showTooltip={false}
      className={className}
    />
  );
}

/**
 * QualityScoreBadge Component
 *
 * Displays both the tier and numerical score prominently
 */
export function QualityScoreBadge({
  tier,
  score,
  size = 'md',
  className = ''
}: Required<Pick<QualityBadgeProps, 'tier' | 'score'>> &
   Pick<QualityBadgeProps, 'size' | 'className'>) {
  return (
    <QualityBadge
      tier={tier}
      score={score}
      size={size}
      showScore={true}
      showTooltip={true}
      className={className}
    />
  );
}

/**
 * QualityIndicator Component
 *
 * A minimal indicator showing just the tier with icon
 */
export function QualityIndicator({
  tier,
  className = ''
}: Pick<QualityBadgeProps, 'tier' | 'className'>) {
  const colorClasses = getQualityTierColor(tier);
  const tierIcons = {
    [QualityTier.GOLD_STANDARD]: '🏆',
    [QualityTier.HIGH_QUALITY]: '⭐',
    [QualityTier.MODERATE_QUALITY]: '📊',
    [QualityTier.LIMITED_EVIDENCE]: '🔍',
    [QualityTier.PRECLINICAL]: '🧪'
  };

  return (
    <div className="group relative inline-block">
      <span
        className={`
          inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs
          ${colorClasses}
          ${className}
        `}
        title={tier}
      >
        {tierIcons[tier]}
      </span>

      {/* Mini tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40">
        <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {tier}
        </div>
      </div>
    </div>
  );
}

export default QualityBadge;