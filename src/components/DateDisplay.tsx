'use client';

interface DateDisplayProps {
  publishedAt: string | Date;
  updatedAt: string | Date;
  showUpdated?: boolean;
}

export function DateDisplay({ publishedAt, updatedAt, showUpdated = true }: DateDisplayProps) {
  const published = new Date(publishedAt);
  const updated = new Date(updatedAt);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Only show "Updated" if it's at least 1 day after published
  const showUpdateDate = showUpdated &&
    (updated.getTime() - published.getTime()) > 24 * 60 * 60 * 1000;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
      <div className="flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Published: <time dateTime={published.toISOString()}>{formatDate(published)}</time></span>
      </div>

      {showUpdateDate && (
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Updated: <time dateTime={updated.toISOString()}>{formatDate(updated)}</time></span>
        </div>
      )}
    </div>
  );
}