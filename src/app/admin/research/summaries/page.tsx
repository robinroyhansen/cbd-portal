'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

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
  status: string;
  reviewed_at?: string;
  plain_summary?: string;
}

export default function SummariesPage() {
  const [research, setResearch] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editingSummary, setEditingSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: number; failed: number } | null>(null);
  const [copiedAbstract, setCopiedAbstract] = useState(false);
  const supabase = createClient();

  const fetchResearch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('status', 'approved')
      .is('plain_summary', null)
      .order('reviewed_at', { ascending: false });

    if (!error) {
      setResearch(data || []);
      if (data && data.length > 0) {
        setEditingSummary('');
      }
    } else {
      console.error('Error fetching research:', error);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  const currentStudy = research[currentIndex];

  const generateSummary = async () => {
    if (!currentStudy) return;

    setIsGenerating(true);

    const title = currentStudy.title;
    const abstract = currentStudy.abstract;
    const topics = currentStudy.relevant_topics;
    const year = currentStudy.year;

    let draft = '';

    if (abstract) {
      // Create a draft summary based on the abstract
      const sentences = abstract.split(/[.!?]+/).filter(s => s.trim().length > 20);
      if (sentences.length > 0) {
        // Take first 2-3 sentences and simplify
        const firstSentences = sentences.slice(0, 3).join('. ').trim();

        // Basic simplification
        draft = firstSentences
          .replace(/\([^)]*\)/g, '') // Remove parentheticals
          .replace(/et al\./g, 'and colleagues')
          .replace(/\s+/g, ' ')
          .trim();

        // Truncate to ~100 words
        const words = draft.split(' ');
        if (words.length > 100) {
          draft = words.slice(0, 95).join(' ') + '...';
        }

        // Ensure it ends with a period
        if (!draft.endsWith('.') && !draft.endsWith('...')) {
          draft += '.';
        }
      } else {
        draft = `This study examines ${title.toLowerCase().replace(/[:.]/g, '')}. [Please edit this summary based on the abstract.]`;
      }
    } else {
      // No abstract available - generate from title and topics
      const topicsList = topics && topics.length > 0
        ? topics.slice(0, 3).join(', ').toLowerCase()
        : 'cannabidiol (CBD)';

      // Clean the title for use in the summary
      const cleanTitle = title
        .replace(/[:.]/g, '')
        .replace(/\([^)]*\)/g, '')
        .trim()
        .toLowerCase();

      // Generate a basic template summary
      draft = `This ${year ? year + ' ' : ''}study investigates ${cleanTitle}. `;
      draft += `The research focuses on ${topicsList}. `;
      draft += `[No abstract available - please click "View Full Paper" to read the source and complete this summary.]`;
    }

    // Simulate brief delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setEditingSummary(draft);
    setIsGenerating(false);
  };

  const saveSummary = async () => {
    if (!currentStudy || !editingSummary.trim()) return;

    setIsSaving(true);

    const { error } = await supabase
      .from('kb_research_queue')
      .update({ plain_summary: editingSummary.trim() })
      .eq('id', currentStudy.id);

    if (!error) {
      // Remove from list and move to next
      setResearch(prev => prev.filter(item => item.id !== currentStudy.id));
      setEditingSummary('');
      // Adjust index if needed
      if (currentIndex >= research.length - 1) {
        setCurrentIndex(Math.max(0, research.length - 2));
      }
    } else {
      console.error('Failed to save summary:', error);
      alert('Failed to save summary. Please try again.');
    }

    setIsSaving(false);
  };

  const skipStudy = () => {
    if (currentIndex < research.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setEditingSummary('');
    }
  };

  const previousStudy = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setEditingSummary('');
    }
  };

  const copyAbstract = async () => {
    if (currentStudy?.abstract) {
      await navigator.clipboard.writeText(currentStudy.abstract);
      setCopiedAbstract(true);
      setTimeout(() => setCopiedAbstract(false), 2000);
    }
  };

  const exportCSV = () => {
    if (research.length === 0) return;

    // Create CSV content
    const headers = ['id', 'title', 'abstract'];
    const rows = research.map(item => [
      item.id,
      `"${(item.title || '').replace(/"/g, '""')}"`,
      `"${(item.abstract || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studies-needing-summaries-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importCSV = async () => {
    if (!importData.trim()) return;

    setImportStatus(null);
    let success = 0;
    let failed = 0;

    try {
      // Parse CSV
      const lines = importData.trim().split('\n');
      const hasHeader = lines[0].toLowerCase().includes('id') &&
                       (lines[0].toLowerCase().includes('summary') || lines[0].toLowerCase().includes('plain_summary'));

      const dataLines = hasHeader ? lines.slice(1) : lines;

      for (const line of dataLines) {
        if (!line.trim()) continue;

        // Parse CSV line (handle quoted fields)
        const matches = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|\s*[^,]*)/g);
        if (!matches || matches.length < 2) continue;

        const cleanField = (field: string) => {
          let cleaned = field.replace(/^,/, '').trim();
          if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            cleaned = cleaned.slice(1, -1).replace(/""/g, '"');
          }
          return cleaned;
        };

        const id = cleanField(matches[0]);
        const summary = cleanField(matches[1]);

        if (!id || !summary) continue;

        const { error } = await supabase
          .from('kb_research_queue')
          .update({ plain_summary: summary })
          .eq('id', id);

        if (error) {
          failed++;
        } else {
          success++;
        }
      }

      setImportStatus({ success, failed });

      // Refresh list
      if (success > 0) {
        await fetchResearch();
      }
    } catch (err) {
      console.error('Import error:', err);
      setImportStatus({ success: 0, failed: -1 });
    }
  };

  const wordCount = editingSummary.trim().split(/\s+/).filter(w => w).length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Summaries</h1>
          <p className="text-gray-600 mt-2">
            Generate &quot;What You Need to Know&quot; summaries for research studies
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            disabled={research.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Import Summaries
          </button>
          <button
            onClick={fetchResearch}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📝</span>
          <span className="text-lg font-semibold text-amber-800">
            {research.length} {research.length === 1 ? 'study needs' : 'studies need'} summaries
          </span>
        </div>
        <p className="text-sm text-amber-700 mt-1">
          Approved studies without plain language summaries
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && research.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-gray-600 text-lg">
            All studies have summaries! Great work.
          </p>
        </div>
      )}

      {!loading && currentStudy && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Study Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm text-gray-500">
                Study {currentIndex + 1} of {research.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={previousStudy}
                  disabled={currentIndex === 0}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <button
                  onClick={skipStudy}
                  disabled={currentIndex >= research.length - 1}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip →
                </button>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              {currentStudy.title}
            </h2>

            {currentStudy.authors && (
              <p className="text-sm text-gray-600 mb-2">
                <strong>Authors:</strong> {currentStudy.authors}
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-4">
              {currentStudy.year && <span>Year: {currentStudy.year}</span>}
              {currentStudy.publication && <span>• {currentStudy.publication}</span>}
              {currentStudy.source_site && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {currentStudy.source_site}
                </span>
              )}
            </div>

            {currentStudy.relevant_topics && currentStudy.relevant_topics.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {currentStudy.relevant_topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <strong className="text-gray-700">Abstract:</strong>
                <button
                  onClick={copyAbstract}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {copiedAbstract ? '✓ Copied!' : '📋 Copy Abstract'}
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {currentStudy.abstract || 'No abstract available'}
                </p>
              </div>
            </div>

            {currentStudy.url && (
              <a
                href={currentStudy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                📄 View Full Paper →
              </a>
            )}
          </div>

          {/* Right: Summary Editor */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">What You Need to Know</h3>
              <button
                onClick={generateSummary}
                disabled={isGenerating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Generating...
                  </>
                ) : (
                  <>✨ Generate Draft</>
                )}
              </button>
            </div>

            <div className="mb-2 text-sm text-gray-500">
              Write a summary for an 18-year-old reader (max 100 words)
            </div>

            <textarea
              value={editingSummary}
              onChange={(e) => setEditingSummary(e.target.value)}
              placeholder="Enter or generate a plain language summary..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />

            <div className="flex justify-between items-center mt-3">
              <div className={`text-sm ${wordCount > 100 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                {wordCount} / 100 words
                {wordCount > 100 && ' (over limit)'}
              </div>
              <button
                onClick={saveSummary}
                disabled={isSaving || !editingSummary.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>💾 Save Summary</>
                )}
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Writing Tips:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Avoid jargon and technical terms</li>
                <li>• Explain what the study does and why it matters</li>
                <li>• Keep sentences short and clear</li>
                <li>• Focus on the main finding or purpose</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Import Summaries from CSV</h3>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData('');
                    setImportStatus(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Paste CSV data with columns: <code className="bg-gray-100 px-1 rounded">id,plain_summary</code>
              </p>

              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="id,plain_summary
abc-123,This study examines...
def-456,Researchers found that..."
                className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />

              {importStatus && (
                <div className={`mt-4 p-3 rounded-lg ${
                  importStatus.failed === -1
                    ? 'bg-red-100 text-red-800'
                    : importStatus.failed > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}>
                  {importStatus.failed === -1 ? (
                    'Error parsing CSV. Please check the format.'
                  ) : (
                    <>
                      ✓ Imported {importStatus.success} summaries
                      {importStatus.failed > 0 && `, ${importStatus.failed} failed`}
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData('');
                    setImportStatus(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={importCSV}
                  disabled={!importData.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
