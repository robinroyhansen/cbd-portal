'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useResearchQueue, useQueueStats, ResearchItem } from '@/hooks/useResearchQueue';
import { useActiveScanJobs } from '@/hooks/useScanProgress';

// Rejection reason categories
const REJECTION_REASONS = [
  { id: 'not_cbd', label: 'Not CBD/Cannabis focused', description: 'Study mentions CBD tangentially' },
  { id: 'animal_only', label: 'Animal/Preclinical only', description: 'No human relevance' },
  { id: 'low_quality', label: 'Low quality/rigor', description: 'Poor methodology or small sample' },
  { id: 'duplicate', label: 'Duplicate study', description: 'Already have this or similar' },
  { id: 'not_therapeutic', label: 'Not therapeutic', description: 'Agricultural, legal, or economic focus' },
  { id: 'outdated', label: 'Outdated research', description: 'Superseded by newer studies' },
  { id: 'other', label: 'Other', description: 'Custom reason' },
];

// Detail Modal Component
function ResearchDetailModal({
  item,
  onClose,
  onApprove,
  onReject,
}: {
  item: ResearchItem;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleReject = () => {
    const reason = selectedReason === 'other' ? customReason :
      REJECTION_REASONS.find(r => r.id === selectedReason)?.label || '';
    onReject(item.id, reason);
  };

  // Parse signals into positive and negative
  const positiveSignals = (item.relevanceSignals || []).filter(s =>
    !s.toLowerCase().includes('without') &&
    !s.toLowerCase().includes('only') &&
    !s.toLowerCase().includes('tangential')
  );
  const negativeSignals = (item.relevanceSignals || []).filter(s =>
    s.toLowerCase().includes('without') ||
    s.toLowerCase().includes('only') ||
    s.toLowerCase().includes('tangential')
  );

  // Determine approval confidence
  const getConfidenceLevel = () => {
    if (item.relevanceScore >= 70) return { level: 'high', color: 'green', label: 'High Confidence' };
    if (item.relevanceScore >= 50) return { level: 'medium', color: 'yellow', label: 'Medium Confidence' };
    if (item.relevanceScore >= 30) return { level: 'low', color: 'orange', label: 'Low Confidence' };
    return { level: 'very_low', color: 'red', label: 'Review Carefully' };
  };

  const confidence = getConfidenceLevel();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Research Details</h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              confidence.color === 'green' ? 'bg-green-100 text-green-800' :
              confidence.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              confidence.color === 'orange' ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {confidence.label}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Title and Meta */}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{item.sourceSite}</span>
            {item.year && <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{item.year}</span>}
            {item.studySubject && (
              <span className={`px-2 py-1 text-xs rounded-full ${
                item.studySubject === 'human' ? 'bg-blue-100 text-blue-800' :
                item.studySubject === 'animal' ? 'bg-orange-100 text-orange-800' :
                item.studySubject === 'review' ? 'bg-teal-100 text-teal-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {item.studySubject === 'human' ? '👤 Human' :
                 item.studySubject === 'animal' ? '🐭 Animal' :
                 item.studySubject === 'review' ? '📚 Review' :
                 '🧫 In Vitro'}
              </span>
            )}
          </div>

          {item.authors && (
            <p className="text-sm text-gray-600 mb-2"><strong>Authors:</strong> {item.authors}</p>
          )}
          {item.publication && (
            <p className="text-sm text-gray-600 mb-2"><strong>Publication:</strong> {item.publication}</p>
          )}
          {item.doi && (
            <p className="text-sm text-gray-600 mb-4"><strong>DOI:</strong> {item.doi}</p>
          )}

          {/* Relevance Score Section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Relevance Score</h4>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.relevanceScore >= 70 ? 'bg-green-500' :
                      item.relevanceScore >= 50 ? 'bg-yellow-500' :
                      item.relevanceScore >= 30 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${item.relevanceScore}%` }}
                  />
                </div>
                <span className="text-2xl font-bold text-gray-900">{item.relevanceScore}</span>
              </div>
            </div>

            {/* Signals */}
            {(positiveSignals.length > 0 || negativeSignals.length > 0) && (
              <div className="space-y-3">
                {positiveSignals.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-700 mb-1">Positive Signals:</p>
                    <div className="flex flex-wrap gap-1">
                      {positiveSignals.map((signal, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          + {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {negativeSignals.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-700 mb-1">Negative Signals:</p>
                    <div className="flex flex-wrap gap-1">
                      {negativeSignals.map((signal, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          - {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Topics */}
          {item.relevantTopics && item.relevantTopics.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Relevant Topics</h4>
              <div className="flex flex-wrap gap-2">
                {item.relevantTopics.map((topic) => (
                  <span key={topic} className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Abstract */}
          {item.abstract && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Abstract</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {item.abstract}
              </p>
            </div>
          )}

          {/* External Link */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              📄 View Full Paper on {item.sourceSite} →
            </a>
          )}

          {/* Rejection Reasons (only show for pending) */}
          {item.status === 'pending' && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Rejection (if needed)</h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {REJECTION_REASONS.map((reason) => (
                  <label
                    key={reason.id}
                    className={`flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReason === reason.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejection_reason"
                      value={reason.id}
                      checked={selectedReason === reason.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{reason.label}</p>
                      <p className="text-xs text-gray-500">{reason.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {selectedReason === 'other' && (
                <input
                  type="text"
                  placeholder="Enter custom reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {item.status === 'pending' && (
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={!selectedReason || (selectedReason === 'other' && !customReason)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
              <button
                onClick={() => onApprove(item.id)}
                className={`px-6 py-2 text-white rounded-lg transition-colors font-medium ${
                  item.relevanceScore >= 70
                    ? 'bg-green-600 hover:bg-green-700'
                    : item.relevanceScore >= 50
                    ? 'bg-yellow-600 hover:bg-yellow-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {item.relevanceScore >= 70 ? '✓ Approve (Recommended)' : '✓ Approve'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Score Badge Component with expandable signals
function ScoreBadge({
  score,
  signals,
  onClick
}: {
  score: number;
  signals: string[];
  onClick?: () => void;
}) {
  const [showSignals, setShowSignals] = useState(false);

  const getScoreColor = () => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (score >= 30) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getScoreLabel = () => {
    if (score >= 70) return 'High';
    if (score >= 50) return 'Medium';
    if (score >= 30) return 'Low';
    return 'Very Low';
  };

  return (
    <div className="relative">
      <button
        onClick={() => signals.length > 0 ? setShowSignals(!showSignals) : onClick?.()}
        className={`px-3 py-1.5 text-sm font-semibold rounded-lg border flex items-center gap-2 transition-all hover:shadow ${getScoreColor()}`}
      >
        <span className="text-lg">{score}</span>
        <span className="text-xs opacity-75">{getScoreLabel()}</span>
        {signals.length > 0 && (
          <svg className={`w-4 h-4 transition-transform ${showSignals ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Signals Dropdown */}
      {showSignals && signals.length > 0 && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-white rounded-lg shadow-lg border p-3 min-w-64">
          <p className="text-xs font-semibold text-gray-500 mb-2">Why this score?</p>
          <div className="space-y-1">
            {signals.slice(0, 5).map((signal, i) => (
              <div key={i} className={`text-xs px-2 py-1 rounded ${
                signal.toLowerCase().includes('without') ||
                signal.toLowerCase().includes('only') ||
                signal.toLowerCase().includes('tangential')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {signal.toLowerCase().includes('without') ||
                 signal.toLowerCase().includes('only') ||
                 signal.toLowerCase().includes('tangential') ? '−' : '+'} {signal}
              </div>
            ))}
            {signals.length > 5 && (
              <p className="text-xs text-gray-500 pt-1">+{signals.length - 5} more signals</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResearchQueuePage() {
  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [minRelevanceScore, setMinRelevanceScore] = useState<number>(0);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [includeAnimalStudies, setIncludeAnimalStudies] = useState<boolean>(false);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [showNewItemNotification, setShowNewItemNotification] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ResearchItem | null>(null);

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
      setTimeout(() => setShowNewItemNotification(null), 5000);
    }
  }, [lastAdded, loading]);

  const supabase = createClient();

  const approveResearch = async (id: string) => {
    try {
      await updateItemStatus(id, 'approved');
      setSelectedItem(null);

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

  const rejectResearch = async (id: string, reason?: string) => {
    try {
      // Update with reason if provided
      if (reason) {
        await supabase
          .from('kb_research_queue')
          .update({ status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() })
          .eq('id', id);
      }
      await updateItemStatus(id, 'rejected');
      setSelectedItem(null);
    } catch (error) {
      console.error('Error rejecting research:', error);
      alert('Failed to reject research. Please try again.');
    }
  };

  // Enhanced filtering and search
  const allTopics = [...new Set(research.flatMap(r => r.relevantTopics || []))].sort();
  const allSources = [...new Set(research.map(r => r.sourceSite))].sort();
  const allYears = [...new Set(research.map(r => r.year).filter(Boolean))].sort((a, b) => b! - a!);

  const filteredResearch = research
    .filter(item => {
      const topicMatch = selectedTopic ? item.relevantTopics?.includes(selectedTopic) : true;
      const sourceMatch = selectedSource ? item.sourceSite === selectedSource : true;
      const yearMatch = yearFilter ? item.year === parseInt(yearFilter) : true;
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
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Smart counts
  const highConfidenceCount = filteredResearch.filter(i => i.status === 'pending' && i.relevanceScore >= 70).length;
  const lowRelevanceCount = filteredResearch.filter(i => i.status === 'pending' && i.relevanceScore < 30).length;

  // Bulk action handlers
  const handleBulkApprove = async () => {
    if (bulkSelected.length === 0) return;
    if (!confirm(`Approve ${bulkSelected.length} research items?`)) return;

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
        await rejectResearch(id, reason);
      } catch (error) {
        console.error(`Error rejecting item ${id}:`, error);
      }
    }
    setBulkSelected([]);
  };

  const handleSmartApprove = async () => {
    const highConfidence = filteredResearch.filter(i => i.status === 'pending' && i.relevanceScore >= 70);
    if (highConfidence.length === 0) return;
    if (!confirm(`Approve ${highConfidence.length} high-confidence items (score >= 70)?`)) return;

    for (const item of highConfidence) {
      try {
        await updateItemStatus(item.id, 'approved');
      } catch (error) {
        console.error(`Error approving item ${item.id}:`, error);
      }
    }
  };

  const toggleBulkSelect = (id: string) => {
    setBulkSelected(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredResearch.filter(item => item.status === 'pending').map(item => item.id);
    setBulkSelected(visibleIds);
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

  // Confidence indicator for item rows
  const getConfidenceIndicator = (score: number) => {
    if (score >= 70) return { color: 'border-l-green-500', bg: 'bg-green-50' };
    if (score >= 50) return { color: 'border-l-yellow-500', bg: '' };
    if (score >= 30) return { color: 'border-l-orange-500', bg: '' };
    return { color: 'border-l-red-500', bg: 'bg-red-50' };
  };

  return (
    <div className="p-8">
      {/* Detail Modal */}
      {selectedItem && (
        <ResearchDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onApprove={approveResearch}
          onReject={rejectResearch}
        />
      )}

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
                🟢 Live
              </span>
            ) : (
              <span className="inline-flex items-center text-gray-500 text-sm font-normal">
                🔴 Offline
              </span>
            )}
          </h1>
          <div className="text-gray-600 mt-2 flex items-center gap-4">
            <span>Review and approve research papers</span>
            {activeJobs.length > 0 && (
              <span className="inline-flex items-center text-blue-600 text-sm">
                ⚡ {activeJobs.length} scan{activeJobs.length > 1 ? 's' : ''} active
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/research/scanner"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔍 Scanner
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search titles, authors, abstracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All ({totalItems})</option>
            <option value="pending">⏳ Pending ({pendingCount})</option>
            <option value="approved">✅ Approved ({approvedCount})</option>
            <option value="rejected">❌ Rejected ({rejectedCount})</option>
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Topics</option>
            {allTopics.map((topic) => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Sources</option>
            {allSources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Years</option>
            {allYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="relevance_score">⭐ Relevance</option>
            <option value="discovered_at">📅 Date Found</option>
            <option value="year">📊 Pub Year</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="desc">⬇️ High to Low</option>
            <option value="asc">⬆️ Low to High</option>
          </select>
        </div>

        <div className="flex gap-4 items-center flex-wrap bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Min Score:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={minRelevanceScore}
              onChange={(e) => setMinRelevanceScore(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-8">{minRelevanceScore}</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeAnimalStudies}
              onChange={(e) => setIncludeAnimalStudies(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">🐭 Include animal studies</span>
          </label>

          <span className="text-sm text-gray-500">
            {filteredResearch.length} results
          </span>
        </div>
      </div>

      {/* Smart Actions Bar */}
      {selectedStatus === 'pending' && filteredResearch.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg shadow p-4 border border-blue-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <span className="text-sm font-semibold text-gray-700">Smart Actions:</span>

              {highConfidenceCount > 0 && (
                <button
                  onClick={handleSmartApprove}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                >
                  ✓ Approve High Confidence ({highConfidenceCount})
                </button>
              )}

              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                  {highConfidenceCount} high (≥70)
                </span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                  {lowRelevanceCount} low (&lt;30)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={selectAllVisible}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Select All ({filteredResearch.filter(i => i.status === 'pending').length})
              </button>
              {bulkSelected.length > 0 && (
                <>
                  <span className="text-sm text-gray-500">{bulkSelected.length} selected</span>
                  <button
                    onClick={handleBulkApprove}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleBulkReject}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setBulkSelected([])}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className={`text-2xl font-bold ${statsLoading ? 'text-gray-400' : 'text-orange-600'}`}>
            {statsLoading ? '...' : pendingCount}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
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
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-4 border border-green-200">
          <div className={`text-2xl font-bold ${statsLoading ? 'text-gray-400' : 'text-green-700'}`}>
            {statsLoading ? '...' : todayAdded} ✨
          </div>
          <div className="text-sm text-green-700 font-medium">Today</div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {filteredResearch.map((item) => {
            const confidence = getConfidenceIndicator(item.relevanceScore);
            const badge = getStudyTypeBadge(item.studySubject);

            return (
              <div
                key={item.id}
                className={`rounded-lg shadow hover:shadow-md transition-all border-l-4 ${confidence.color} ${confidence.bg} ${
                  showNewItemNotification === item.id ? 'ring-2 ring-green-400' : ''
                } bg-white cursor-pointer`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    {/* Left: Checkbox + Content */}
                    <div className="flex gap-3 flex-1 min-w-0">
                      {item.status === 'pending' && (
                        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={bulkSelected.includes(item.id)}
                            onChange={() => toggleBulkSelect(item.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Badges Row */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <ScoreBadge
                            score={item.relevanceScore}
                            signals={item.relevanceSignals || []}
                          />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                            {item.status.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {item.sourceSite}
                          </span>
                          {badge && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
                              {badge.icon} {badge.label}
                            </span>
                          )}
                          {item.year && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {item.year}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {item.title}
                        </h3>

                        {/* Authors & Publication */}
                        <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                          {item.authors && <span>{item.authors}</span>}
                          {item.authors && item.publication && <span> • </span>}
                          {item.publication && <span>{item.publication}</span>}
                        </p>

                        {/* Topics */}
                        {item.relevantTopics && item.relevantTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.relevantTopics.slice(0, 4).map((topic) => (
                              <span key={topic} className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                                {topic}
                              </span>
                            ))}
                            {item.relevantTopics.length > 4 && (
                              <span className="px-2 py-0.5 text-xs text-gray-500">
                                +{item.relevantTopics.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    {item.status === 'pending' && (
                      <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => approveResearch(item.id)}
                          className={`px-4 py-2 text-white text-sm rounded-lg transition-colors font-medium ${
                            item.relevanceScore >= 70
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-500 hover:bg-gray-600'
                          }`}
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                          }}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredResearch.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg">
                {selectedStatus || selectedTopic || selectedSource
                  ? 'No research found with current filters'
                  : 'No research found. Run a scan to discover papers!'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
