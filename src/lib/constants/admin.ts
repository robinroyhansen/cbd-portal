/**
 * Admin Constants
 *
 * Centralized constants for admin functionality.
 * Import these instead of duplicating values across components.
 */

// ============================================================================
// Status Colors - Consistent status badge styling
// ============================================================================

export const STATUS_COLORS = {
  // Research queue statuses
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  pending: 'bg-amber-100 text-amber-800',

  // Job statuses
  running: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  queued: 'bg-gray-100 text-gray-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-gray-100 text-gray-500',

  // Content statuses
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-800',
  archived: 'bg-gray-100 text-gray-500',

  // Generic
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-500',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-800',
} as const;

export type StatusColorKey = keyof typeof STATUS_COLORS;

// Helper function to get status color with fallback
export function getStatusColor(status: string | undefined | null): string {
  if (!status) return STATUS_COLORS.pending;
  const normalized = status.toLowerCase().replace(/[_-]/g, '');
  return (STATUS_COLORS as Record<string, string>)[normalized] || STATUS_COLORS.pending;
}

// ============================================================================
// Rejection Reasons - For research queue
// ============================================================================

export interface RejectionReason {
  id: string;
  label: string;
  description: string;
}

export const REJECTION_REASONS: RejectionReason[] = [
  {
    id: 'not_cbd',
    label: 'Not CBD/Cannabis focused',
    description: 'Study mentions CBD tangentially or is about something else entirely',
  },
  {
    id: 'animal_only',
    label: 'Animal/Preclinical only',
    description: 'No human relevance or translation to clinical use',
  },
  {
    id: 'low_quality',
    label: 'Low quality/rigor',
    description: 'Poor methodology, very small sample size, or unreliable source',
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    description: 'Study already exists in the database under a different source',
  },
  {
    id: 'no_abstract',
    label: 'No abstract/data',
    description: 'Missing abstract or key information needed for review',
  },
  {
    id: 'materials_science',
    label: 'Materials science',
    description: 'About CBD thin films, nanorods, or other non-medical applications',
  },
  {
    id: 'bile_duct',
    label: 'Bile duct (medical)',
    description: 'About common bile duct (CBD) medical procedures, not cannabidiol',
  },
  {
    id: 'extraction_method',
    label: 'Extraction method only',
    description: 'Focused purely on extraction techniques without health outcomes',
  },
  {
    id: 'agriculture',
    label: 'Agriculture/cultivation',
    description: 'About hemp farming or seed germination without therapeutic focus',
  },
  {
    id: 'synthetic_cannabinoid',
    label: 'Synthetic cannabinoid',
    description: 'About dangerous synthetic cannabinoids, not natural CBD',
  },
  {
    id: 'other',
    label: 'Other',
    description: 'Specify custom rejection reason',
  },
];

// Get rejection reason label by ID
export function getRejectionReasonLabel(id: string): string {
  return REJECTION_REASONS.find((r) => r.id === id)?.label || id;
}

// ============================================================================
// Score Thresholds - For quality and relevance scoring
// ============================================================================

export const SCORE_THRESHOLDS = {
  // Quality score thresholds
  quality: {
    high: 70,
    medium: 50,
    low: 30,
  },
  // Relevance score thresholds
  relevance: {
    high: 70,
    medium: 50,
    low: 30,
    minimum: 40, // Minimum for public display
  },
  // Confirmation score threshold
  confirmation: {
    minimum: 50, // Minimum to pass validation
  },
} as const;

// Get score tier label
export function getScoreTier(score: number | undefined | null): 'high' | 'medium' | 'low' | 'none' {
  if (score === undefined || score === null) return 'none';
  if (score >= SCORE_THRESHOLDS.quality.high) return 'high';
  if (score >= SCORE_THRESHOLDS.quality.medium) return 'medium';
  return 'low';
}

// Score tier colors
export const SCORE_TIER_COLORS = {
  high: 'text-green-600',
  medium: 'text-amber-600',
  low: 'text-red-600',
  none: 'text-gray-400',
} as const;

// ============================================================================
// Study Subject Types
// ============================================================================

