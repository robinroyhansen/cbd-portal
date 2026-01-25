'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Comment {
  id: string;
  author_name: string;
  author_email: string;
  author_ip: string | null;
  user_agent: string | null;
  comment_text: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
  approved_at: string | null;
  spam_signals: string[] | null;
  moderation_notes: string | null;
  article: { id: string; title: string; slug: string } | null;
}

interface StatusCounts {
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
}

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'spam';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [counts, setCounts] = useState<StatusCounts>({ pending: 0, approved: 0, rejected: 0, spam: 0 });
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    // Fetch comments for current filter
    const { data } = await supabase
      .from('kb_comments')
      .select(`
        id, author_name, author_email, author_ip, user_agent, comment_text, status, created_at, approved_at, spam_signals, moderation_notes,
        article:kb_articles(id, title, slug)
      `)
      .eq('status', filter)
      .order('created_at', { ascending: false });

    setComments(data || []);

    // Fetch counts for all statuses
    const { data: allComments } = await supabase
      .from('kb_comments')
      .select('status');

    const newCounts: StatusCounts = { pending: 0, approved: 0, rejected: 0, spam: 0 };
    (allComments || []).forEach(c => {
      if (c.status in newCounts) {
        newCounts[c.status as keyof StatusCounts]++;
      }
    });
    setCounts(newCounts);

    setLoading(false);
    setSelectedIds(new Set());
  }, [filter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleStatusChange = async (ids: string[], newStatus: StatusFilter) => {
    const supabase = createClient();
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }

    await supabase
      .from('kb_comments')
      .update(updateData)
      .in('id', ids);

    fetchComments();
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} comment(s) permanently?`)) return;

    const supabase = createClient();
    await supabase.from('kb_comments').delete().in('id', ids);
    fetchComments();
  };

  const handleBulkAction = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    switch (bulkAction) {
      case 'approve':
        await handleStatusChange(ids, 'approved');
        break;
      case 'reject':
        await handleStatusChange(ids, 'rejected');
        break;
      case 'spam':
        await handleStatusChange(ids, 'spam');
        break;
      case 'delete':
        await handleDelete(ids);
        break;
    }
    setBulkAction('');
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredComments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredComments.map(c => c.id)));
    }
  };

  const filteredComments = comments.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.author_name.toLowerCase().includes(q) ||
      c.author_email.toLowerCase().includes(q) ||
      c.comment_text.toLowerCase().includes(q) ||
      c.article?.title?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: '✓' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: '✕' },
    spam: { label: 'Spam', color: 'bg-gray-100 text-gray-800', icon: '🚫' },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Comment Moderation</h1>
        <div className="text-sm text-gray-500">
          Total: {counts.pending + counts.approved + counts.rejected + counts.spam} comments
        </div>
      </div>

      {/* Status tabs with counts */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(statusConfig) as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filter === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{statusConfig[status].icon}</span>
            <span className="capitalize">{status}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === status ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {counts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Search and bulk actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name, email, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Bulk actions...</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="spam">Mark as Spam</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse border rounded-lg p-4 bg-white">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No {filter} comments found.</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-green-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select all header */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredComments.length && filteredComments.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-600">
              Select all ({filteredComments.length})
            </span>
          </div>

          {filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`border rounded-lg p-4 bg-white transition-shadow hover:shadow-md ${
                selectedIds.has(comment.id) ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(comment.id)}
                  onChange={() => toggleSelect(comment.id)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />

                <div className="flex-1">
                  {/* Header */}
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">{comment.author_name}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-sm text-gray-500">{comment.author_email}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                  </div>

                  {/* Article link */}
                  {comment.article && (
                    <p className="text-sm text-gray-500 mb-2">
                      On:{' '}
                      <a
                        href={`/articles/${comment.article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {comment.article.title}
                      </a>
                    </p>
                  )}

                  {/* Comment text */}
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{comment.comment_text}</p>

                  {/* Expandable details */}
                  {expandedId === comment.id && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-2">
                      <p><span className="font-medium">IP:</span> {comment.author_ip || 'Unknown'}</p>
                      <p className="truncate"><span className="font-medium">User Agent:</span> {comment.user_agent || 'Unknown'}</p>
                      {comment.approved_at && (
                        <p><span className="font-medium">Approved:</span> {formatDate(comment.approved_at)}</p>
                      )}
                      {comment.spam_signals && comment.spam_signals.length > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="font-medium text-red-600 mb-1">Spam Signals:</p>
                          <ul className="list-disc list-inside text-red-700 space-y-0.5">
                            {comment.spam_signals.map((signal, i) => (
                              <li key={i}>{signal}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {comment.moderation_notes && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="font-medium">Moderation Notes:</p>
                          <p className="text-gray-600">{comment.moderation_notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {filter === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange([comment.id], 'approved')}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange([comment.id], 'rejected')}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                        >
                          ✕ Reject
                        </button>
                        <button
                          onClick={() => handleStatusChange([comment.id], 'spam')}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                        >
                          🚫 Spam
                        </button>
                      </>
                    )}
                    {filter === 'approved' && (
                      <button
                        onClick={() => handleStatusChange([comment.id], 'rejected')}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                      >
                        ✕ Unapprove
                      </button>
                    )}
                    {filter === 'rejected' && (
                      <button
                        onClick={() => handleStatusChange([comment.id], 'approved')}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                      >
                        ✓ Approve
                      </button>
                    )}
                    {filter === 'spam' && (
                      <button
                        onClick={() => handleStatusChange([comment.id], 'pending')}
                        className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-md text-sm hover:bg-yellow-200 transition-colors"
                      >
                        ↩ Not Spam
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === comment.id ? null : comment.id)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200 transition-colors"
                    >
                      {expandedId === comment.id ? '▲ Less' : '▼ Details'}
                    </button>
                    <button
                      onClick={() => handleDelete([comment.id])}
                      className="px-3 py-1.5 text-red-600 hover:text-red-800 text-sm transition-colors ml-auto"
                    >
                      🗑 Delete
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
