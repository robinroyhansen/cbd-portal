'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// Types
interface ScannerJob {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'cancelling' | 'paused';
  sources: string[];
  search_terms: string[];
  date_range_start: string | null;
  date_range_end: string | null;
  chunk_size: number;
  delay_ms: number;
  current_source_index: number;
  current_year: number | null;
  current_page: number;
  items_found: number;
  items_added: number;
  items_skipped: number;
  items_rejected: number;
  checkpoint: Record<string, any> | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

interface RecentResearchItem {
  id: string;
  title: string;
  source_site: string;
  relevance_score: number;
  discovered_at: string;
}

// Source definitions
const SOURCES = [
  { id: 'pubmed', name: 'PubMed', desc: '33M+ biomedical literature', available: true },
  { id: 'clinicaltrials', name: 'ClinicalTrials.gov', desc: 'Clinical trial database', available: true },
  { id: 'pmc', name: 'PMC', desc: 'Full-text research articles', available: true },
  { id: 'europepmc', name: 'Europe PMC', desc: 'European biomedical literature', available: false },
  { id: 'biorxiv', name: 'bioRxiv/medRxiv', desc: 'Preprints (not peer-reviewed)', available: false },
  { id: 'semanticscholar', name: 'Semantic Scholar', desc: 'AI-powered citation network', available: false },
];

const SOURCE_NAMES: Record<string, string> = {
  pubmed: 'PubMed',
  pmc: 'PMC',
  clinicaltrials: 'ClinicalTrials.gov',
  europepmc: 'Europe PMC',
  biorxiv: 'bioRxiv/medRxiv',
  semanticscholar: 'Semantic Scholar',
};

const SCAN_DEPTHS = [
  { value: '1year', label: 'Last 1 year', years: 1 },
  { value: '2years', label: 'Last 2 years', years: 2 },
  { value: '5years', label: 'Last 5 years', years: 5 },
  { value: '10years', label: 'Last 10 years', years: 10 },
  { value: 'all', label: 'All time', years: null },
];

// Utility functions
function formatElapsedTime(startedAt: string | null): string {
  if (!startedAt) return '0s';
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - start) / 1000);

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString();
}

