/**
 * Badge Component Constants
 *
 * Centralized color mappings and size configurations for the unified Badge component system.
 * These constants ensure consistent styling across all badge variants in the CBD Portal.
 */

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

export const BADGE_SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
} as const;

export type BadgeSize = keyof typeof BADGE_SIZES;

// ============================================================================
// QUALITY TIER COLORS
// ============================================================================

/**
 * Quality tier color mappings for research studies.
 * These align with the QualityTier enum from quality-tiers.ts
 */
export const QUALITY_COLORS = {
  'gold-standard': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    icon: '1f3c6' // trophy emoji
  },
  'high': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    icon: '2b50' // star emoji
  },
  'moderate': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: '1f4ca' // chart emoji
  },
  'limited': {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    icon: '1f50d' // magnifying glass
  },
  'preliminary': {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    icon: '1f9ea' // test tube
  }
} as const;

export type QualityLevel = keyof typeof QUALITY_COLORS;

// ============================================================================
// STATUS COLORS
// ============================================================================

/**
 * Status colors for workflow states (articles, reviews, etc.)
 */
export const STATUS_COLORS = {
  approved: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    icon: '2705' // check mark
  },
  pending: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    icon: '23f3' // hourglass
  },
  rejected: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    icon: '274c' // cross mark
  },
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300',
    icon: '1f4dd' // memo
  },
  published: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: '1f310' // globe
  },
  archived: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-300',
    icon: '1f4e6' // package
  }
} as const;

export type StatusType = keyof typeof STATUS_COLORS;

// ============================================================================
// CATEGORY COLORS
// ============================================================================

/**
 * Category colors for content classification
 */
export const CATEGORY_COLORS = {
  science: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    icon: '1f52c' // microscope
  },
  products: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    icon: '1f9f4' // lotion bottle
  },
  guides: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: '1f4da' // books
  },
  conditions: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    icon: '1f3e5' // hospital
  },
  news: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    icon: '1f4f0' // newspaper
  },
  research: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    icon: '1f4d1' // bookmark tabs
  },
  legal: {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    icon: '2696' // scales
  },
  dosage: {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-300',
    icon: '1f48a' // pill
  },
  comparison: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: '2696' // scales
  },
  beginner: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-300',
    icon: '1f331' // seedling
  }
} as const;

export type CategoryType = keyof typeof CATEGORY_COLORS;

// ============================================================================
// STUDY TYPE COLORS
// ============================================================================

/**
 * Study type colors for research methodology badges.
 * These align with the StudyType enum from quality-tiers.ts
 */
export const STUDY_TYPE_COLORS = {
  human: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: '1f9d1' // person
  },
  animal: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: '1f42d' // mouse
  },
  review: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    icon: '1f4da' // books
  },
  in_vitro: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-300',
    icon: '1f9ea' // test tube
  },
  meta_analysis: {
    bg: 'bg-violet-100',
    text: 'text-violet-800',
    border: 'border-violet-300',
    icon: '1f4ca' // chart
  },
  rct: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    icon: '1f3af' // target
  },
  observational: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: '1f440' // eyes
  },
  case_study: {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    icon: '1f4cb' // clipboard
  }
} as const;

export type StudyTypeKey = keyof typeof STUDY_TYPE_COLORS;

// ============================================================================
// DATE BADGE COLORS
// ============================================================================

/**
 * Date-based colors for recency indicators
 */
export const DATE_COLORS = {
  recent: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
  },
  moderate: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300'
  },
  older: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300'
  }
} as const;

export type DateRecency = keyof typeof DATE_COLORS;

// ============================================================================
// DEFAULT/NEUTRAL COLORS
// ============================================================================

export const DEFAULT_COLORS = {
  bg: 'bg-gray-100',
  text: 'text-gray-700',
  border: 'border-gray-200'
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get combined Tailwind classes for a color configuration
 */
export function getColorClasses(config: { bg: string; text: string; border: string }): string {
  return `${config.bg} ${config.text} ${config.border}`;
}

/**
 * Determine date recency based on year
 */
export function getDateRecency(year: number): DateRecency {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age <= 2) return 'recent';
  if (age <= 5) return 'moderate';
  return 'older';
}
