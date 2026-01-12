'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useResearchQueue, useQueueStats } from '@/hooks/useResearchQueue';
import { useActiveScanJobs } from '@/hooks/useScanProgress';

export default function ResearchQueuePage() {
  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('discovered_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [minRelevanceScore, setMinRelevanceScore] = useState<number>(0);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [includeAnimalStudies, setIncludeAnimalStudies] = useState<boolean>(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [showNewItemNotification, setShowNewItemNotification] = useState<string | null>(null);

  // Real-time data hooks
  const {
    items: research,
    totalCount,
    loading,
    error: queueError,
    isConnected,
    lastAdded,
    updateItemStatus,
    refetch
  } = useResearchQueue(
    {
      status: selectedStatus === '' ? 'all' : selectedStatus as 'pending' | 'approved' | 'rejected',
      sourceSite: selectedSource || undefined,
      category: selectedTopic || undefined,
      minRelevanceScore: minRelevanceScore || undefined,
      includeAnimalStudies
    },
    { limit: 50, offset: 0 }
  );

  const { jobs: activeJobs } = useActiveScanJobs();
  const {
    totalItems,
    pendingCount,
    approvedCount,
    rejectedCount,
    todayAdded,
    loading: statsLoading
  } = useQueueStats();

  // Show notification for new items
  useEffect(() => {
    if (lastAdded && !loading) {
      setShowNewItemNotification(lastAdded.id);
      setTimeout(() => setShowNewItemNotification(null), 5000); // Hide after 5 seconds
    }
  }, [lastAdded, loading]);

  const supabase = createClient();

  const approveResearch = async (id: string) => {
    try {
      // Update status using the real-time hook
      await updateItemStatus(id, 'approved');

      // Integrate into articles
      try {
        const response = await fetch('/api/admin/integrate-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ researchId: id })
        });

        const result = await response.json();

        if (result.addedTo && result.addedTo.length > 0) {
          alert(`✅ Approved and added as citation to:\n${result.addedTo.join('\n')}`);
        } else {
          alert('✅ Approved (no matching articles found for automatic citation)');
        }
      } catch (error) {
        console.error('Failed to integrate research:', error);
        alert('✅ Approved, but failed to auto-add citations. Please check manually.');
      }
    } catch (error) {
      console.error('Error approving research:', error);
      alert('Failed to approve research. Please try again.');
    }
  };

  const rejectResearch = async (id: string) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason !== null) { // User didn't cancel
      try {
        await updateItemStatus(id, 'rejected');
      } catch (error) {
        console.error('Error rejecting research:', error);
        alert('Failed to reject research. Please try again.');
      }
    }
  };

  // Enhanced filtering and search (now client-side on real-time data)
  const allTopics = [...new Set(research.flatMap(r => r.relevantTopics || []))].sort();
  const allSources = [...new Set(research.map(r => r.sourceSite))].sort();
  const allYears = [...new Set(research.map(r => r.year).filter(Boolean))].sort((a, b) => b! - a!);

  const filteredResearch = research
    .filter(item => {
      // Topic filter (if not already filtered by hook)
      const topicMatch = selectedTopic ? item.relevantTopics?.includes(selectedTopic) : true;

      // Source filter (if not already filtered by hook)
      const sourceMatch = selectedSource ? item.sourceSite === selectedSource : true;

      // Year filter
      const yearMatch = yearFilter ? item.year === parseInt(yearFilter) : true;

      // Text search across title, authors, abstract, and publication
      const searchMatch = !searchQuery || [
        item.title,
        item.authors,
        item.abstract,
        item.publication,
        item.relevantTopics?.join(' ')
      ].some(field =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return topicMatch && sourceMatch && yearMatch && searchMatch;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'relevance_score':
          aValue = a.relevanceScore;
          bValue = b.relevanceScore;
          break;
        case 'year':
          aValue = a.year || 0;
          bValue = b.year || 0;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'source_site':
          aValue = a.sourceSite;
          bValue = b.sourceSite;
          break;
        default: // discovered_at
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Bulk action handlers
  const handleBulkApprove = async () => {
    if (bulkSelected.length === 0) return;

    const confirmMsg = `Approve ${bulkSelected.length} research items?`;
    if (!confirm(confirmMsg)) return;

    for (const id of bulkSelected) {
      try {
        await updateItemStatus(id, 'approved');
      } catch (error) {
        console.error(`Error approving item ${id}:`, error);
      }
    }
    setBulkSelected([]);
  };

  const handleBulkReject = async () => {
    if (bulkSelected.length === 0) return;

    const reason = prompt(`Rejection reason for ${bulkSelected.length} items:`);
    if (reason === null) return;

    for (const id of bulkSelected) {
      try {
        await updateItemStatus(id, 'rejected');
      } catch (error) {
        console.error(`Error rejecting item ${id}:`, error);
      }
    }
    setBulkSelected([]);
  };

  const toggleBulkSelect = (id: string) => {
    setBulkSelected(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredResearch
      .filter(item => item.status === 'pending')
      .map(item => item.id);
    setBulkSelected(visibleIds);
  };

  const clearSelection = () => {
    setBulkSelected([]);
  };

  const getPriorityColor = (score: number) => {
    if (score >= 50) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStudyTypeBadge = (studySubject: string | null | undefined) => {
    switch (studySubject) {
      case 'human':
        return { icon: '👤', label: 'Human', className: 'bg-blue-100 text-blue-800' };
      case 'animal':
        return { icon: '🐭', label: 'Animal', className: 'bg-orange-100 text-orange-800' };
      case 'in_vitro':
        return { icon: '🧫', label: 'In Vitro', className: 'bg-purple-100 text-purple-800' };
      case 'review':
        return { icon: '📚', label: 'Review', className: 'bg-teal-100 text-teal-800' };
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      {/* New Item Notification */}
      {lastAdded && showNewItemNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg max-w-md">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="font-medium">📄 New Research Found!</p>
              <p className="text-sm text-green-600 mt-1">
                {lastAdded.title.substring(0, 60)}...
              </p>
            </div>
            <button
              onClick={() => setShowNewItemNotification(null)}
              className="ml-2 text-green-500 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Research Queue
            {isConnected ? (
              <span className="inline-flex items-center text-green-600 text-sm font-normal">
                🟢 Live Updates
              </span>
            ) : (
              <span className="inline-flex items-center text-gray-500 text-sm font-normal">
                🔴 Offline
              </span>
            )}
          </h1>
          <div className="text-gray-600 mt-2 flex items-center gap-4">
            <span>Review and manage discovered research papers</span>
            {activeJobs.length > 0 && (
              <span className="inline-flex items-center text-blue-600 text-sm">
                ⚡ {activeJobs.length} scan{activeJobs.length > 1 ? 's' : ''} active
              </span>
            )}
            {todayAdded > 0 && (
              <span className="inline-flex items-center text-green-600 text-sm">
                📈 {todayAdded} new today
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/research"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔍 Research Scanner
          </Link>
          {queueError && (
            <button
              onClick={refetch}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              ⚠️ Retry Connection
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Search & Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search titles, authors, abstracts, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All ({totalItems})</option>
              <option value="pending">⏳ Pending ({pendingCount})</option>
              <option value="approved">✅ Approved ({approvedCount})</option>
              <option value="rejected">❌ Rejected ({rejectedCount})</option>
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Topics</option>
              {allTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic.charAt(0).toUpperCase() + topic.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Sources</option>
              {allSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Years</option>
              {allYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="discovered_at">📅 Date Found</option>
              <option value="relevance_score">⭐ Relevance</option>
              <option value="year">📊 Publication Year</option>
              <option value="title">📝 Title</option>
              <option value="source_site">🏢 Source</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="desc">⬇️ Descending</option>
              <option value="asc">⬆️ Ascending</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex gap-4 items-center flex-wrap bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Min Relevance:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={minRelevanceScore}
              onChange={(e) => setMinRelevanceScore(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 w-8">{minRelevanceScore}</span>
          </div>

          {/* Animal Studies Toggle */}
          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">
            <input
              type="checkbox"
              checked={includeAnimalStudies}
              onChange={(e) => setIncludeAnimalStudies(e.target.checked)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">
              🐭 Include preclinical & animal studies
            </span>
          </label>

          <div className="text-sm text-gray-600">
            Showing {filteredResearch.length} of {research.length} items
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('');
              setSelectedTopic('');
              setSelectedSource('');
              setYearFilter('');
              setMinRelevanceScore(0);
              setIncludeAnimalStudies(false);
              setSortBy('discovered_at');
              setSortOrder('desc');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            🔄 Clear All Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredResearch.some(item => item.status === 'pending') && (
        <div className="mb-6 bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Bulk Actions ({bulkSelected.length} selected):
              </span>
              <button
                onClick={selectAllVisible}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={filteredResearch.filter(item => item.status === 'pending').length === 0}
              >
                📝 Select All Pending ({filteredResearch.filter(item => item.status === 'pending').length})
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                🔄 Clear Selection
              </button>
            </div>

            {bulkSelected.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={handleBulkApprove}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-1"
                >
                  ✓ Approve {bulkSelected.length}
                </button>
                <button
                  onClick={handleBulkReject}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-1"
                >
                  ✗ Reject {bulkSelected.length}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className={`text-2xl font-bold ${statsLoading ? 'text-gray-400' : 'text-orange-600'} flex items-center gap-2`}>
            {statsLoading ? '...' : pendingCount}
            {!statsLoading && pendingCount > 0 && <span className="animate-pulse">📄</span>}
          </div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className={`text-2xl font-bold ${statsLoading ? 'text-gray-400' : 'text-green-600'}`}>
            {statsLoading ? '...' : approvedCount}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className={`text-2xl font-bold ${statsLoading ? 'text-gray-400' : 'text-red-600'}`}>
            {statsLoading ? '...' : rejectedCount}
          </div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className={`text-2xl font-bold ${statsLoading ? 'text-gray-400' : 'text-blue-600'}`}>
            {statsLoading ? '...' : totalItems}
          </div>
          <div className="text-sm text-gray-600">Total Items</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-4 border border-green-200">
          <div className={`text-2xl font-bold ${statsLoading ? 'text-gray-400' : 'text-green-700'} flex items-center gap-2`}>
            {statsLoading ? '...' : todayAdded}
            {!statsLoading && todayAdded > 0 && <span className="text-green-600">✨</span>}
          </div>
          <div className="text-sm text-green-700 font-medium">Added Today</div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {filteredResearch.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg shadow p-6 hover:shadow-md transition-all ${
                showNewItemNotification === item.id
                  ? 'bg-green-50 border-2 border-green-200 animate-pulse'
                  : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 flex-1">
                  {item.status === 'pending' && (
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={bulkSelected.includes(item.id)}
                        onChange={() => toggleBulkSelect(item.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.relevanceScore)}`}>
                      Score: {item.relevanceScore}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {item.sourceSite}
                    </span>
                    {(() => {
                      const badge = getStudyTypeBadge(item.studySubject);
                      return badge ? (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
                          {badge.icon} {badge.label}
                        </span>
                      ) : null;
                    })()}
                    {showNewItemNotification === item.id && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full border border-green-300">
                        🆕 NEW
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                    {item.title}
                  </h3>

                  {item.authors && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Authors:</strong> {item.authors}
                    </p>
                  )}

                  <div className="text-sm text-gray-500 space-x-4 mb-2">
                    {item.publication && (
                      <span><strong>Publication:</strong> {item.publication}</span>
                    )}
                    {item.year && <span><strong>Year:</strong> {item.year}</span>}
                    {item.doi && (
                      <span><strong>DOI:</strong> {item.doi}</span>
                    )}
                  </div>

                  {item.relevantTopics && item.relevantTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="text-sm font-medium text-gray-700 mr-2">Topics:</span>
                      {item.relevantTopics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.abstract && (
                    <div className="mb-3">
                      <strong className="text-sm text-gray-700">Abstract:</strong>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-4 leading-relaxed">
                        {item.abstract}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>Discovered: {new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.searchTermMatched && (
                      <span>Matched: "{item.searchTermMatched}"</span>
                    )}
                    {item.jobId && (
                      <span className="text-blue-500">Scan Job: {item.jobId.slice(0, 8)}...</span>
                    )}
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 inline-block mt-2 font-medium"
                    >
                      📄 View Full Paper →
                    </a>
                  )}
                  </div>
                </div>

                {item.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => approveResearch(item.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors font-medium"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => rejectResearch(item.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredResearch.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg">
                {selectedStatus || selectedTopic || selectedSource
                  ? 'No research found with current filters'
                  : 'No research found. Try running a manual scan!'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination would go here for large datasets */}
    </div>
  );
}