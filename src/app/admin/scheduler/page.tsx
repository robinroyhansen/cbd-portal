'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CalendarEvent } from '@/components/admin/Calendar';
import { ScheduledItem, ScheduledItemCompact, ScheduledArticle } from '@/components/admin/ScheduledItem';
import { StatusBadge } from '@/components/admin/StatusBadge';

type ViewMode = 'calendar' | 'list';
type StatusFilter = 'all' | 'draft' | 'scheduled' | 'published';

// Detect user timezone
function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'Europe/Copenhagen'; // Default fallback
  }
}

interface ScheduleModalState {
  isOpen: boolean;
  article: ScheduledArticle | null;
  action: 'schedule' | 'reschedule' | null;
}

interface Stats {
  total: number;
  draft: number;
  scheduled: number;
  published: number;
}

export default function ContentSchedulerPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ScheduledArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ScheduledArticle | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [scheduleModal, setScheduleModal] = useState<ScheduleModalState>({
    isOpen: false,
    article: null,
    action: null,
  });
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [stats, setStats] = useState<Stats>({ total: 0, draft: 0, scheduled: 0, published: 0 });

  const timezone = getUserTimezone();

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/scheduler?status=${statusFilter}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }

      const data = await response.json();
      setArticles(data.articles || []);
      setStats(data.stats || { total: 0, draft: 0, scheduled: 0, published: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Convert articles to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return articles
      .filter((article) => article.scheduled_publish_at || article.published_at)
      .map((article) => {
        const dateStr = article.scheduled_publish_at || article.published_at;
        const date = new Date(dateStr!);

        // Determine display status
        let status: CalendarEvent['status'] = 'draft';
        if (article.status === 'published') {
          if (article.scheduled_publish_at && new Date(article.scheduled_publish_at) > new Date()) {
            status = 'scheduled';
          } else {
            status = 'published';
          }
        } else if (article.status === 'scheduled') {
          status = 'scheduled';
        } else {
          status = 'draft';
        }

        return {
          id: article.id,
          title: article.title,
          date,
          status,
          type: article.article_type,
        };
      });
  }, [articles]);

  // Articles for selected date
  const selectedDateArticles = useMemo(() => {
    if (!selectedDate) return [];

    return articles.filter((article) => {
      const articleDate = article.scheduled_publish_at || article.published_at;
      if (!articleDate) return false;

      const date = new Date(articleDate);
      return (
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getDate() === selectedDate.getDate()
      );
    });
  }, [articles, selectedDate]);

  // Filter articles for list view
  const filteredArticles = useMemo(() => {
    if (statusFilter === 'all') return articles;

    return articles.filter((article) => {
      if (statusFilter === 'draft') return article.status === 'draft';
      if (statusFilter === 'scheduled') {
        if (article.status === 'scheduled') return true;
        if (article.status === 'published' && article.scheduled_publish_at) {
          return new Date(article.scheduled_publish_at) > new Date();
        }
        return false;
      }
      if (statusFilter === 'published') {
        if (article.status !== 'published') return false;
        if (article.scheduled_publish_at) {
          return new Date(article.scheduled_publish_at) <= new Date();
        }
        return true;
      }
      return true;
    });
  }, [articles, statusFilter]);

  // Action handlers
  const handlePublishNow = async (article: ScheduledArticle) => {
    if (!confirm(`Publish "${article.title}" immediately?`)) return;

    setActionLoading(article.id);
    try {
      const response = await fetch(`/api/admin/scheduler/${article.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        body: JSON.stringify({ action: 'publish_now' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish article');
      }

      await fetchArticles();
      setSelectedArticle(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish article');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReschedule = (article: ScheduledArticle) => {
    // Pre-fill with existing schedule if available
    if (article.scheduled_publish_at) {
      const date = new Date(article.scheduled_publish_at);
      setScheduledDateTime(date.toISOString().slice(0, 16));
    } else {
      // Default to tomorrow at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setScheduledDateTime(tomorrow.toISOString().slice(0, 16));
    }

    setScheduleModal({
      isOpen: true,
      article,
      action: article.scheduled_publish_at ? 'reschedule' : 'schedule',
    });
  };

  const handleUnpublish = async (article: ScheduledArticle) => {
    const action = article.status === 'scheduled' ||
      (article.status === 'published' && article.scheduled_publish_at && new Date(article.scheduled_publish_at) > new Date())
      ? 'cancel_schedule'
      : 'unpublish';

    const message = action === 'cancel_schedule'
      ? `Cancel scheduled publication for "${article.title}"?`
      : `Unpublish "${article.title}" and revert to draft?`;

    if (!confirm(message)) return;

    setActionLoading(article.id);
    try {
      const response = await fetch(`/api/admin/scheduler/${article.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update article');
      }

      await fetchArticles();
      setSelectedArticle(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update article');
    } finally {
      setActionLoading(null);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!scheduleModal.article || !scheduledDateTime) return;

    setActionLoading(scheduleModal.article.id);
    try {
      const response = await fetch(`/api/admin/scheduler/${scheduleModal.article.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
        },
        body: JSON.stringify({
          action: 'schedule',
          scheduled_publish_at: new Date(scheduledDateTime).toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to schedule article');
      }

      await fetchArticles();
      setScheduleModal({ isOpen: false, article: null, action: null });
      setScheduledDateTime('');
      setSelectedArticle(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to schedule article');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (article: ScheduledArticle) => {
    router.push(`/admin/articles/${article.id}/edit`);
  };

  const handleEventClick = (event: CalendarEvent) => {
    const article = articles.find((a) => a.id === event.id);
    if (article) {
      setSelectedArticle(article);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedArticle(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Content Scheduler</h1>
            <p className="text-gray-600 mt-1">
              Schedule and manage article publication dates
            </p>
          </div>

          {/* Timezone Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Timezone: <strong>{timezone}</strong></span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Articles</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-amber-600">{stats.draft}</div>
            <div className="text-sm text-gray-500">Drafts</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-sm text-gray-500">Scheduled</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <div className="text-sm text-gray-500">Published</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </span>
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Drafts</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button
            onClick={fetchArticles}
            className="ml-4 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <div className="flex gap-6">
          {/* Calendar/List View */}
          <div className="flex-1">
            {viewMode === 'calendar' ? (
              <Calendar
                events={calendarEvents}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                selectedDate={selectedDate}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {statusFilter === 'all' ? 'All Articles' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Articles`}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredArticles.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                      No articles found
                    </div>
                  ) : (
                    filteredArticles.map((article) => (
                      <div key={article.id} className="p-4">
                        <ScheduledItem
                          article={article}
                          onPublishNow={handlePublishNow}
                          onReschedule={handleReschedule}
                          onUnpublish={handleUnpublish}
                          onEdit={handleEdit}
                          timezone={timezone}
                          isLoading={actionLoading === article.id}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Selected Date/Article Details */}
          {viewMode === 'calendar' && (
            <div className="w-96 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-8">
                {/* Selected Article Details */}
                {selectedArticle ? (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Article Details</h3>
                      <button
                        onClick={() => setSelectedArticle(null)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <ScheduledItem
                      article={selectedArticle}
                      onPublishNow={handlePublishNow}
                      onReschedule={handleReschedule}
                      onUnpublish={handleUnpublish}
                      onEdit={handleEdit}
                      timezone={timezone}
                      isLoading={actionLoading === selectedArticle.id}
                    />
                  </div>
                ) : selectedDate ? (
                  /* Selected Date Articles */
                  <div>
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        {selectedDate.toLocaleDateString('en-GB', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedDateArticles.length} article{selectedDateArticles.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto">
                      {selectedDateArticles.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No articles scheduled for this date
                        </div>
                      ) : (
                        <div className="py-2">
                          {selectedDateArticles.map((article) => (
                            <ScheduledItemCompact
                              key={article.id}
                              article={article}
                              onClick={setSelectedArticle}
                              timezone={timezone}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* No Selection */
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Click on a date or event to see details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleModal.isOpen && scheduleModal.article && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {scheduleModal.action === 'reschedule' ? 'Reschedule Article' : 'Schedule Article'}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Article:</p>
              <p className="font-medium text-gray-900">{scheduleModal.article.title}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                Timezone: {timezone}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setScheduleModal({ isOpen: false, article: null, action: null });
                  setScheduledDateTime('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleSubmit}
                disabled={!scheduledDateTime || actionLoading === scheduleModal.article.id}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === scheduleModal.article.id ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Scheduling...
                  </span>
                ) : (
                  'Schedule'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
