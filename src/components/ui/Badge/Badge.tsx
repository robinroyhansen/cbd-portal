'use client';

import { ReactNode } from 'react';
import {
  BADGE_SIZES,
  QUALITY_COLORS,
  STATUS_COLORS,
  CATEGORY_COLORS,
  STUDY_TYPE_COLORS,
  DATE_COLORS,
  DEFAULT_COLORS,
  getColorClasses,
  getDateRecency,
  type BadgeSize,
  type QualityLevel,
  type StatusType,
  type CategoryType,
  type StudyTypeKey,
  type DateRecency
} from './constants';

// ============================================================================
// TYPES
// ============================================================================

export type BadgeVariant = 'default' | 'status' | 'quality' | 'category' | 'date' | 'study-type';

export interface BadgeProps {
  /** The variant determines the color scheme mapping */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
  /** Color key for the selected variant (e.g., 'approved' for status, 'high' for quality) */
  color?: string;
  /** Optional icon (emoji or character) to display */
  icon?: string;
  /** Accessibility label for the icon */
  iconLabel?: string;
  /** Tooltip text shown on hover */
  tooltip?: string;
  /** Additional CSS classes */
  className?: string;
  /** Badge content */
  children: ReactNode;
}

export interface DateBadgeProps extends Omit<BadgeProps, 'variant' | 'color'> {
  /** Year to display and determine recency */
  year: number;
}

export interface QualityBadgeProps extends Omit<BadgeProps, 'variant' | 'color'> {
  /** Quality level key */
  level: QualityLevel;
  /** Optional quality score (0-100) */
  score?: number;
}

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'color'> {
  /** Status type key */
  status: StatusType;
}

export interface CategoryBadgeProps extends Omit<BadgeProps, 'variant' | 'color'> {
  /** Category type key */
  category: CategoryType;
}

