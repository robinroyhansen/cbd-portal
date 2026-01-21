'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  assessStudyQuality,
  detectStudyType,
  StudyType
} from '@/lib/quality-tiers';
import { extractSampleInfo } from '@/lib/study-analysis';

interface GenerationStatus {
  totalApproved: number;
  needsContent: number;
  completed: number;
  percentage: number;
}

interface GenerationResult {
  processed: number;
  successful: number;
  failed: number;
  remaining: number;
  results: Array<{ id: string; status: string; error?: string; title?: string }>;
}

interface Study {
  id: string;
  title: string;
  slug: string;
  authors?: string;
  publication?: string;
  year?: number;
  abstract?: string;
  plain_summary?: string;
  url: string;
  doi?: string;
  source_site: string;
  quality_score?: number;
  relevance_score?: number;
  relevant_topics: string[];
  status: string;
  reviewed_at?: string;
  discovered_at: string;
  meta_title?: string;
  meta_description?: string;
  study_type?: string;
  country?: string;
  key_findings?: any[];
}

interface EnrichedStudy extends Study {
  qualityScore: number;
  sampleSize: number | null;
  sampleLabel: string | null;
  readableTitle: string;
  studyTypeName: string;
}

// Generate readable title (simplified version)
function generateReadableTitle(title: string, studyType: string): string {
  let type = studyType || 'Study';

  // Try to extract condition
  const patterns = [
    /(?:treatment|therapy)\s+(?:of|for)\s+([A-Z][a-zA-Z\s]+?)(?:\s*[:(]|\s*$)/i,
    /\bfor\s+([A-Z][a-zA-Z\s]+?)(?:\s*[:(]|\s*$)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const condition = match[1].trim();
      if (!/^(cannabidiol|cbd|cannabis|hemp|thc)$/i.test(condition) && condition.length < 40) {
        const hasCBD = /cannabidiol|cbd/i.test(title);
        if (hasCBD) return `CBD for ${condition}: ${type} Results`;
        return `${condition}: ${type} Results`;
      }
    }
  }

  // Fallback: truncate title
  let readable = title.replace(/^(A |An |The )/i, '');
  if (readable.length > 60) {
    readable = readable.substring(0, 57) + '...';
  }
  return readable;
}

const ITEMS_PER_PAGE = 20;

export default function AdminStudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('reviewed_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [hasSummary, setHasSummary] = useState<string>('');
  const [hasMeta, setHasMeta] = useState<string>('');
  const [qualityFilter, setQualityFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Bulk generation state
  const [genStatus, setGenStatus] = useState<GenerationStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genResult, setGenResult] = useState<GenerationResult | null>(null);
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; successful: number; failed: number } | null>(null);

  const supabase = createClient();

  // Fetch total count separately (avoids Supabase 1000 row limit)
  const fetchTotalCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('kb_research_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (!error && count !== null) {
      setTotalCount(count);
    }
  }, [supabase]);

  const fetchStudies = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kb_research_queue')
      .select('*')
      .eq('status', 'approved')
      .order('reviewed_at', { ascending: false });

    if (!error) {
      setStudies(data || []);
    } else {
      console.error('Error fetching studies:', error);
    }
    setLoading(false);
  }, [supabase]);

  // Fetch generation status
  const fetchGenStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/research/bulk-generate');
      if (response.ok) {
        const data = await response.json();
        setGenStatus(data);
      }
    } catch (error) {
      console.error('Error fetching generation status:', error);
    }
  }, []);

  // Generate a single batch of studies
  const generateBatch = async (batchSize: number = 10): Promise<GenerationResult> => {
    const response = await fetch('/api/admin/research/bulk-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchSize }),
    });
    return response.json();
  };

  // Generate next N studies (single batch)
  const generateNext = async (count: number = 10) => {
    setIsGenerating(true);
    setGenResult(null);
    setBulkProgress(null);
    try {
      const data = await generateBatch(count);
      setGenResult(data);
      await fetchGenStatus();
      await fetchStudies();
    } catch (error) {
      console.error('Error generating content:', error);
      setGenResult({
        processed: 0,
        successful: 0,
        failed: 0,
        remaining: genStatus?.needsContent || 0,
        results: [{ id: 'error', status: 'error', error: String(error) }],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate all studies in chunks
  const generateAll = async () => {
    if (!genStatus) return;

    setIsGenerating(true);
    setGenResult(null);
    setShowConfirmAll(false);

    const total = genStatus.needsContent;
    const chunkSize = 10;
    let processed = 0;
    let successful = 0;
    let failed = 0;

    setBulkProgress({ current: 0, total, successful: 0, failed: 0 });

    try {
      while (processed < total) {
        const data = await generateBatch(chunkSize);
        processed += data.processed;
        successful += data.successful;
        failed += data.failed;

        setBulkProgress({ current: processed, total, successful, failed });

        // If no more to process, break
        if (data.remaining === 0 || data.processed === 0) break;

        // Wait 2 seconds between batches
        await new Promise(r => setTimeout(r, 2000));
      }

      // Final status
      setGenResult({
        processed,
        successful,
        failed,
        remaining: total - processed,
        results: [],
      });
      await fetchGenStatus();
      await fetchStudies();
    } catch (error) {
      console.error('Error in bulk generation:', error);
      setGenResult({
        processed,
        successful,
        failed,
        remaining: total - processed,
        results: [{ id: 'error', status: 'error', error: String(error) }],
      });
    } finally {
      setIsGenerating(false);
      setBulkProgress(null);
    }
  };

  useEffect(() => {
    fetchStudies();
    fetchTotalCount();
    fetchGenStatus();
  }, [fetchStudies, fetchTotalCount, fetchGenStatus]);

  // Enrich studies with calculated fields
  const enrichedStudies: EnrichedStudy[] = useMemo(() => {
    return studies.map(study => {
      const assessment = assessStudyQuality(study);
      const studyText = `${study.title || ''} ${study.abstract || ''}`;
      const sampleInfo = extractSampleInfo(studyText);
      const detectedType = detectStudyType(study);

      const studyTypeName =
        detectedType === StudyType.RCT ? 'RCT' :
        detectedType === StudyType.META_ANALYSIS ? 'Meta-Analysis' :
        detectedType === StudyType.SYSTEMATIC_REVIEW ? 'Systematic Review' :
        detectedType === StudyType.CLINICAL_TRIAL ? 'Clinical Trial' :
        detectedType === StudyType.COHORT ? 'Cohort' :
        detectedType === StudyType.IN_VITRO ? 'In Vitro' :
        detectedType === StudyType.ANIMAL ? 'Animal' :
        'Study';

      return {
        ...study,
        qualityScore: assessment.score,
        sampleSize: sampleInfo?.size || null,
        sampleLabel: sampleInfo?.label || null,
        readableTitle: generateReadableTitle(study.title, studyTypeName),
        studyTypeName,
      };
    });
  }, [studies]);

  // Get unique values for filters
  const allTopics = [...new Set(studies.flatMap(s => s.relevant_topics || []))].sort();
  const allYears = [...new Set(studies.map(s => s.year).filter(Boolean))].sort((a, b) => b! - a!);

  // Filter and sort studies
  const filteredStudies = useMemo(() => {
    return enrichedStudies
      .filter(item => {
        const topicMatch = selectedTopic ? item.relevant_topics?.includes(selectedTopic) : true;
        const yearMatch = yearFilter ? item.year === parseInt(yearFilter) : true;
        const summaryMatch = hasSummary === '' ? true :
                            hasSummary === 'yes' ? !!item.plain_summary :
                            !item.plain_summary;

        const hasMetaTitle = item.meta_title && item.meta_title.length > 0;
        const hasMetaDesc = item.meta_description && item.meta_description.length > 0;
        const metaMatch = hasMeta === '' ? true :
                         hasMeta === 'complete' ? (hasMetaTitle && hasMetaDesc) :
                         (!hasMetaTitle || !hasMetaDesc);

        const qualityMatch = qualityFilter === '' ? true :
                            qualityFilter === 'high' ? item.qualityScore >= 70 :
                            qualityFilter === 'medium' ? (item.qualityScore >= 40 && item.qualityScore < 70) :
                            item.qualityScore < 40;

        const searchMatch = !searchQuery || [
          item.title,
          item.authors,
          item.abstract,
          item.publication,
          item.plain_summary,
          item.relevant_topics?.join(' ')
        ].some(field =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return topicMatch && yearMatch && summaryMatch && metaMatch && qualityMatch && searchMatch;
      })
      .sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case 'relevance':
            aValue = a.relevance_score ?? 0;
            bValue = b.relevance_score ?? 0;
            break;
          case 'quality':
            aValue = a.qualityScore;
            bValue = b.qualityScore;
            break;
          case 'year':
            aValue = a.year || 0;
            bValue = b.year || 0;
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'topic':
            aValue = a.relevant_topics?.[0] || '';
            bValue = b.relevant_topics?.[0] || '';
            break;
          default: // reviewed_at
            aValue = new Date(a.reviewed_at || a.discovered_at);
            bValue = new Date(b.reviewed_at || b.discovered_at);
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
  }, [enrichedStudies, selectedTopic, yearFilter, hasSummary, hasMeta, qualityFilter, searchQuery, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredStudies.length / ITEMS_PER_PAGE);
  const paginatedStudies = filteredStudies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTopic, yearFilter, hasSummary, hasMeta, qualityFilter, searchQuery]);

  // Stats
  const withSummary = studies.filter(s => s.plain_summary).length;
  const withMeta = studies.filter(s => s.meta_title && s.meta_description).length;
  const highQuality = enrichedStudies.filter(s => s.qualityScore >= 70).length;

  // Meta status helper
  const getMetaStatus = (title?: string, desc?: string) => {
    const titleLen = title?.length || 0;
    const descLen = desc?.length || 0;
    const titleOk = titleLen >= 45 && titleLen <= 65;
    const descOk = descLen >= 130 && descLen <= 160;
    return { titleLen, descLen, titleOk, descOk };
  };

  const getQualityColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Studies</h1>
          <p className="text-gray-600 mt-1">Manage published research study pages</p>
        </div>
        <div className="flex gap-3">
          <button
            disabled
            title="Coming soon"
            className="bg-purple-100 text-purple-400 px-4 py-2 rounded-lg cursor-not-allowed text-sm"
          >
            Generate All Summaries
          </button>
          <button
            disabled
            title="Coming soon"
            className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed text-sm"
          >
            Export CSV
          </button>
          <button
            onClick={fetchStudies}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Content Generation Status Card */}
      {genStatus && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📊</span> Content Generation Status
          </h2>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                Studies needing content: <strong>{genStatus.needsContent}</strong> of {genStatus.totalApproved}
              </span>
              <span className="font-medium text-gray-900">{genStatus.percentage}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${genStatus.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => generateNext(10)}
              disabled={isGenerating || genStatus.needsContent === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isGenerating || genStatus.needsContent === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating && !bulkProgress ? 'Generating...' : 'Generate Next 10'}
            </button>

            <button
              onClick={() => setShowConfirmAll(true)}
              disabled={isGenerating || genStatus.needsContent === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isGenerating || genStatus.needsContent === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Generate All ({genStatus.needsContent})
            </button>

            {isGenerating && !bulkProgress && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                Generating content (highest quality first)...
              </div>
            )}
          </div>

          {/* Bulk Progress Display */}
          {bulkProgress && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Bulk Generation in Progress
                </span>
                <span className="text-sm text-blue-700">
                  {bulkProgress.current} / {bulkProgress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                />
              </div>
              <div className="flex gap-4 text-xs text-blue-700">
                <span className="text-green-600">Success: {bulkProgress.successful}</span>
                {bulkProgress.failed > 0 && <span className="text-red-600">Failed: {bulkProgress.failed}</span>}
                <span>Processing highest quality studies first...</span>
              </div>
            </div>
          )}

          {/* Generation Result Toast */}
          {genResult && (
            <div className={`mt-4 p-4 rounded-lg ${genResult.failed > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-start gap-3">
                <span className="text-xl">{genResult.failed > 0 ? '⚠️' : '✅'}</span>
                <div>
                  <p className="font-medium text-gray-900">
                    Generated content for {genResult.successful} studies
                    {genResult.failed > 0 && ` (${genResult.failed} failed)`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {genResult.remaining} studies remaining
                  </p>
                  {genResult.failed > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm text-amber-700 cursor-pointer">View errors</summary>
                      <ul className="mt-2 text-sm text-gray-600 space-y-1">
                        {genResult.results
                          .filter(r => r.status === 'error')
                          .map((r, i) => (
                            <li key={i} className="truncate">
                              • {r.title}: {r.error}
                            </li>
                          ))}
                      </ul>
                    </details>
                  )}
                </div>
                <button
                  onClick={() => setGenResult(null)}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm All Modal */}
      {showConfirmAll && genStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Generate All Content?</h3>
            <p className="text-gray-600 mb-4">
              This will generate content for <strong>{genStatus.needsContent} studies</strong>.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                <strong>Estimated cost:</strong> ~${((genStatus.needsContent * 0.002)).toFixed(2)} (Claude Haiku)
              </p>
              <p className="text-sm text-amber-800 mt-1">
                <strong>Estimated time:</strong> ~{Math.ceil(genStatus.needsContent * 2 / 60)} minutes
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmAll(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateAll}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Start Generation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{totalCount.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Studies</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{withSummary.toLocaleString()}</div>
          <div className="text-sm text-gray-600">With Summary</div>
          <div className="text-xs text-gray-400">{(totalCount - withSummary).toLocaleString()} missing</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">{withMeta.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Complete Meta</div>
          <div className="text-xs text-gray-400">{(totalCount - withMeta).toLocaleString()} incomplete</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-amber-600">{highQuality}</div>
          <div className="text-sm text-gray-600">High Quality (70+)</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search by title, author, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
          >
            <option value="">All Topics</option>
            {allTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={hasSummary}
            onChange={(e) => setHasSummary(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
          >
            <option value="">Summary: All</option>
            <option value="yes">Has Summary</option>
            <option value="no">No Summary</option>
          </select>

          <select
            value={hasMeta}
            onChange={(e) => setHasMeta(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
          >
            <option value="">Meta: All</option>
            <option value="complete">Complete</option>
            <option value="missing">Missing</option>
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
          >
            <option value="">All Years</option>
            {allYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
          >
            <option value="">Quality: All</option>
            <option value="high">High (70+)</option>
            <option value="medium">Medium (40-69)</option>
            <option value="low">Low (&lt;40)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
          >
            <option value="reviewed_at">Sort: Recent</option>
            <option value="relevance">Sort: Relevance</option>
            <option value="quality">Sort: Quality</option>
            <option value="year">Sort: Year</option>
            <option value="title">Sort: Title</option>
            <option value="topic">Sort: Topic</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        {/* Results count */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filteredStudies.length} approved studies</span>
          {(selectedTopic || hasSummary || hasMeta || yearFilter || qualityFilter || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopic('');
                setYearFilter('');
                setHasSummary('');
                setHasMeta('');
                setQualityFilter('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Studies Cards */}
      {!loading && (
        <div className="space-y-4">
          {paginatedStudies.map((study) => {
            const meta = getMetaStatus(study.meta_title, study.meta_description);
            const primaryTopic = study.relevant_topics?.[0];

            return (
              <div key={study.id} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {study.readableTitle}
                    </h3>

                    {/* Meta line */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      {study.authors && (
                        <span className="truncate max-w-[200px]">{study.authors.split(',')[0]}</span>
                      )}
                      {study.year && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span>{study.year}</span>
                        </>
                      )}
                      {primaryTopic && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {primaryTopic.charAt(0).toUpperCase() + primaryTopic.slice(1)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Stats line */}
                    <div className="flex items-center gap-3 text-sm mb-3">
                      <span className={`font-medium ${getQualityColor(study.qualityScore)}`}>
                        Quality: {study.qualityScore}/100
                      </span>
                      {study.sampleLabel && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-600">{study.sampleLabel}</span>
                        </>
                      )}
                      <span className="text-gray-300">•</span>
                      {study.plain_summary ? (
                        <span className="text-green-600">Has Summary ✓</span>
                      ) : (
                        <span className="text-amber-600">No Summary ⚠</span>
                      )}
                    </div>

                    {/* Meta status */}
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-500">Meta:</span>
                      <span className={meta.titleOk ? 'text-green-600' : meta.titleLen > 0 ? 'text-amber-600' : 'text-red-500'}>
                        {meta.titleLen > 0 ? `✓ Title (${meta.titleLen}/60)` : '⚠ Title (0/60)'}
                      </span>
                      <span className={meta.descOk ? 'text-green-600' : meta.descLen > 0 ? 'text-amber-600' : 'text-red-500'}>
                        {meta.descLen > 0 ? `✓ Desc (${meta.descLen}/155)` : '⚠ Desc (0/155)'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/admin/research/studies/${study.id}/edit`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/research/study/${study.slug}`}
                      target="_blank"
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors text-center"
                    >
                      View Page ↗
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredStudies.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500 text-lg">No studies found matching your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
