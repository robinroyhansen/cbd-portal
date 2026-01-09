'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Comment {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  author_ip: string | null;
  user_agent: string | null;
  comment_text: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  parent_id: string | null;
  created_at: string;
  article?: {
    id: string;
    title: string;
    slug: string;
  };
}

interface StatusCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'spam';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [counts, setCounts] = useState<StatusCounts>({ all: 0, pending: 0, approved: 0, rejected: 0, spam: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/comments?status=${statusFilter}`);
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setComments(data.comments || []);
      setCounts(data.counts || { all: 0, pending: 0, approved: 0, rejected: 0, spam: 0 });
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (ids: string[], status: string) => {
    try {
      setProcessing(true);
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSelectedIds(new Set());
      fetchComments();
    } catch (err) {
      console.error('Error updating comments:', err);
      alert('Failed to update comments');
    } finally {
      setProcessing(false);
    }
  };

  const deleteComments = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} comment(s)? This cannot be undone.`)) return;

    try {
      setProcessing(true);
      const res = await fetch('/api/admin/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSelectedIds(new Set());
      fetchComments();
    } catch (err) {
      console.error('Error deleting comments:', err);
      alert('Failed to delete comments');
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    if (bulkAction === 'delete') {
      deleteComments(ids);
    } else {
      updateStatus(ids, bulkAction);
    }
    setBulkAction('');
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === comments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(comments.map(c => c.id)));
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    spam: 'bg-gray-100 text-gray-800'
  };

  const statusIcons = {
    pending: '⏳',
    approved: '✓',
    rejected: '✗',
    spam: '🚫'
  };

  if (loading && comments.length === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comments</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage article comments and moderation
          </p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
        {(['all', 'pending', 'approved', 'rejected', 'spam'] as StatusFilter[]).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
              statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {counts[status] > 0 && (
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                statusFilter === status ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {counts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-4">
          <span className="text-sm text-blue-800 font-medium">
            {selectedIds.size} selected
          </span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            <option value="">Bulk Actions</option>
            <option value="approved">Approve</option>
            <option value="rejected">Reject</option>
            <option value="spam">Mark as Spam</option>
            <option value="delete">Delete</option>
          </select>
          <button
            onClick={handleBulkAction}
            disabled={!bulkAction || processing}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Apply
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900">No comments</h3>
          <p className="text-gray-600 mt-1">
            {statusFilter === 'all' ? 'No comments yet' : `No ${statusFilter} comments`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-4 text-sm font-medium text-gray-600">
            <input
              type="checkbox"
              checked={selectedIds.size === comments.length && comments.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300"
            />
            <div className="flex-1 grid grid-cols-12 gap-4">
              <div className="col-span-4">Comment</div>
              <div className="col-span-3">Article</div>
              <div className="col-span-2">Author</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>

          {/* Comment Rows */}
          {comments.map(comment => (
            <div
              key={comment.id}
              className={`px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedIds.has(comment.id) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.has(comment.id)}
                  onChange={() => toggleSelect(comment.id)}
                  className="mt-1 rounded border-gray-300"
                />
                <div className="flex-1 grid grid-cols-12 gap-4">
                  {/* Comment Text */}
                  <div className="col-span-4">
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {comment.comment_text}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(comment.created_at)}
                      {comment.parent_id && ' • Reply'}
                    </p>
                  </div>

                  {/* Article */}
                  <div className="col-span-3">
                    {comment.article ? (
                      <Link
                        href={`/articles/${comment.article.slug}`}
                        target="_blank"
                        className="text-sm text-blue-600 hover:underline line-clamp-2"
                      >
                        {comment.article.title}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">Unknown article</span>
                    )}
                  </div>

                  {/* Author */}
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{comment.author_name}</p>
                    <p className="text-xs text-gray-500 truncate" title={comment.author_email}>
                      {comment.author_email}
                    </p>
                    {comment.author_ip && (
                      <p className="text-xs text-gray-400" title="IP Address">
                        {comment.author_ip}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[comment.status]}`}>
                      <span>{statusIcons[comment.status]}</span>
                      {comment.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center gap-1">
                    {comment.status !== 'approved' && (
                      <button
                        onClick={() => updateStatus([comment.id], 'approved')}
                        disabled={processing}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Approve"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    {comment.status !== 'rejected' && (
                      <button
                        onClick={() => updateStatus([comment.id], 'rejected')}
                        disabled={processing}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Reject"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    {comment.status !== 'spam' && (
                      <button
                        onClick={() => updateStatus([comment.id], 'spam')}
                        disabled={processing}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Mark as Spam"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => deleteComments([comment.id])}
                      disabled={processing}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
