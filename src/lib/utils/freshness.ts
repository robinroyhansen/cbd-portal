/**
 * Content freshness utilities for tracking article update status
 */

export type FreshnessLevel = 'fresh' | 'moderate' | 'stale';

/**
 * Determine the freshness level based on the date
 * Fresh: < 30 days
 * Moderate: 30-90 days
 * Stale: > 90 days
 */
export function getFreshnessLevel(date: Date): FreshnessLevel {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return 'fresh';
  } else if (diffDays <= 90) {
    return 'moderate';
  } else {
    return 'stale';
  }
}

/**
 * Get the number of days since the given date
 */
export function getDaysSince(date: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get color classes for a freshness level
 */
export function getFreshnessColor(level: FreshnessLevel): { bg: string; text: string; border: string } {
  switch (level) {
    case 'fresh':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      };
    case 'moderate':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      };
    case 'stale':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
      };
  }
}

/**
 * Format human-readable freshness text
 */
export function formatFreshnessText(date: Date): string {
  const days = getDaysSince(date);
  const level = getFreshnessLevel(date);

  if (level === 'fresh') {
    if (days === 0) {
      return 'Updated today';
    } else if (days === 1) {
      return 'Updated yesterday';
    } else if (days < 7) {
      return `Updated ${days} days ago`;
    } else if (days < 14) {
      return 'Updated last week';
    } else {
      return 'Recently updated';
    }
  } else if (level === 'moderate') {
    if (days < 60) {
      return `Updated ${Math.floor(days / 7)} weeks ago`;
    } else {
      return `Updated ${Math.floor(days / 30)} months ago`;
    }
  } else {
    // Stale content - suggest review is scheduled
    return 'Review scheduled';
  }
}

/**
 * Get icon name for freshness level (for use with icon components)
 */
export function getFreshnessIcon(level: FreshnessLevel): 'check-circle' | 'clock' | 'calendar' {
  switch (level) {
    case 'fresh':
      return 'check-circle';
    case 'moderate':
      return 'clock';
    case 'stale':
      return 'calendar';
  }
}
