'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface RejectedStudy {
  id: string;
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  url: string;
  doi?: string;
  source_site: string;
  rejection_reason?: string;
  reviewed_at?: string;
  discovered_at: string;
}

const REJECTION_REASONS = [
  'Not relevant',
  'Duplicate',
  'Low quality',
  'Not CBD/cannabis related',
  'Non-therapeutic focus',
  'Insufficient data',
  'Other'
];

export default function RejectedStudiesPage() {
  const [studies, setStudies] = useState<RejectedStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const supabase = createClient();

  const fetchRejectedStudies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('id, title, authors, publication, year, url, doi, source_site, rejection_reason, reviewed_at, discovered_at')
      .eq('status', 'rejected')
      .order('reviewed_at', { ascending: false });

    if (!error) {
      setStudies(data || []);
    } else {
      console.error('Error fetching rejected studies:', error);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchRejectedStudies();
  }, [fetchRejectedStudies]);

  const restoreStudy = async (id: string) => {
    setProcessing(true);
    const { error } = await supabase
      .from('kb_research_queue')
      .update({
        status: 'pending',
        reviewed_at: null,
        reviewed_by: null,
        rejection_reason: null
      })
      .eq('id', id);

    if (!error) {
      setStudies(prev => prev.filter(s => s.id !== id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      console.error('Error restoring study:', error);
      alert('Failed to restore study');
    }
    setProcessing(false);
  };

  const deleteStudy = async (id: string) => {
    if (!confirm('Permanently delete this study? This cannot be undone.')) return;

    setProcessing(true);
    const { error } = await supabase
      .from('kb_research_queue')
      .delete()
      .eq('id', id);

    if (!error) {
      setStudies(prev => prev.filter(s => s.id !== id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } else {
      console.error('Error deleting study:', error);
      alert('Failed to delete study');
    }
    setProcessing(false);
  };

  const bulkRestore = async () => {
    if (selectedIds.size === 0) return;
    setProcessing(true);

    const { error } = await supabase
      .from('kb_research_queue')
      .update({
        status: 'pending',
        reviewed_at: null,
        reviewed_by: null,
        rejection_reason: null
      })
      .in('id', Array.from(selectedIds));

    if (!error) {
      setStudies(prev => prev.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
    } else {
      console.error('Error bulk restoring:', error);
      alert('Failed to restore studies');
    }
    setProcessing(false);
  };

  const clearAllRejected = async () => {
    if (!confirm(`Permanently delete ALL ${studies.length} rejected studies? This cannot be undone.`)) return;
    if (!confirm('Are you absolutely sure? This will permanently remove all rejected studies from the database.')) return;

    setProcessing(true);
    const { error } = await supabase
      .from('kb_research_queue')
      .delete()
      .eq('status', 'rejected');

    if (!error) {
      setStudies([]);
      setSelectedIds(new Set());
    } else {
      console.error('Error clearing rejected:', error);
      alert('Failed to clear rejected studies');
    }
    setProcessing(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredStudies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudies.map(s => s.id)));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Filter studies
  const filteredStudies = studies.filter(study => {
    const matchesSearch = !searchQuery ||
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.authors?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesReason = !filterReason || study.rejection_reason === filterReason;

    return matchesSearch && matchesReason;
  });

  // Get unique rejection reasons for filter dropdown
  const usedReasons = [...new Set(studies.map(s => s.rejection_reason).filter(Boolean))];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rejected Studies</h1>
          <p className="text-gray-600 mt-2">
            {studies.length} rejected {studies.length === 1 ? 'study' : 'studies'} - these will be skipped in future scans
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/research/queue"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Queue
          </Link>
          {studies.length > 0 && (
            <button
              onClick={clearAllRejected}
              disabled={processing}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Clear All Rejected
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search titles or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <select
          value={filterReason}
          onChange={(e) => setFilterReason(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Reasons</option>
          {usedReasons.map(reason => (
            <option key={reason} value={reason}>{reason}</option>
          ))}
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-blue-800 font-medium">
            {selectedIds.size} {selectedIds.size === 1 ? 'study' : 'studies'} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={bulkRestore}
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Restore Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">{studies.length}</div>
          <div className="text-sm text-gray-600">Total Rejected</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-600">{filteredStudies.length}</div>
          <div className="text-sm text-gray-600">Showing</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{selectedIds.size}</div>
          <div className="text-sm text-gray-600">Selected</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredStudies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">No rejected studies</h3>
          <p className="text-gray-600 mt-1">
            {searchQuery || filterReason
              ? 'No studies match your filters'
              : 'Studies you reject from the queue will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-4">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredStudies.length && filteredStudies.length > 0}
              onChange={selectAll}
              className="rounded border-gray-300"
            />
            <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
              <div className="col-span-5">Study</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-2">Reason</div>
              <div className="col-span-1">Rejected</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>

          {/* Study Rows */}
          {filteredStudies.map(study => (
            <div
              key={study.id}
              className={`px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedIds.has(study.id) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.has(study.id)}
                  onChange={() => toggleSelect(study.id)}
                  className="mt-1 rounded border-gray-300"
                />
                <div className="flex-1 grid grid-cols-12 gap-4">
                  {/* Study Info */}
                  <div className="col-span-5">
                    <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                      {study.title}
                    </h3>
                    {study.authors && (
                      <p className="text-sm text-gray-500 line-clamp-1">{study.authors}</p>
                    )}
                    {study.url && (
                      <a
                        href={study.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View original →
                      </a>
                    )}
                  </div>

                  {/* Source */}
                  <div className="col-span-2">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {study.source_site}
                    </span>
                    {study.year && (
                      <p className="text-xs text-gray-500 mt-1">{study.year}</p>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  <div className="col-span-2">
                    {study.rejection_reason ? (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        {study.rejection_reason}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No reason</span>
                    )}
                  </div>

                  {/* Rejected Date */}
                  <div className="col-span-1">
                    <span className="text-xs text-gray-500">
                      {formatDate(study.reviewed_at)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center gap-2">
                    <button
                      onClick={() => restoreStudy(study.id)}
                      disabled={processing}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      title="Restore to pending"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => deleteStudy(study.id)}
                      disabled={processing}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      title="Delete permanently"
                    >
                      Delete
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
