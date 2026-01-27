'use client';

/**
 * Admin Chat Dashboard
 * View and analyze chat conversations and feedback
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// Types for the chat list API response
interface ChatConversation {
  id: string;
  session_id: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
  user_message_count: number;
  assistant_message_count: number;
  language: string;
  user_agent: string | null;
  feedback_count: number;
  helpful_count: number;
  not_helpful_count: number;
  last_user_message: string | null;
  last_assistant_message: string | null;
}

interface ChatStats {
  total_conversations: number;
  total_messages: number;
  total_user_messages: number;
  total_assistant_messages: number;
  total_feedback: number;
  helpful_feedback: number;
  not_helpful_feedback: number;
  helpful_percentage: number;
  conversations_today: number;
  conversations_this_week: number;
}

interface ChatListResponse {
  conversations: ChatConversation[];
  stats: ChatStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Stats Card Component
function StatCard({
  value,
  label,
  icon,
  color = 'gray',
  subtitle,
}: {
  value: number | string;
  label: string;
  icon: string;
  color?: 'green' | 'blue' | 'purple' | 'amber' | 'gray' | 'red';
  subtitle?: string;
}) {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    gray: 'text-gray-900',
    red: 'text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-3xl font-bold ${colorClasses[color]}`}>
            {typeof value === 'number' ? value.toLocaleString('de-DE') : value}
          </p>
          <p className="text-sm text-gray-600 mt-1">{label}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

// Feedback Badge Component
function FeedbackBadge({ helpful, notHelpful }: { helpful: number; notHelpful: number }) {
  if (helpful === 0 && notHelpful === 0) {
    return <span className="text-gray-400 text-sm">No feedback</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {helpful > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          {helpful}
        </span>
      )}
      {notHelpful > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
          <svg className="w-3 h-3 rotate-180" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          {notHelpful}
        </span>
      )}
    </div>
  );
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

// Truncate session ID for display
function truncateSessionId(sessionId: string): string {
  if (sessionId.length <= 12) return sessionId;
  return `${sessionId.slice(0, 8)}...${sessionId.slice(-4)}`;
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-24"></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">💬</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chat Conversations Yet</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        When visitors use the chat assistant, their conversations will appear here.
        You'll be able to view messages, track feedback, and analyze chat patterns.
      </p>
    </div>
  );
}

export default function ChatAdminPage() {
  const [data, setData] = useState<ChatListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Filter state
  const [page, setPage] = useState(1);
  const [hasFeedback, setHasFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');

      if (hasFeedback) params.set('has_feedback', hasFeedback);
      if (feedbackType) params.set('feedback_type', feedbackType);
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);

      const response = await fetch(`/api/admin/chat?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch chat data');
      }

      const result: ChatListResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [page, hasFeedback, feedbackType, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteConversation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/admin/chat/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      fetchData();
    } catch (err) {
      alert('Failed to delete conversation');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    setShowDeleteAllConfirm(false);
    setDeleting('all');
    try {
      const response = await fetch('/api/admin/chat', { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      fetchData();
    } catch (err) {
      alert('Failed to delete all conversations');
    } finally {
      setDeleting(null);
    }
  };

  const stats = data?.stats;
  const conversations = data?.conversations || [];
  const pagination = data?.pagination;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Analytics</h1>
          <p className="text-gray-600">View and analyze customer chat conversations and feedback</p>
        </div>
        {data && data.conversations.length > 0 && (
          <button
            onClick={() => setShowDeleteAllConfirm(true)}
            disabled={deleting === 'all'}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleting === 'all' ? (
              <>
                <span className="animate-spin">⏳</span>
                Deleting...
              </>
            ) : (
              <>
                <span>🗑️</span>
                Delete All
              </>
            )}
          </button>
        )}
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete All Conversations?</h3>
            <p className="text-gray-600 mb-4">
              This will permanently delete all {stats?.total_conversations || 0} conversations,
              including all messages and feedback. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && !data ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-red-500 text-2xl">!</span>
            <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
          </div>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <StatCard
              value={stats?.total_conversations || 0}
              label="Conversations"
              icon="💬"
              color="blue"
            />
            <StatCard
              value={stats?.total_messages || 0}
              label="Total Messages"
              icon="📝"
              color="gray"
              subtitle={`${stats?.total_user_messages || 0} user / ${stats?.total_assistant_messages || 0} AI`}
            />
            <StatCard
              value={stats?.total_feedback || 0}
              label="Feedback Received"
              icon="📊"
              color="purple"
            />
            <StatCard
              value={`${stats?.helpful_percentage || 0}%`}
              label="Helpful Rate"
              icon={stats?.helpful_percentage && stats.helpful_percentage >= 70 ? '👍' : '📈'}
              color={stats?.helpful_percentage && stats.helpful_percentage >= 70 ? 'green' : 'amber'}
              subtitle={`${stats?.helpful_feedback || 0} helpful / ${stats?.not_helpful_feedback || 0} not`}
            />
            <StatCard
              value={stats?.conversations_today || 0}
              label="Today"
              icon="📅"
              color="green"
            />
            <StatCard
              value={stats?.conversations_this_week || 0}
              label="This Week"
              icon="📆"
              color="amber"
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Feedback:</label>
                <select
                  value={hasFeedback}
                  onChange={(e) => { setHasFeedback(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All</option>
                  <option value="true">Has Feedback</option>
                  <option value="false">No Feedback</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  value={feedbackType}
                  onChange={(e) => { setFeedbackType(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Types</option>
                  <option value="helpful">Helpful</option>
                  <option value="not_helpful">Not Helpful</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">From:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              {(hasFeedback || feedbackType || dateFrom || dateTo) && (
                <button
                  onClick={() => {
                    setHasFeedback('');
                    setFeedbackType('');
                    setDateFrom('');
                    setDateTo('');
                    setPage(1);
                  }}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear Filters
                </button>
              )}

              <span className="text-sm text-gray-500 ml-auto">
                {pagination?.total || 0} conversations
              </span>
            </div>
          </div>

          {/* Conversations List */}
          {conversations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Session
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Messages
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Started
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Last Message
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Feedback
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Preview
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {conversations.map((conversation) => (
                      <tr
                        key={conversation.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 font-mono">
                              {truncateSessionId(conversation.session_id)}
                            </code>
                            <span className="text-xs text-gray-400 uppercase">
                              {conversation.language}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-900">
                              {conversation.message_count}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({conversation.user_message_count}u / {conversation.assistant_message_count}a)
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {formatRelativeTime(conversation.started_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {formatRelativeTime(conversation.last_message_at)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <FeedbackBadge
                            helpful={conversation.helpful_count}
                            notHelpful={conversation.not_helpful_count}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600 truncate max-w-xs" title={conversation.last_user_message || ''}>
                            {conversation.last_user_message
                              ? conversation.last_user_message.substring(0, 60) + (conversation.last_user_message.length > 60 ? '...' : '')
                              : '-'}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/chat/${conversation.id}`}
                              className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDeleteConversation(conversation.id)}
                              disabled={deleting === conversation.id}
                              className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                            >
                              {deleting === conversation.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={page === pagination.totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
