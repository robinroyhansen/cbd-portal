interface DateBadgeProps {
  publishedAt: string | Date;
  updatedAt: string | Date;
}

export function DateBadge({ publishedAt, updatedAt }: DateBadgeProps) {
  const published = new Date(publishedAt);
  const updated = new Date(updatedAt);

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if updated is significantly after published (more than 1 day)
  const wasUpdated = (updated.getTime() - published.getTime()) > 24 * 60 * 60 * 1000;

  // Check if updated recently (within last 30 days)
  const recentlyUpdated = wasUpdated &&
    (Date.now() - updated.getTime()) < 30 * 24 * 60 * 60 * 1000;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span>{formatShortDate(published)}</span>
      {recentlyUpdated && (
        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
          Updated
        </span>
      )}
    </div>
  );
}