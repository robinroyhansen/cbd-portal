'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import { ADMIN_ACTIONS, RESOURCE_TYPES } from '@/lib/constants/admin';

interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  admin_identifier: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

interface ActivityStats {
  last24Hours: number;
  byAction: Record<string, number>;
}

const ACTION_LABELS: Record<string, string> = {
  approve_study: 'Approved Study',
  reject_study: 'Rejected Study',
  update_study: 'Updated Study',
  delete_study: 'Deleted Study',
  create_article: 'Created Article',
  update_article: 'Updated Article',
  delete_article: 'Deleted Article',
  publish_article: 'Published Article',
  create_brand: 'Created Brand',
  update_brand: 'Updated Brand',
  delete_brand: 'Deleted Brand',
  create_review: 'Created Review',
  update_review: 'Updated Review',
  start_scan: 'Started Scan',
  pause_scan: 'Paused Scan',
  cancel_scan: 'Cancelled Scan',
  add_blacklist_term: 'Added Blacklist Term',
  remove_blacklist_term: 'Removed Blacklist Term',
};

const ACTION_COLORS: Record<string, string> = {
  approve_study: 'bg-green-100 text-green-800',
  reject_study: 'bg-red-100 text-red-800',
  delete_study: 'bg-red-100 text-red-800',
  delete_article: 'bg-red-100 text-red-800',
  delete_brand: 'bg-red-100 text-red-800',
  create_article: 'bg-blue-100 text-blue-800',
  create_brand: 'bg-blue-100 text-blue-800',
  create_review: 'bg-blue-100 text-blue-800',
  publish_article: 'bg-green-100 text-green-800',
  start_scan: 'bg-purple-100 text-purple-800',
  add_blacklist_term: 'bg-amber-100 text-amber-800',
  remove_blacklist_term: 'bg-amber-100 text-amber-800',
};

export default function ActivityPage() {
  const { getAuthHeaders } = useAdminAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ action: string; resourceType: string }>({
    action: '',
    resourceType: '',
  });

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.action) params.set('action', filter.action);
      if (filter.resourceType) params.set('resourceType', filter.resourceType);

      const res = await fetch(`/api/admin/activity?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch activity');
      }

      const data = await res.json();
      setLogs(data.logs || []);
      setStats(data.stats || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, filter]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionLabel = (action: string) => ACTION_LABELS[action] || action;
  const getActionColor = (action: string) => ACTION_COLORS[action] || 'bg-gray-100 text-gray-800';

  const getResourceLink = (entry: AuditLogEntry) => {
    if (!entry.resource_id) return null;

    switch (entry.resource_type) {
      case 'research':
        return `/admin/research/studies/${entry.resource_id}`;
      case 'article':
        return `/admin/articles/${entry.resource_id}`;
      case 'brand':
        return `/admin/brands/${entry.resource_id}`;
      default:
        return null;
    }
  };

  const uniqueActions = [...new Set(logs.map((l) => l.action))];
  const uniqueResourceTypes = [...new Set(logs.map((l) => l.resource_type))];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-gray-600 mt-1">Track all admin actions and changes</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Last 24 Hours</div>
            <div className="text-2xl font-bold text-gray-900">{stats.last24Hours}</div>
            <div className="text-xs text-gray-400">actions</div>
          </div>

          {Object.entries(stats.byAction)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([action, count]) => (
              <div key={action} className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">{getActionLabel(action)}</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-400">today</div>
              </div>
            ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filter.action}
              onChange={(e) => setFilter((f) => ({ ...f, action: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
            <select
              value={filter.resourceType}
              onChange={(e) => setFilter((f) => ({ ...f, resourceType: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            >
              <option value="">All Types</option>
              {uniqueResourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchActivity}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchActivity}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading activity...</p>
        </div>
      )}

      {/* Activity List */}
      {!loading && logs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No activity found</p>
          <p className="text-sm text-gray-400 mt-1">
            Activity will appear here once the audit log migration is run and actions are performed.
          </p>
        </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((entry) => {
                const resourceLink = getResourceLink(entry);
                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getActionColor(
                          entry.action
                        )}`}
                      >
                        {getActionLabel(entry.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {entry.resource_type.charAt(0).toUpperCase() + entry.resource_type.slice(1)}
                      </div>
                      {entry.resource_id && (
                        <div className="text-xs text-gray-500">
                          {resourceLink ? (
                            <a href={resourceLink} className="text-primary-600 hover:underline">
                              {entry.resource_id.slice(0, 8)}...
                            </a>
                          ) : (
                            <span>{entry.resource_id.slice(0, 8)}...</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {entry.details && (
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {entry.details.title && <span>{String(entry.details.title)}</span>}
                          {entry.details.term && <span>Term: {String(entry.details.term)}</span>}
                          {entry.details.name && <span>{String(entry.details.name)}</span>}
                          {entry.details.count && <span>{String(entry.details.count)} items</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{entry.ip_address || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(entry.created_at)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
