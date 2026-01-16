'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  useScannerJob,
  useElapsedTime,
  useTimeSince,
  ScannerJob,
} from '@/hooks/useScannerJob';

// Source definitions
const SOURCES = [
  { id: 'pubmed', name: 'PubMed', desc: '33M+ biomedical literature', available: true, icon: '📚' },
  { id: 'clinicaltrials', name: 'ClinicalTrials.gov', desc: 'Clinical trial database', available: true, icon: '🏥' },
  { id: 'pmc', name: 'PMC', desc: 'Full-text research articles', available: true, icon: '📄' },
  { id: 'openalex', name: 'OpenAlex', desc: '250M+ works, comprehensive', available: true, icon: '🔬' },
  { id: 'europepmc', name: 'Europe PMC', desc: 'European biomedical literature', available: true, icon: '🇪🇺' },
  { id: 'semanticscholar', name: 'Semantic Scholar', desc: 'AI-powered research discovery', available: true, icon: '🤖' },
  { id: 'biorxiv', name: 'bioRxiv/medRxiv', desc: 'Preprints (newest research)', available: true, icon: '🧬' },
];

const SOURCE_NAMES: Record<string, string> = {
  pubmed: 'PubMed',
  pmc: 'PMC',
  clinicaltrials: 'ClinicalTrials.gov',
  openalex: 'OpenAlex',
  europepmc: 'Europe PMC',
  semanticscholar: 'Semantic Scholar',
  biorxiv: 'bioRxiv/medRxiv',
};

const SCAN_DEPTHS = [
  { value: '1year', label: 'Last 1 year', years: 1 },
  { value: '2years', label: 'Last 2 years', years: 2 },
  { value: '5years', label: 'Last 5 years', years: 5 },
  { value: '10years', label: 'Last 10 years', years: 10 },
  { value: 'all', label: 'All time', years: null },
];

// Default search keywords used by the scanner
const DEFAULT_SEARCH_TERMS = [
  'cannabidiol',
  'CBD',
  'cannabis',
  'cannabinoid',
  'hemp',
  'THC',
  'endocannabinoid',
  'medical cannabis',
  'Epidiolex',
  'Sativex',
];

// Extended search terms for comprehensive scans
const EXTENDED_SEARCH_TERMS = [
  'cannabidiol clinical trial',
  'cannabidiol therapy',
  'CBD treatment study',
  'medical cannabis clinical',
  'cannabidiol anxiety',
  'cannabidiol pain',
  'cannabidiol epilepsy',
  'cannabidiol sleep',
  'cannabidiol inflammation',
  'nabiximols trial',
];

const STATUS_BADGES: Record<string, { color: string; icon: string; label: string }> = {
  completed: { color: 'bg-green-100 text-green-800', icon: '🟢', label: 'Completed' },
  failed: { color: 'bg-red-100 text-red-800', icon: '🔴', label: 'Failed' },
  running: { color: 'bg-blue-100 text-blue-800', icon: '🟡', label: 'Running' },
  queued: { color: 'bg-yellow-100 text-yellow-800', icon: '⚪', label: 'Queued' },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: '⬛', label: 'Cancelled' },
  cancelling: { color: 'bg-orange-100 text-orange-800', icon: '🟠', label: 'Stopping' },
  paused: { color: 'bg-purple-100 text-purple-800', icon: '🟣', label: 'Paused' },
};

