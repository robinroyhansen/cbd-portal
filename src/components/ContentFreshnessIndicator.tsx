'use client';

import { useMemo } from 'react';
import {
  getFreshnessLevel,
  getFreshnessColor,
  formatFreshnessText,
  getDaysSince,
  type FreshnessLevel,
} from '@/lib/utils/freshness';
import { formatDate } from '@/lib/locale';

export type ContentFreshnessVariant = 'badge' | 'text' | 'full';

interface ContentFreshnessIndicatorProps {
  /** The date the content was last updated */
  lastUpdated: Date | string;
  /** Optional: who last reviewed the content */
  lastReviewedBy?: string;
  /** Display variant: badge (compact), text (minimal), or full (badge + tooltip) */
  variant?: ContentFreshnessVariant;
  /** Whether to show the actual date */
  showDate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Content Freshness Indicator
 * Displays the freshness status of content with color-coded badges
 *
 * Fresh (< 30 days): Emerald/green - content is up to date
 * Moderate (30-90 days): Amber/yellow - content may need review soon
 * Stale (> 90 days): Orange - content needs review
 */
export function ContentFreshnessIndicator({
  lastUpdated,
  lastReviewedBy,
  variant = 'badge',
  showDate = false,
  className = '',
}: ContentFreshnessIndicatorProps) {
  const date = useMemo(
    () => (typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated),
    [lastUpdated]
  );

  const level = useMemo(() => getFreshnessLevel(date), [date]);
  const colors = useMemo(() => getFreshnessColor(level), [level]);
  const text = useMemo(() => formatFreshnessText(date), [date]);
  const days = useMemo(() => getDaysSince(date), [date]);
  const formattedDate = useMemo(() => formatDate(date), [date]);

  const ariaLabel = useMemo(() => {
    let label = `Content freshness: ${text}`;
    if (showDate) {
      label += `. Last updated on ${formattedDate}`;
    }
    if (lastReviewedBy) {
      label += `. Reviewed by ${lastReviewedBy}`;
    }
    return label;
  }, [text, showDate, formattedDate, lastReviewedBy]);

  // Icon component based on freshness level
  const Icon = () => {
    const iconClass = 'w-4 h-4 flex-shrink-0';

    switch (level) {
      case 'fresh':
        // Check circle icon
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'moderate':
        // Clock icon
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'stale':
        // Calendar icon
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  // Text-only variant (minimal)
  if (variant === 'text') {
    return (
      <span
        className={`text-sm ${colors.text} ${className}`}
        role="status"
        aria-label={ariaLabel}
      >
        {text}
      </span>
    );
  }

  // Badge variant (compact)
  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
        role="status"
        aria-label={ariaLabel}
      >
        <Icon />
        <span>{text}</span>
      </span>
    );
  }

  // Full variant (badge + tooltip with details)
  return (
    <div className={`relative group inline-block ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border cursor-help ${colors.bg} ${colors.text} ${colors.border}`}
        role="status"
        aria-label={ariaLabel}
        aria-describedby="freshness-tooltip"
        tabIndex={0}
      >
        <Icon />
        <span>{text}</span>
      </span>

      {/* Tooltip */}
      <div
        id="freshness-tooltip"
        role="tooltip"
        className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-gray-900 text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 whitespace-nowrap"
      >
        <div className="flex flex-col gap-1">
          <div className="font-medium">Last updated: {formattedDate}</div>
          <div className="text-gray-300">{days} days ago</div>
          {lastReviewedBy && (
            <div className="text-gray-300 pt-1 border-t border-gray-700">
              Reviewed by: {lastReviewedBy}
            </div>
          )}
        </div>
        {/* Tooltip arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
      </div>
    </div>
  );
}

/**
 * Get the freshness level for external use
 */
export { getFreshnessLevel, type FreshnessLevel };