export const STUDY_SUBJECT_TYPES = {
  human: { label: 'Human', color: 'bg-blue-100 text-blue-800' },
  review: { label: 'Review', color: 'bg-purple-100 text-purple-800' },
  animal: { label: 'Animal', color: 'bg-amber-100 text-amber-800' },
  in_vitro: { label: 'In Vitro', color: 'bg-gray-100 text-gray-800' },
} as const;

export type StudySubjectType = keyof typeof STUDY_SUBJECT_TYPES;

// ============================================================================
// Pagination Defaults
// ============================================================================

export const PAGINATION = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
  maxPageSize: 100,
} as const;

// ============================================================================
// Research Sources
// ============================================================================

export const RESEARCH_SOURCES = [
  { id: 'pubmed', label: 'PubMed', color: 'bg-blue-100 text-blue-800' },
  { id: 'pmc', label: 'PMC', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'clinicaltrials', label: 'ClinicalTrials.gov', color: 'bg-green-100 text-green-800' },
  { id: 'openalex', label: 'OpenAlex', color: 'bg-orange-100 text-orange-800' },
  { id: 'europepmc', label: 'Europe PMC', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'semanticscholar', label: 'Semantic Scholar', color: 'bg-purple-100 text-purple-800' },
  { id: 'biorxiv', label: 'bioRxiv', color: 'bg-pink-100 text-pink-800' },
  { id: 'medrxiv', label: 'medRxiv', color: 'bg-red-100 text-red-800' },
] as const;

// Get source label by ID
export function getSourceLabel(sourceId: string): string {
  return RESEARCH_SOURCES.find((s) => s.id === sourceId)?.label || sourceId;
}

// ============================================================================
// Admin Actions (for audit logging)
// ============================================================================

export const ADMIN_ACTIONS = {
  // Research
  APPROVE_STUDY: 'approve_study',
  REJECT_STUDY: 'reject_study',
  UPDATE_STUDY: 'update_study',
  DELETE_STUDY: 'delete_study',
  BULK_APPROVE: 'bulk_approve',
  BULK_REJECT: 'bulk_reject',

  // Articles
  CREATE_ARTICLE: 'create_article',
  UPDATE_ARTICLE: 'update_article',
  DELETE_ARTICLE: 'delete_article',
  PUBLISH_ARTICLE: 'publish_article',
  UNPUBLISH_ARTICLE: 'unpublish_article',

  // Brands
  CREATE_BRAND: 'create_brand',
  UPDATE_BRAND: 'update_brand',
  DELETE_BRAND: 'delete_brand',
  CREATE_REVIEW: 'create_review',
  UPDATE_REVIEW: 'update_review',
  DELETE_REVIEW: 'delete_review',

  // Scanner
  START_SCAN: 'start_scan',
  PAUSE_SCAN: 'pause_scan',
  RESUME_SCAN: 'resume_scan',
  CANCEL_SCAN: 'cancel_scan',

  // Settings
  ADD_BLACKLIST_TERM: 'add_blacklist_term',
  REMOVE_BLACKLIST_TERM: 'remove_blacklist_term',
  UPDATE_SETTINGS: 'update_settings',

  // Conditions
  CREATE_CONDITION: 'create_condition',
  UPDATE_CONDITION: 'update_condition',
  DELETE_CONDITION: 'delete_condition',
  MAP_CONDITION: 'map_condition',

  // Glossary
  CREATE_TERM: 'create_term',
  UPDATE_TERM: 'update_term',
  DELETE_TERM: 'delete_term',
} as const;

export type AdminAction = (typeof ADMIN_ACTIONS)[keyof typeof ADMIN_ACTIONS];

// ============================================================================
// Resource Types (for audit logging)
// ============================================================================

export const RESOURCE_TYPES = {
  RESEARCH: 'research',
  ARTICLE: 'article',
  BRAND: 'brand',
  BRAND_REVIEW: 'brand_review',
  CONDITION: 'condition',
  GLOSSARY: 'glossary',
  SCANNER_JOB: 'scanner_job',
  BLACKLIST: 'blacklist',
  SETTINGS: 'settings',
  COMMENT: 'comment',
  AUTHOR: 'author',
} as const;

export type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];
