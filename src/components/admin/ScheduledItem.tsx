'use client';

import Link from 'next/link';
import { StatusBadge } from './StatusBadge';

export interface ScheduledArticle {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduled_publish_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  article_type?: string;
  category?: {
    id: string;
    name: string;
  } | null;
  meta_description?: string;
}

interface ScheduledItemProps {
  article: ScheduledArticle;
  onPublishNow?: (article: ScheduledArticle) => void;
  onReschedule?: (article: ScheduledArticle) => void;
  onUnpublish?: (article: ScheduledArticle) => void;
  onEdit?: (article: ScheduledArticle) => void;
  timezone?: string;
  isLoading?: boolean;
}

function formatDate(dateString: string, timezone: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: timezone,
    });
  } catch {
    return dateString;
  }
}

function formatTime(dateString: string, timezone: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    });
  } catch {
    return '';
  }
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  return '';
}

export function ScheduledItem({
  article,
  onPublishNow,
  onReschedule,
  onUnpublish,
  onEdit,
  timezone = 'Europe/Copenhagen',
  isLoading = false,
}: ScheduledItemProps) {
  const scheduledDate = article.scheduled_publish_at || article.published_at;
  const relativeTime = scheduledDate ? getRelativeTime(scheduledDate) : '';

  const getStatusDisplay = (): 'draft' | 'scheduled' | 'published' => {
    if (article.status === 'published') {
      if (article.scheduled_publish_at && new Date(article.scheduled_publish_at) > new Date()) {
        return 'scheduled';
      }
      return 'published';
    }
    if (article.status === 'scheduled') {
      return 'scheduled';
    }
    return 'draft';
  };

  const displayStatus = getStatusDisplay();

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate" title={article.title}>
            {article.title}
          </h3>
          <p className="text-sm text-gray-500 truncate">/{article.slug}</p>
        </div>
        <StatusBadge status={displayStatus} size="sm" />
      </div>

      {/* Meta Info */}
      <div className="space-y-2 mb-4">
        {article.category && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Category:</span>
            <span className="text-gray-700">{article.category.name}</span>
          </div>
        )}

        {article.article_type && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Type:</span>
            <span className="text-gray-700 capitalize">{article.article_type.replace(/_/g, ' ')}</span>
          </div>
        )}

        {scheduledDate && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">
              {displayStatus === 'scheduled' ? 'Scheduled:' : 'Published:'}
            </span>
            <span className="text-gray-700">
              {formatDate(scheduledDate, timezone)} at {formatTime(scheduledDate, timezone)}
            </span>
            {relativeTime && displayStatus === 'scheduled' && (
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                {relativeTime}
              </span>
            )}
          </div>
        )}

        {article.meta_description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {article.meta_description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {displayStatus === 'draft' && (
          <>
            {onPublishNow && (
              <button
                onClick={() => onPublishNow(article)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Publish Now
              </button>
            )}
            {onReschedule && (
              <button
                onClick={() => onReschedule(article)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Schedule
              </button>
            )}
          </>
        )}

        {displayStatus === 'scheduled' && (
          <>
            {onPublishNow && (
              <button
                onClick={() => onPublishNow(article)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Publish Now
              </button>
            )}
            {onReschedule && (
              <button
                onClick={() => onReschedule(article)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Reschedule
              </button>
            )}
            {onUnpublish && (
              <button
                onClick={() => onUnpublish(article)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Cancel Schedule
              </button>
            )}
          </>
        )}

        {displayStatus === 'published' && (
          <>
            {onUnpublish && (
              <button
                onClick={() => onUnpublish(article)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Unpublish
              </button>
            )}
          </>
        )}

        {/* Common actions */}
        <div className="ml-auto flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(article)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          <Link
            href={`/articles/${article.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for calendar sidebar or lists
 */
export function ScheduledItemCompact({
  article,
  onClick,
  timezone = 'Europe/Copenhagen',
}: {
  article: ScheduledArticle;
  onClick?: (article: ScheduledArticle) => void;
  timezone?: string;
}) {
  const scheduledDate = article.scheduled_publish_at || article.published_at;

  const getStatusDisplay = (): 'draft' | 'scheduled' | 'published' => {
    if (article.status === 'published') {
      if (article.scheduled_publish_at && new Date(article.scheduled_publish_at) > new Date()) {
        return 'scheduled';
      }
      return 'published';
    }
    if (article.status === 'scheduled') {
      return 'scheduled';
    }
    return 'draft';
  };

  const displayStatus = getStatusDisplay();

  const getStatusDot = () => {
    switch (displayStatus) {
      case 'published':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'draft':
        return 'bg-amber-500';
    }
  };

  return (
    <button
      onClick={() => onClick?.(article)}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot()}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600">
            {article.title}
          </p>
          {scheduledDate && (
            <p className="text-xs text-gray-500">
              {formatTime(scheduledDate, timezone)} - {formatDate(scheduledDate, timezone)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
