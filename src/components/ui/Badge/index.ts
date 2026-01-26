/**
 * Badge Component System
 *
 * A unified badge component system for the CBD Portal.
 * Provides consistent styling across all badge variants.
 *
 * @example
 * // Import main component and specialized variants
 * import { Badge, QualityBadge, StatusBadge, CategoryBadge, DateBadge, StudyTypeBadge } from '@/components/ui/Badge';
 *
 * // Import constants for custom implementations
 * import { BADGE_SIZES, QUALITY_COLORS, STATUS_COLORS } from '@/components/ui/Badge';
 */

// Main component and specialized variants
export {
  Badge,
  DateBadge,
  QualityBadge,
  StatusBadge,
  CategoryBadge,
  StudyTypeBadge
} from './Badge';

// Types
export type {
  BadgeProps,
  BadgeVariant,
  DateBadgeProps,
  QualityBadgeProps,
  StatusBadgeProps,
  CategoryBadgeProps,
  StudyTypeBadgeProps
} from './Badge';

// Constants and color mappings
export {
  BADGE_SIZES,
  QUALITY_COLORS,
  STATUS_COLORS,
  CATEGORY_COLORS,
  STUDY_TYPE_COLORS,
  DATE_COLORS,
  DEFAULT_COLORS,
  getColorClasses,
  getDateRecency
} from './constants';

// Constant types
export type {
  BadgeSize,
  QualityLevel,
  StatusType,
  CategoryType,
  StudyTypeKey,
  DateRecency
} from './constants';

// Default export
export { Badge as default } from './Badge';
