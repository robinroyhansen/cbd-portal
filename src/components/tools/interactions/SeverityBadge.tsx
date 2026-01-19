'use client';

import type { InteractionSeverity, SeverityBadgeProps } from '@/types/drug-interactions';
import { getSeverityInfo } from '@/lib/interactions/severity-config';

export function SeverityBadge({ severity, size = 'md' }: SeverityBadgeProps) {
  const info = getSeverityInfo(severity);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  const colorClasses: Record<InteractionSeverity, string> = {
    major: 'bg-red-100 text-red-800 border border-red-200',
    moderate: 'bg-orange-100 text-orange-800 border border-orange-200',
    minor: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    unknown: 'bg-gray-100 text-gray-800 border border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeClasses[size]} ${colorClasses[severity]}`}
    >
      {info.shortLabel}
    </span>
  );
}
