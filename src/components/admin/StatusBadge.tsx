'use client';

import { STATUS_COLORS, getStatusColor, StatusColorKey } from '@/lib/constants/admin';

interface StatusBadgeProps {
  status: string | undefined | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Reusable status badge component with consistent styling
 *
 * Usage:
 * ```tsx
 * <StatusBadge status="approved" />
 * <StatusBadge status="pending" size="lg" />
 * <StatusBadge status={study.status} />
 * ```
 */
export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const displayStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
    : 'Unknown';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      {displayStatus}
    </span>
  );
}

/**
 * Score badge with color based on threshold
 */
interface ScoreBadgeProps {
  score: number | undefined | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({ score, size = 'md', showLabel = false, className = '' }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  let colorClass: string;
  let label: string;

  if (score === undefined || score === null) {
    colorClass = 'bg-gray-100 text-gray-500';
    label = 'N/A';
  } else if (score >= 70) {
    colorClass = 'bg-green-100 text-green-800';
    label = 'High';
  } else if (score >= 50) {
    colorClass = 'bg-amber-100 text-amber-800';
    label = 'Medium';
  } else {
    colorClass = 'bg-red-100 text-red-800';
    label = 'Low';
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      {score ?? '-'}
      {showLabel && score !== undefined && score !== null && (
        <span className="ml-1 opacity-75">({label})</span>
      )}
    </span>
  );
}

/**
 * Boolean badge (Yes/No, Active/Inactive, etc.)
 */
interface BooleanBadgeProps {
  value: boolean | undefined | null;
  trueLabel?: string;
  falseLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BooleanBadge({
  value,
  trueLabel = 'Yes',
  falseLabel = 'No',
  size = 'md',
  className = '',
}: BooleanBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const colorClass = value
    ? 'bg-green-100 text-green-800'
    : 'bg-gray-100 text-gray-600';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      {value ? trueLabel : falseLabel}
    </span>
  );
}

/**
 * Source badge for research sources
 */
interface SourceBadgeProps {
  source: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SOURCE_COLORS: Record<string, string> = {
  pubmed: 'bg-blue-100 text-blue-800',
  pmc: 'bg-indigo-100 text-indigo-800',
  clinicaltrials: 'bg-green-100 text-green-800',
  openalex: 'bg-orange-100 text-orange-800',
  europepmc: 'bg-yellow-100 text-yellow-800',
  semanticscholar: 'bg-purple-100 text-purple-800',
  biorxiv: 'bg-pink-100 text-pink-800',
  medrxiv: 'bg-red-100 text-red-800',
};

const SOURCE_LABELS: Record<string, string> = {
  pubmed: 'PubMed',
  pmc: 'PMC',
  clinicaltrials: 'ClinicalTrials.gov',
  openalex: 'OpenAlex',
  europepmc: 'Europe PMC',
  semanticscholar: 'Semantic Scholar',
  biorxiv: 'bioRxiv',
  medrxiv: 'medRxiv',
};

export function SourceBadge({ source, size = 'md', className = '' }: SourceBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const normalizedSource = source.toLowerCase().replace(/[^a-z]/g, '');
  const colorClass = SOURCE_COLORS[normalizedSource] || 'bg-gray-100 text-gray-800';
  const label = SOURCE_LABELS[normalizedSource] || source;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      {label}
    </span>
  );
}
