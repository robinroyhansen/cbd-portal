'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface ResearchItem {
  id: string;
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  abstract?: string;
  url: string;
  doi?: string;
  source_site: string;
  relevance_score: number;
  relevant_topics: string[];
  search_term_matched?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  discovered_at: string;
}

export default function ResearchQueuePage() {
  const [research, setResearch] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('discovered_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [minRelevanceScore, setMinRelevanceScore] = useState<number>(0);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchResearch();
  }, []);

  const fetchResearch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('research_queue')
      .select('*')
      .order('discovered_at', { ascending: false });

    if (!error) {
      setResearch(data || []);
    } else {
      console.error('Error fetching research:', error);
    }
    setLoading(false);
  };

  const updateResearchStatus = async (id: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    const { error } = await supabase
      .from('research_queue')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'admin', // Replace with actual user ID when auth is implemented
        rejection_reason: rejectionReason || null
      })
      .eq('id', id);

    if (!error) {
      fetchResearch();
    } else {
      alert('Failed to update research status');
    }
  };

  const approveResearch = async (id: string) => {
    // Update status first
    await updateResearchStatus(id, 'approved');

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

      // Refresh research list
      fetchResearch();

    } catch (error) {
      console.error('Failed to integrate research:', error);
      alert('✅ Approved, but failed to auto-add citations. Please check manually.');
    }
  };

  const rejectResearch = (id: string) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason !== null) { // User didn't cancel
      updateResearchStatus(id, 'rejected', reason || undefined);
    }
  };

  // Enhanced filtering and search
  const allTopics = [...new Set(research.flatMap(r => r.relevant_topics || []))].sort();
  const allSources = [...new Set(research.map(r => r.source_site))].sort();
  const allYears = [...new Set(research.map(r => r.year).filter(Boolean))].sort((a, b) => b! - a!);

  const filteredResearch = research
    .filter(item => {
      // Status filter
      const statusMatch = selectedStatus ? item.status === selectedStatus : true;

      // Topic filter
      const topicMatch = selectedTopic ? item.relevant_topics?.includes(selectedTopic) : true;

      // Source filter
      const sourceMatch = selectedSource ? item.source_site === selectedSource : true;

      // Year filter
      const yearMatch = yearFilter ? item.year === parseInt(yearFilter) : true;

      // Relevance score filter
      const scoreMatch = item.relevance_score >= minRelevanceScore;

      // Text search across title, authors, abstract, and publication
      const searchMatch = !searchQuery || [
        item.title,
        item.authors,
        item.abstract,
        item.publication,
        item.relevant_topics?.join(' ')
      ].some(field =>
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return statusMatch && topicMatch && sourceMatch && yearMatch && scoreMatch && searchMatch;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'relevance_score':
          aValue = a.relevance_score;
          bValue = b.relevance_score;
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
          aValue = a.source_site;
          bValue = b.source_site;
          break;
        default: // discovered_at
          aValue = new Date(a.discovered_at);
          bValue = new Date(b.discovered_at);
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
      await approveResearch(id);
    }
    setBulkSelected([]);
  };

  const handleBulkReject = async () => {
    if (bulkSelected.length === 0) return;

    const reason = prompt(`Rejection reason for ${bulkSelected.length} items:`);
    if (reason === null) return;

    for (const id of bulkSelected) {
      await updateResearchStatus(id, 'rejected', reason || undefined);
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

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Queue</h1>
          <p className="text-gray-600 mt-2">Review and manage discovered research papers</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/research"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔍 Manual Scan
          </Link>
          <button
            onClick={fetchResearch}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Refresh
          </button>
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
              <option value="">All ({research.length})</option>
              <option value="pending">⏳ Pending ({research.filter(r => r.status === 'pending').length})</option>
              <option value="approved">✅ Approved ({research.filter(r => r.status === 'approved').length})</option>
              <option value="rejected">❌ Rejected ({research.filter(r => r.status === 'rejected').length})</option>
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

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">{research.filter(r => r.status === 'pending').length}</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{research.filter(r => r.status === 'approved').length}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">{research.filter(r => r.status === 'rejected').length}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{research.length}</div>
          <div className="text-sm text-gray-600">Total</div>
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
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
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
                    <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.relevance_score)}`}>
                      Score: {item.relevance_score}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {item.source_site}
                    </span>
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

                  {item.relevant_topics && item.relevant_topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="text-sm font-medium text-gray-700 mr-2">Topics:</span>
                      {item.relevant_topics.map((topic) => (
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
                    <span>Discovered: {new Date(item.discovered_at).toLocaleDateString()}</span>
                    {item.search_term_matched && (
                      <span>Matched: "{item.search_term_matched}"</span>
                    )}
                  </div>

                  {item.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <strong>Rejection reason:</strong> {item.rejection_reason}
                    </div>
                  )}

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