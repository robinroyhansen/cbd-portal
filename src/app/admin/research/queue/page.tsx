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
  const supabase = createClient();

  useEffect(() => {
    fetchResearch();
  }, []);

  const fetchResearch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kb_research_queue')
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
      .from('kb_research_queue')
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

  const approveResearch = (id: string) => {
    updateResearchStatus(id, 'approved');
  };

  const rejectResearch = (id: string) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason !== null) { // User didn't cancel
      updateResearchStatus(id, 'rejected', reason || undefined);
    }
  };

  // Get unique values for filtering
  const allTopics = [...new Set(research.flatMap(r => r.relevant_topics || []))].sort();
  const allSources = [...new Set(research.map(r => r.source_site))].sort();

  const filteredResearch = research.filter(item => {
    const statusMatch = selectedStatus ? item.status === selectedStatus : true;
    const topicMatch = selectedTopic ? item.relevant_topics?.includes(selectedTopic) : true;
    const sourceMatch = selectedSource ? item.source_site === selectedSource : true;
    return statusMatch && topicMatch && sourceMatch;
  });

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

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending ({research.filter(r => r.status === 'pending').length})</option>
            <option value="approved">Approved ({research.filter(r => r.status === 'approved').length})</option>
            <option value="rejected">Rejected ({research.filter(r => r.status === 'rejected').length})</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Topics</option>
            {allTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Sources</option>
            {allSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
      </div>

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