function getDateRange(depth: string): { start: string | null; end: string | null } {
  const depthConfig = SCAN_DEPTHS.find(d => d.value === depth);
  if (!depthConfig || depthConfig.years === null) {
    return { start: null, end: null };
  }

  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - depthConfig.years);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export default function ScannerPage() {
  // State
  const [selectedSources, setSelectedSources] = useState<string[]>(['pubmed', 'clinicaltrials', 'pmc']);
  const [scanDepth, setScanDepth] = useState('1year');
  const [chunkSize, setChunkSize] = useState(50);
  const [delayMs, setDelayMs] = useState(1000);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [activeJob, setActiveJob] = useState<ScannerJob | null>(null);
  const [jobHistory, setJobHistory] = useState<ScannerJob[]>([]);
  const [recentItems, setRecentItems] = useState<RecentResearchItem[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState('0s');

  const processingRef = useRef(false);
  const supabase = createClient();

  // Fetch jobs list
  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/scanner/jobs?limit=10');
      const data = await response.json();

      if (data.jobs) {
        // Find active job
        const active = data.jobs.find((j: ScannerJob) =>
          ['queued', 'running', 'cancelling'].includes(j.status)
        );
        setActiveJob(active || null);

        // Set history (completed/failed/cancelled jobs)
        const history = data.jobs.filter((j: ScannerJob) =>
          ['completed', 'failed', 'cancelled', 'paused'].includes(j.status)
        );
        setJobHistory(history);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  }, []);

  // Fetch single job details
  const fetchJobDetails = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/scanner/jobs/${jobId}`);
      const data = await response.json();

      if (data.job) {
        if (['queued', 'running', 'cancelling'].includes(data.job.status)) {
          setActiveJob(data.job);
        } else {
          setActiveJob(null);
          fetchJobs(); // Refresh history
        }
      }
    } catch (err) {
      console.error('Failed to fetch job details:', err);
    }
  }, [fetchJobs]);

  // Process one chunk
  const processChunk = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/admin/scanner/process', { method: 'POST' });
      const data = await response.json();

      if (data.jobId) {
        await fetchJobDetails(data.jobId);

        // Continue processing if there's more
        if (data.hasMore && data.status === 'running') {
          // Small delay before next chunk
          setTimeout(() => {
            processingRef.current = false;
            processChunk();
          }, 500);
          return;
        }
      }

      // No more work or job completed
      if (data.status === 'completed' || data.status === 'cancelled' || !data.hasMore) {
        await fetchJobs();
      }
    } catch (err) {
      console.error('Failed to process chunk:', err);
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [fetchJobDetails, fetchJobs]);

  // Create new job
  const createJob = async () => {
    if (selectedSources.length === 0) {
      setError('Please select at least one source');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const dateRange = getDateRange(scanDepth);

      const response = await fetch('/api/admin/scanner/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: selectedSources,
          searchTerms: ['CBD', 'cannabidiol', 'cannabis', 'cannabinoid'],
          dateRangeStart: dateRange.start,
          dateRangeEnd: dateRange.end,
          chunkSize,
          delayMs,
        }),
      });

      const data = await response.json();

      if (data.error) {
        if (data.existingJobId) {
          setError(`A job is already ${data.existingStatus}. Wait for it to complete or cancel it.`);
          await fetchJobDetails(data.existingJobId);
        } else {
          setError(data.error);
        }
        return;
      }

      if (data.job) {
        setActiveJob(data.job);
        // Start processing
        processChunk();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setIsCreating(false);
    }
  };

  // Cancel job
  const cancelJob = async () => {
    if (!activeJob) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/admin/scanner/jobs/${activeJob.id}/cancel`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.job) {
        setActiveJob(data.job);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job');
    } finally {
      setIsCancelling(false);
    }
  };

  // Resume job
  const resumeJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/scanner/jobs/${jobId}/resume`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.job) {
        setActiveJob(data.job);
        processChunk();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume job');
    }
  };

  // Initial load
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Poll for updates when job is active
  useEffect(() => {
    if (!activeJob || !['queued', 'running'].includes(activeJob.status)) return;

    const interval = setInterval(() => {
      fetchJobDetails(activeJob.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeJob?.id, activeJob?.status, fetchJobDetails]);

  // Auto-process when job is queued
  useEffect(() => {
    if (activeJob?.status === 'queued' && !processingRef.current) {
      processChunk();
    }
  }, [activeJob?.status, processChunk]);

  // Update elapsed time
  useEffect(() => {
    if (!activeJob || !['running', 'queued'].includes(activeJob.status)) return;

    const interval = setInterval(() => {
      setElapsedTime(formatElapsedTime(activeJob.started_at));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJob?.id, activeJob?.status, activeJob?.started_at]);

  // Subscribe to new research items
  useEffect(() => {
    const fetchRecentItems = async () => {
      const { data } = await supabase
        .from('kb_research_queue')
        .select('id, title, source_site, relevance_score, discovered_at')
        .order('discovered_at', { ascending: false })
        .limit(10);

      if (data) setRecentItems(data);
    };

    fetchRecentItems();

    const channel = supabase
      .channel('scanner_research_queue')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'kb_research_queue',
      }, (payload) => {
        const newItem = payload.new as RecentResearchItem;
        setRecentItems(prev => [newItem, ...prev].slice(0, 10));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Computed values
  const isScanning = activeJob && ['queued', 'running'].includes(activeJob.status);
  const progressPercent = activeJob && activeJob.sources.length > 0
    ? Math.round((activeJob.current_source_index / activeJob.sources.length) * 100)
    : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Scanner</h1>
          <p className="text-gray-600 mt-2">Discover new CBD research from authoritative sources</p>
        </div>
        <Link
          href="/admin/research/queue"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          View Research Queue
        </Link>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex justify-between items-center">
          <span><strong>Error:</strong> {error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Active Job Panel */}
      {activeJob && (
        <div className={`mb-6 p-6 rounded-lg border-2 ${
          activeJob.status === 'completed' ? 'bg-green-50 border-green-300' :
          activeJob.status === 'failed' ? 'bg-red-50 border-red-300' :
          activeJob.status === 'cancelled' ? 'bg-gray-50 border-gray-300' :
          activeJob.status === 'cancelling' ? 'bg-yellow-50 border-yellow-300' :
          'bg-blue-50 border-blue-300'
        }`}>
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {isScanning && (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                )}
                {activeJob.status === 'completed' && <span className="text-green-600">Scan Complete</span>}
                {activeJob.status === 'failed' && <span className="text-red-600">Scan Failed</span>}
                {activeJob.status === 'cancelled' && <span className="text-gray-600">Scan Cancelled</span>}
                {activeJob.status === 'cancelling' && <span className="text-yellow-600">Cancelling...</span>}
                {activeJob.status === 'running' && (
                  <span className="text-blue-600">
                    Scanning {SOURCE_NAMES[activeJob.sources[activeJob.current_source_index]] || activeJob.sources[activeJob.current_source_index]}...
                  </span>
                )}
                {activeJob.status === 'queued' && <span className="text-yellow-600">Starting...</span>}
              </h3>

              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p><strong>Source:</strong> {activeJob.current_source_index + 1} of {activeJob.sources.length}</p>
                <p><strong>Page:</strong> {activeJob.current_page + 1}</p>
                <p><strong>Elapsed:</strong> {elapsedTime}</p>
              </div>
            </div>

            {/* Cancel Button */}
            {isScanning && (
              <button
                onClick={cancelJob}
                disabled={isCancelling || activeJob.status === 'cancelling'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isCancelling || activeJob.status === 'cancelling' ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Stopping...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" strokeWidth="2" />
                    </svg>
                    Stop Scan
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress: {activeJob.current_source_index} / {activeJob.sources.length} sources</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  activeJob.status === 'completed' ? 'bg-green-500' :
                  activeJob.status === 'failed' ? 'bg-red-500' :
                  activeJob.status === 'cancelled' ? 'bg-gray-500' :
                  'bg-blue-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Source Status Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activeJob.sources.map((source, index) => {
              const isCompleted = index < activeJob.current_source_index;
              const isCurrent = index === activeJob.current_source_index;

              return (
                <span
                  key={source}
                  className={`px-3 py-1 text-xs rounded-full flex items-center gap-1.5 font-medium ${
                    isCompleted ? 'bg-green-100 text-green-800' :
                    isCurrent ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isCurrent && isScanning && (
                    <span className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></span>
                  )}
                  {index + 1}. {SOURCE_NAMES[source] || source}
                </span>
              );
            })}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded p-3 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{activeJob.items_found}</div>
              <div className="text-xs text-gray-500">Found</div>
            </div>
            <div className="bg-white rounded p-3 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{activeJob.items_added}</div>
              <div className="text-xs text-gray-500">Added</div>
            </div>
            <div className="bg-white rounded p-3 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{activeJob.items_skipped}</div>
              <div className="text-xs text-gray-500">Duplicates</div>
            </div>
            <div className="bg-white rounded p-3 shadow-sm">
              <div className="text-2xl font-bold text-red-600">{activeJob.items_rejected}</div>
              <div className="text-xs text-gray-500">Filtered</div>
            </div>
          </div>

          {/* Error Message */}
          {activeJob.error_message && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded text-red-800 text-sm">
              <strong>Error:</strong> {activeJob.error_message}
            </div>
          )}
        </div>
      )}

      {/* Real-time Feed */}
      {(isScanning || recentItems.length > 0) && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            {isScanning && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
            Recently Discovered Research
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentItems.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate" title={item.title}>{item.title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs shrink-0">
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded whitespace-nowrap">
                    {item.source_site}
                  </span>
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                    {item.relevance_score}
                  </span>
                </div>
              </div>
            ))}
            {recentItems.length === 0 && (
              <p className="text-gray-500 text-sm">No recent items. Start a scan to discover research.</p>
            )}
          </div>
        </div>
      )}

      {/* Job Creation Panel */}
      {!isScanning && (
        <div className="space-y-6">
          {/* Source Selection */}
          <div className="p-6 bg-white rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {SOURCES.map(source => (
                <label
                  key={source.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    !source.available ? 'opacity-50 cursor-not-allowed bg-gray-50' :
                    selectedSources.includes(source.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={(e) => {
                      if (!source.available) return;
                      if (e.target.checked) {
                        setSelectedSources([...selectedSources, source.id]);
                      } else {
                        setSelectedSources(selectedSources.filter(s => s !== source.id));
                      }
                    }}
                    disabled={!source.available}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{source.name}</span>
                      {!source.available && (
                        <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">Coming Soon</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{source.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Quick Select Buttons */}
            <div className="mt-4 pt-4 border-t flex gap-2">
              <button
                onClick={() => setSelectedSources(SOURCES.filter(s => s.available).map(s => s.id))}
                className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Select All Available
              </button>
              <button
                onClick={() => setSelectedSources(['pubmed', 'clinicaltrials', 'pmc'])}
                className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Core Medical
              </button>
              <button
                onClick={() => setSelectedSources([])}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Scan Depth */}
          <div className="p-6 bg-white rounded-lg shadow border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan Depth</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {SCAN_DEPTHS.map(depth => (
                <label
                  key={depth.value}
                  className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    scanDepth === depth.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="scanDepth"
                    value={depth.value}
                    checked={scanDepth === depth.value}
                    onChange={() => setScanDepth(depth.value)}
                    className="sr-only"
                  />
                  <span className="font-medium text-sm">{depth.label}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Scans will automatically skip studies already in the database.
            </p>
          </div>

          {/* Advanced Options */}
          <details className="p-6 bg-white rounded-lg shadow border" open={showAdvanced}>
            <summary
              className="text-lg font-semibold text-gray-900 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setShowAdvanced(!showAdvanced);
              }}
            >
              Advanced Options
            </summary>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chunk Size (items per request)
                </label>
                <input
                  type="number"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Math.max(10, Math.min(100, parseInt(e.target.value) || 50)))}
                  min={10}
                  max={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">10-100 items per API request</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay Between Requests (ms)
                </label>
                <input
                  type="number"
                  value={delayMs}
                  onChange={(e) => setDelayMs(Math.max(500, parseInt(e.target.value) || 1000))}
                  min={500}
                  step={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 500ms to respect rate limits</p>
              </div>
            </div>
          </details>

          {/* Start Button */}
          <div className="flex justify-center">
            <button
              onClick={createJob}
              disabled={isCreating || selectedSources.length === 0}
              className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all flex items-center gap-2 ${
                isCreating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : selectedSources.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Creating Job...
                </>
              ) : selectedSources.length === 0 ? (
                'Select Sources to Scan'
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Start Scan ({selectedSources.length} source{selectedSources.length > 1 ? 's' : ''})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Job History */}
      {jobHistory.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scan History</h3>
          <div className="space-y-3">
            {jobHistory.map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      job.status === 'completed' ? 'bg-green-100 text-green-800' :
                      job.status === 'failed' ? 'bg-red-100 text-red-800' :
                      job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {job.sources.map(s => SOURCE_NAMES[s] || s).join(', ')}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {formatDate(job.created_at)} -
                    Found: {job.items_found}, Added: {job.items_added}, Skipped: {job.items_skipped}
                  </div>
                </div>
                <div className="flex gap-2">
                  {(job.status === 'paused' || job.status === 'failed') && (
                    <button
                      onClick={() => resumeJob(job.id)}
                      className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Resume
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>How it works:</strong> The scanner fetches research from public APIs in chunks,
        checking for duplicates and scoring relevance. Results are added to your review queue
        where you can approve or reject them. Scans can be stopped and resumed at any time.
      </div>
    </div>
  );
}