interface RecentResearchItem {
  id: string;
  title: string;
  source_site: string;
  relevance_score: number;
  discovered_at: string;
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

function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt) return '-';
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const seconds = Math.floor((end - start) / 1000);

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideIn z-50`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-80">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Active Job Panel Component
function ActiveJobPanel({
  job,
  progress,
  isProcessing,
  isCancelling,
  isPausing,
  lastActivity,
  onCancel,
  onPause,
  onResume,
}: {
  job: ScannerJob;
  progress: { percent: number; currentSource: string | null; sourcesCompleted: number; sourcesTotal: number } | null;
  isProcessing: boolean;
  isCancelling: boolean;
  isPausing: boolean;
  lastActivity: Date | null;
  onCancel: () => void;
  onPause: () => void;
  onResume: () => void;
}) {
  const elapsed = useElapsedTime(job.started_at);
  const timeSinceActivity = useTimeSince(lastActivity);
  const isActive = ['queued', 'running'].includes(job.status);
  const isPaused = job.status === 'paused';

  // Calculate estimated remaining items
  const itemsProcessed = job.items_added + job.items_skipped + job.items_rejected;
  const estimatedRemaining = job.items_found > 0
    ? Math.round((job.items_found / Math.max(job.current_source_index + 1, 1)) * (job.sources.length - job.current_source_index - 1))
    : 0;

  return (
    <div className={`mb-6 rounded-xl border-2 overflow-hidden ${
      job.status === 'completed' ? 'border-green-300 bg-green-50' :
      job.status === 'failed' ? 'border-red-300 bg-red-50' :
      job.status === 'cancelled' ? 'border-gray-300 bg-gray-50' :
      job.status === 'cancelling' ? 'border-orange-300 bg-orange-50' :
      job.status === 'paused' ? 'border-purple-300 bg-purple-50' :
      'border-blue-300 bg-blue-50'
    }`}>
      {/* Header */}
      <div className="px-6 py-4 flex justify-between items-center border-b border-opacity-20 border-gray-400">
        <div className="flex items-center gap-3">
          {isActive && (
            <div className="relative">
              <div className="animate-spin h-6 w-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
              {isProcessing && (
                <div className="absolute inset-0 animate-ping h-6 w-6 border border-blue-400 rounded-full opacity-50"></div>
              )}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold">
              {job.status === 'completed' && <span className="text-green-700">Scan Complete</span>}
              {job.status === 'failed' && <span className="text-red-700">Scan Failed</span>}
              {job.status === 'cancelled' && <span className="text-gray-700">Scan Cancelled</span>}
              {job.status === 'cancelling' && <span className="text-orange-700">Stopping Scan...</span>}
              {job.status === 'paused' && <span className="text-purple-700">Scan Paused</span>}
              {job.status === 'running' && (
                <span className="text-blue-700">
                  Scanning {SOURCE_NAMES[job.sources[job.current_source_index]] || job.sources[job.current_source_index]}...
                </span>
              )}
              {job.status === 'queued' && <span className="text-yellow-700">Starting Scan...</span>}
            </h3>
            <p className="text-sm text-gray-600">Elapsed: {elapsed}</p>
          </div>
        </div>

        {/* Action buttons for active jobs */}
        {isActive && (
          <div className="flex items-center gap-2">
            {/* Pause button */}
            <button
              onClick={onPause}
              disabled={isPausing || isCancelling || job.status === 'cancelling'}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
            >
              {isPausing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Pausing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Pause
                </>
              )}
            </button>
            {/* Stop button */}
            <button
              onClick={onCancel}
              disabled={isCancelling || job.status === 'cancelling'}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
            >
              {isCancelling || job.status === 'cancelling' ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Stopping...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="5" y="5" width="10" height="10" rx="1" />
                  </svg>
                  Stop
                </>
              )}
            </button>
          </div>
        )}

        {/* Resume button for paused jobs */}
        {isPaused && (
          <button
            onClick={onResume}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 font-medium shadow-sm"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Resume Scan
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium">
            {progress?.sourcesCompleted || 0} / {progress?.sourcesTotal || job.sources.length} sources
          </span>
          <span className="font-bold text-lg">{progress?.percent || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className={`h-4 rounded-full transition-all duration-700 ${
              job.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-green-600' :
              job.status === 'failed' ? 'bg-gradient-to-r from-red-400 to-red-600' :
              job.status === 'cancelled' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
              'bg-gradient-to-r from-blue-400 to-blue-600'
            }`}
            style={{ width: `${progress?.percent || 0}%` }}
          />
        </div>
      </div>

      {/* Current Progress Info */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Source:</span>
            <span>{SOURCE_NAMES[progress?.currentSource || ''] || progress?.currentSource || '-'}</span>
            <span className="text-gray-400">({job.current_source_index + 1}/{job.sources.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Items Found:</span>
            <span>{job.items_found.toLocaleString()}</span>
          </div>
        </div>
        {/* Search terms display */}
        {job.search_terms && job.search_terms.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 border-opacity-50">
            <span className="font-semibold text-sm text-gray-700">Search terms: </span>
            <span className="text-sm text-gray-600">
              {job.search_terms.slice(0, 5).join(', ')}
              {job.search_terms.length > 5 && ` +${job.search_terms.length - 5} more`}
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 divide-x divide-gray-200 bg-white bg-opacity-60">
        <div className="p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{job.items_found.toLocaleString()}</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Found</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{job.items_added.toLocaleString()}</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Added</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{job.items_skipped.toLocaleString()}</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Skipped</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-3xl font-bold text-gray-500">~{estimatedRemaining.toLocaleString()}</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Remaining</div>
        </div>
      </div>

      {/* Last Activity */}
      {isActive && (
        <div className="px-6 py-3 bg-gray-100 bg-opacity-50 text-sm text-gray-600 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
          Last activity: {timeSinceActivity}
        </div>
      )}

      {/* Error Message */}
      {job.error_message && (
        <div className="px-6 py-4 bg-red-100 border-t border-red-200 text-red-800">
          <strong>Error:</strong> {job.error_message}
        </div>
      )}
    </div>
  );
}

// Job History Table Component
function JobHistoryTable({
  jobs,
  onResume,
}: {
  jobs: ScannerJob[];
  onResume: (jobId: string) => void;
}) {
  const historyJobs = jobs.filter(j => !['queued', 'running', 'cancelling'].includes(j.status));

  if (historyJobs.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Scan History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Sources</th>
              <th className="px-4 py-3 text-right font-semibold">Found</th>
              <th className="px-4 py-3 text-right font-semibold">Added</th>
              <th className="px-4 py-3 text-right font-semibold">Duration</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {historyJobs.map(job => {
              const badge = STATUS_BADGES[job.status] || STATUS_BADGES.cancelled;
              return (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                      <span>{badge.icon}</span>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {job.sources.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {SOURCE_NAMES[s] || s}
                        </span>
                      ))}
                      {job.sources.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                          +{job.sources.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{job.items_found.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">{job.items_added.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{formatDuration(job.started_at, job.completed_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(job.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {(job.status === 'paused' || job.status === 'failed') && (
                      <button
                        onClick={() => onResume(job.id)}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        Resume
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main Scanner Page
export default function ScannerPage() {
  // Form state
  const [selectedSources, setSelectedSources] = useState<string[]>(['pubmed', 'clinicaltrials', 'pmc']);
  const [scanDepth, setScanDepth] = useState('1year');
  const [useCustomKeywords, setUseCustomKeywords] = useState(false);
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [showKeywordsPanel, setShowKeywordsPanel] = useState(false);

  // Scanner job hook
  const {
    job,
    jobs,
    progress,
    isLoading,
    isProcessing,
    isCancelling,
    isPausing,
    error,
    lastActivity,
    createJob,
    cancelJob,
    pauseJob,
    resumeJob,
    clearError,
  } = useScannerJob();

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Recent research items
  const [recentItems, setRecentItems] = useState<RecentResearchItem[]>([]);
  const supabase = createClient();

  // Creating state
  const [isCreating, setIsCreating] = useState(false);

  // Fetch recent items and subscribe to updates
  useEffect(() => {
    const fetchRecent = async () => {
      const { data } = await supabase
        .from('kb_research_queue')
        .select('id, title, source_site, relevance_score, discovered_at')
        .order('discovered_at', { ascending: false })
        .limit(10);

      if (data) setRecentItems(data);
    };

    fetchRecent();

    const channel = supabase
      .channel('scanner_queue_updates')
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

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      setToast({ message: error, type: 'error' });
    }
  }, [error]);

  // Handle adding custom keyword
  const handleAddKeyword = () => {
    const keyword = newKeyword.trim();
    if (keyword && !customKeywords.includes(keyword)) {
      setCustomKeywords(prev => [...prev, keyword]);
      setNewKeyword('');
    }
  };

  // Handle removing custom keyword
  const handleRemoveKeyword = (keyword: string) => {
    setCustomKeywords(prev => prev.filter(k => k !== keyword));
  };

  // Get active search terms
  const activeSearchTerms = useCustomKeywords && customKeywords.length > 0
    ? customKeywords
    : DEFAULT_SEARCH_TERMS;

  // Handle start scan
  const handleStartScan = async () => {
    if (selectedSources.length === 0) {
      setToast({ message: 'Please select at least one source', type: 'error' });
      return;
    }

    setIsCreating(true);
    const dateRange = getDateRange(scanDepth);

    const newJob = await createJob({
      sources: selectedSources,
      dateRangeStart: dateRange.start,
      dateRangeEnd: dateRange.end,
      searchTerms: useCustomKeywords && customKeywords.length > 0 ? customKeywords : undefined,
    });

    setIsCreating(false);

    if (newJob) {
      setToast({ message: 'Scan started successfully!', type: 'success' });
    }
  };

  // Handle cancel
  const handleCancel = async () => {
    const success = await cancelJob();
    if (success) {
      setToast({ message: 'Scan is being stopped...', type: 'info' });
    }
  };

  // Handle pause
  const handlePause = async () => {
    const success = await pauseJob();
    if (success) {
      setToast({ message: 'Scan paused. You can resume it later.', type: 'info' });
    }
  };

  // Handle resume
  const handleResume = async (jobId: string) => {
    const success = await resumeJob(jobId);
    if (success) {
      setToast({ message: 'Scan resumed!', type: 'success' });
    }
  };

  const isScanning = job && ['queued', 'running'].includes(job.status);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => {
            setToast(null);
            clearError();
          }}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Scanner</h1>
          <p className="text-gray-600 mt-1">Discover new CBD research from authoritative sources</p>
        </div>
        <Link
          href="/admin/research/queue"
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View Queue
        </Link>
      </div>

      {/* Active Job Panel */}
      {job && ['queued', 'running', 'cancelling', 'paused', 'completed', 'failed'].includes(job.status) && (
        <ActiveJobPanel
          job={job}
          progress={progress}
          isProcessing={isProcessing}
          isCancelling={isCancelling}
          isPausing={isPausing}
          lastActivity={lastActivity}
          onCancel={handleCancel}
          onPause={handlePause}
          onResume={() => handleResume(job.id)}
        />
      )}

      {/* Recently Discovered Feed */}
      {(isScanning || recentItems.length > 0) && (
        <div className="mb-6 bg-white rounded-xl shadow border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center gap-3">
            {isScanning && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900">Recently Discovered Research</h3>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
            {recentItems.map(item => (
              <div key={item.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate" title={item.title}>{item.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {item.source_site}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      {item.relevance_score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {recentItems.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent items. Start a scan to discover research.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Creation Panel - Only show when not scanning */}
      {!isScanning && (
        <div className="space-y-6">
          {/* Source Selection */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Research Sources</h3>
              <p className="text-sm text-gray-500 mt-1">Select which databases to scan for CBD research</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SOURCES.map(source => (
                  <label
                    key={source.id}
                    className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      !source.available
                        ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                        : selectedSources.includes(source.id)
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source.id)}
                      onChange={(e) => {
                        if (!source.available) return;
                        setSelectedSources(prev =>
                          e.target.checked
                            ? [...prev, source.id]
                            : prev.filter(s => s !== source.id)
                        );
                      }}
                      disabled={!source.available}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      selectedSources.includes(source.id) && source.available
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedSources.includes(source.id) && source.available && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{source.icon}</span>
                        <span className="font-semibold text-gray-900">{source.name}</span>
                        {!source.available && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{source.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Quick Select */}
              <div className="mt-6 pt-6 border-t flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedSources(SOURCES.filter(s => s.available).map(s => s.id))}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Select All Available
                </button>
                <button
                  onClick={() => setSelectedSources(['pubmed', 'clinicaltrials', 'pmc'])}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Core Medical Only
                </button>
                <button
                  onClick={() => setSelectedSources([])}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Scan Depth */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Scan Depth</h3>
              <p className="text-sm text-gray-500 mt-1">How far back to search for research papers</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {SCAN_DEPTHS.map(depth => (
                  <button
                    key={depth.value}
                    onClick={() => setScanDepth(depth.value)}
                    className={`px-4 py-3 rounded-xl border-2 text-center font-medium transition-all ${
                      scanDepth === depth.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {depth.label}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Automatically skips papers already in your database
              </p>
            </div>
          </div>

          {/* Search Keywords Section */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <button
              onClick={() => setShowKeywordsPanel(!showKeywordsPanel)}
              className="w-full px-6 py-4 border-b bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 text-left">Search Keywords</h3>
                <p className="text-sm text-gray-500 mt-1 text-left">
                  {useCustomKeywords && customKeywords.length > 0
                    ? `Using ${customKeywords.length} custom keyword${customKeywords.length > 1 ? 's' : ''}`
                    : `Using ${DEFAULT_SEARCH_TERMS.length} default CBD-related terms`}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${showKeywordsPanel ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showKeywordsPanel && (
              <div className="p-6">
                {/* Active Keywords Display */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {useCustomKeywords ? 'Custom Keywords' : 'Default Keywords'}
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm text-gray-600">Use custom keywords</span>
                      <button
                        type="button"
                        onClick={() => setUseCustomKeywords(!useCustomKeywords)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          useCustomKeywords ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            useCustomKeywords ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(useCustomKeywords ? customKeywords : DEFAULT_SEARCH_TERMS).map((term) => (
                      <span
                        key={term}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                          useCustomKeywords
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        {term}
                        {useCustomKeywords && (
                          <button
                            onClick={() => handleRemoveKeyword(term)}
                            className="ml-1 hover:text-blue-600"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </span>
                    ))}
                    {useCustomKeywords && customKeywords.length === 0 && (
                      <span className="text-gray-500 text-sm italic">No custom keywords added yet. Add some below or disable to use defaults.</span>
                    )}
                  </div>
                </div>

                {/* Add Custom Keyword Input */}
                {useCustomKeywords && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Add Custom Keyword</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                        placeholder="e.g., CBD anxiety, cannabidiol treatment"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={handleAddKeyword}
                        disabled={!newKeyword.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                      >
                        Add
                      </button>
                    </div>

                    {/* Quick Add Suggestions */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Quick add suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {EXTENDED_SEARCH_TERMS.filter(t => !customKeywords.includes(t)).slice(0, 5).map((term) => (
                          <button
                            key={term}
                            onClick={() => setCustomKeywords(prev => [...prev, term])}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                          >
                            + {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Info about keywords */}
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>
                      <strong>Note:</strong> All results are validated to ensure they contain CBD/cannabis-related content,
                      regardless of search terms. Non-relevant studies are automatically filtered out.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Start Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleStartScan}
              disabled={isCreating || selectedSources.length === 0}
              className={`px-10 py-4 rounded-xl text-lg font-bold transition-all flex items-center gap-3 ${
                isCreating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : selectedSources.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></div>
                  Creating Job...
                </>
              ) : selectedSources.length === 0 ? (
                'Select Sources to Scan'
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="mt-8">
        <JobHistoryTable jobs={jobs} onResume={handleResume} />
      </div>

      {/* Info Box */}
      <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
        <div className="flex gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong>How it works:</strong> The scanner fetches research papers from public APIs in small chunks,
            automatically checking for duplicates and scoring relevance. Results are added to your review queue
            where you can approve or reject them. Scans can be stopped and resumed at any time - progress is saved automatically.
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
