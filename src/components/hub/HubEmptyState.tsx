'use client';

import Link from 'next/link';

interface HubEmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function HubEmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  actionHref,
}: HubEmptyStateProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
      <span className="text-5xl mb-4 block">{icon}</span>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