export interface StudyTypeBadgeProps extends Omit<BadgeProps, 'variant' | 'color'> {
  /** Study type key */
  studyType: StudyTypeKey;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get color configuration based on variant and color key
 */
function getVariantColors(variant: BadgeVariant, colorKey?: string): { bg: string; text: string; border: string } {
  switch (variant) {
    case 'quality':
      return colorKey && colorKey in QUALITY_COLORS
        ? QUALITY_COLORS[colorKey as QualityLevel]
        : DEFAULT_COLORS;

    case 'status':
      return colorKey && colorKey in STATUS_COLORS
        ? STATUS_COLORS[colorKey as StatusType]
        : DEFAULT_COLORS;

    case 'category':
      return colorKey && colorKey in CATEGORY_COLORS
        ? CATEGORY_COLORS[colorKey as CategoryType]
        : DEFAULT_COLORS;

    case 'study-type':
      return colorKey && colorKey in STUDY_TYPE_COLORS
        ? STUDY_TYPE_COLORS[colorKey as StudyTypeKey]
        : DEFAULT_COLORS;

    case 'date':
      return colorKey && colorKey in DATE_COLORS
        ? DATE_COLORS[colorKey as DateRecency]
        : DEFAULT_COLORS;

    default:
      return DEFAULT_COLORS;
  }
}

/**
 * Convert Unicode code point to emoji character
 */
function codePointToEmoji(codePoint: string): string {
  try {
    return String.fromCodePoint(parseInt(codePoint, 16));
  } catch {
    return '';
  }
}

/**
 * Get default icon for a variant and color combination
 */
function getDefaultIcon(variant: BadgeVariant, colorKey?: string): string | undefined {
  if (!colorKey) return undefined;

  switch (variant) {
    case 'quality':
      const qualityConfig = QUALITY_COLORS[colorKey as QualityLevel];
      return qualityConfig ? codePointToEmoji(qualityConfig.icon) : undefined;

    case 'status':
      const statusConfig = STATUS_COLORS[colorKey as StatusType];
      return statusConfig ? codePointToEmoji(statusConfig.icon) : undefined;

    case 'category':
      const categoryConfig = CATEGORY_COLORS[colorKey as CategoryType];
      return categoryConfig ? codePointToEmoji(categoryConfig.icon) : undefined;

    case 'study-type':
      const studyConfig = STUDY_TYPE_COLORS[colorKey as StudyTypeKey];
      return studyConfig ? codePointToEmoji(studyConfig.icon) : undefined;

    default:
      return undefined;
  }
}

// ============================================================================
// MAIN BADGE COMPONENT
// ============================================================================

/**
 * Unified Badge Component
 *
 * A flexible badge component that supports multiple variants for different use cases:
 * - default: Basic badge with customizable colors
 * - status: Workflow states (approved, pending, rejected, draft)
 * - quality: Research quality tiers (gold-standard, high, moderate, limited, preliminary)
 * - category: Content categories (science, products, guides, etc.)
 * - date: Year-based badges with recency coloring
 * - study-type: Research study methodology badges
 *
 * @example
 * // Default badge
 * <Badge>Tag</Badge>
 *
 * // Status badge
 * <Badge variant="status" color="approved">Approved</Badge>
 *
 * // Quality badge with icon
 * <Badge variant="quality" color="high" icon="*">High Quality</Badge>
 *
 * // Badge with tooltip
 * <Badge variant="category" color="science" tooltip="Scientific content">Science</Badge>
 */
export function Badge({
  variant = 'default',
  size = 'md',
  color,
  icon,
  iconLabel,
  tooltip,
  className = '',
  children
}: BadgeProps) {
  // Get color configuration
  const colorConfig = getVariantColors(variant, color);

  // Determine icon to display
  const displayIcon = icon ?? getDefaultIcon(variant, color);

  // Build class names
  const baseClasses = 'inline-flex items-center gap-1 rounded-full border font-medium transition-colors';
  const sizeClasses = BADGE_SIZES[size];
  const colorClasses = getColorClasses(colorConfig);

  const badgeContent = (
    <span
      className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`}
    >
      {displayIcon && (
        <span
          className="flex-shrink-0"
          aria-hidden={!iconLabel}
          aria-label={iconLabel}
          role={iconLabel ? 'img' : undefined}
        >
          {displayIcon}
        </span>
      )}
      <span className="font-semibold">{children}</span>
    </span>
  );

  // If no tooltip, return badge directly
  if (!tooltip) {
    return badgeContent;
  }

  // Wrap with tooltip
  return (
    <div className="group relative inline-block">
      {badgeContent}
      <div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   pointer-events-none z-50"
        role="tooltip"
      >
        <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg max-w-xs whitespace-nowrap">
          {tooltip}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SPECIALIZED BADGE COMPONENTS
// ============================================================================

/**
 * Date Badge Component
 *
 * Displays a year with automatic recency-based coloring.
 *
 * @example
 * <DateBadge year={2024} /> // Shows as "recent" (green)
 * <DateBadge year={2018} /> // Shows as "older" (gray)
 */
export function DateBadge({
  year,
  size = 'sm',
  icon,
  iconLabel,
  tooltip,
  className = '',
  children
}: DateBadgeProps) {
  const recency = getDateRecency(year);
  const defaultTooltip = tooltip ?? `Published in ${year}`;

  return (
    <Badge
      variant="date"
      size={size}
      color={recency}
      icon={icon}
      iconLabel={iconLabel}
      tooltip={defaultTooltip}
      className={className}
    >
      {children ?? year}
    </Badge>
  );
}

/**
 * Quality Badge Component
 *
 * Displays research quality tier with appropriate styling.
 *
 * @example
 * <QualityBadge level="high" />
 * <QualityBadge level="gold-standard" score={95} />
 */
export function QualityBadge({
  level,
  score,
  size = 'md',
  icon,
  iconLabel,
  tooltip,
  className = '',
  children
}: QualityBadgeProps) {
  // Build tooltip with score if provided
  const qualityDescriptions: Record<QualityLevel, string> = {
    'gold-standard': 'Highest quality evidence from well-designed RCTs or comprehensive meta-analyses',
    'high': 'Strong evidence from good quality controlled studies',
    'moderate': 'Moderate evidence with some limitations in methodology or scope',
    'limited': 'Preliminary evidence requiring further validation',
    'preliminary': 'Early-stage evidence from laboratory or animal studies'
  };

  const baseTooltip = qualityDescriptions[level];
  const scoreText = score !== undefined ? ` (Score: ${score}/100)` : '';
  const defaultTooltip = tooltip ?? `${baseTooltip}${scoreText}`;

  // Format display label
  const displayLabels: Record<QualityLevel, string> = {
    'gold-standard': 'Gold Standard',
    'high': 'High Quality',
    'moderate': 'Moderate',
    'limited': 'Limited',
    'preliminary': 'Preliminary'
  };

  return (
    <Badge
      variant="quality"
      size={size}
      color={level}
      icon={icon}
      iconLabel={iconLabel ?? `${displayLabels[level]} quality`}
      tooltip={defaultTooltip}
      className={className}
    >
      {children ?? displayLabels[level]}
    </Badge>
  );
}

/**
 * Status Badge Component
 *
 * Displays workflow status with appropriate styling.
 *
 * @example
 * <StatusBadge status="approved" />
 * <StatusBadge status="pending">Awaiting Review</StatusBadge>
 */
export function StatusBadge({
  status,
  size = 'md',
  icon,
  iconLabel,
  tooltip,
  className = '',
  children
}: StatusBadgeProps) {
  const displayLabels: Record<StatusType, string> = {
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived'
  };

  return (
    <Badge
      variant="status"
      size={size}
      color={status}
      icon={icon}
      iconLabel={iconLabel ?? `${displayLabels[status]} status`}
      tooltip={tooltip}
      className={className}
    >
      {children ?? displayLabels[status]}
    </Badge>
  );
}

/**
 * Category Badge Component
 *
 * Displays content category with appropriate styling.
 *
 * @example
 * <CategoryBadge category="science" />
 * <CategoryBadge category="guides">Getting Started</CategoryBadge>
 */
export function CategoryBadge({
  category,
  size = 'sm',
  icon,
  iconLabel,
  tooltip,
  className = '',
  children
}: CategoryBadgeProps) {
  const displayLabels: Record<CategoryType, string> = {
    science: 'Science',
    products: 'Products',
    guides: 'Guides',
    conditions: 'Conditions',
    news: 'News',
    research: 'Research',
    legal: 'Legal',
    dosage: 'Dosage',
    comparison: 'Comparison',
    beginner: 'Beginner'
  };

  return (
    <Badge
      variant="category"
      size={size}
      color={category}
      icon={icon}
      iconLabel={iconLabel ?? `${displayLabels[category]} category`}
      tooltip={tooltip}
      className={className}
    >
      {children ?? displayLabels[category]}
    </Badge>
  );
}

/**
 * Study Type Badge Component
 *
 * Displays research study type with appropriate styling.
 *
 * @example
 * <StudyTypeBadge studyType="human" />
 * <StudyTypeBadge studyType="rct">Randomized Trial</StudyTypeBadge>
 */
export function StudyTypeBadge({
  studyType,
  size = 'sm',
  icon,
  iconLabel,
  tooltip,
  className = '',
  children
}: StudyTypeBadgeProps) {
  const displayLabels: Record<StudyTypeKey, string> = {
    human: 'Human Study',
    animal: 'Animal Study',
    review: 'Review',
    in_vitro: 'In Vitro',
    meta_analysis: 'Meta-Analysis',
    rct: 'RCT',
    observational: 'Observational',
    case_study: 'Case Study'
  };

  const descriptions: Record<StudyTypeKey, string> = {
    human: 'Clinical study conducted with human participants',
    animal: 'Research conducted on animal models',
    review: 'Systematic review of existing research',
    in_vitro: 'Laboratory study using cells or tissues',
    meta_analysis: 'Statistical analysis combining multiple studies',
    rct: 'Randomized Controlled Trial - gold standard methodology',
    observational: 'Observational study without intervention',
    case_study: 'Detailed analysis of individual cases'
  };

  return (
    <Badge
      variant="study-type"
      size={size}
      color={studyType}
      icon={icon}
      iconLabel={iconLabel ?? displayLabels[studyType]}
      tooltip={tooltip ?? descriptions[studyType]}
      className={className}
    >
      {children ?? displayLabels[studyType]}
    </Badge>
  );
}

export default Badge;
