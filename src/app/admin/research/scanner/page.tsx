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

const STATUS_BADGES: Record<string, { color: string; icon: string; label: string }> = {
  completed: { color: 'bg-green-100 text-green-800', icon: '🟢', label: 'Completed' },
  failed: { color: 'bg-red-100 text-red-800', icon: '🔴', label: 'Failed' },
  running: { color: 'bg-blue-100 text-blue-800', icon: '🟡', label: 'Running' },
  queued: { color: 'bg-yellow-100 text-yellow-800', icon: '⚪', label: 'Queued' },
  cancelled: { color: 'bg-gray-100 text-gray-800', icon: '⬛', label: 'Cancelled' },
  cancelling: { color: 'bg-orange-100 text-orange-800', icon: '🟠', label: 'Stopping' },
  paused: { color: 'bg-purple-100 text-purple-800', icon: '🟣', label: 'Paused' },
};

// Config item from database
interface ConfigItem {
  id: string;
  category: string;
  term_key: string;
  display_name: string;
  synonyms: string[];
  enabled: boolean;
}

interface RecentResearchItem {
  id: string;
  title: string;
  source: string;
  relevance_score: number;
  confirmation_score: number | null;
  matched_cannabinoids: string[] | null;
  matched_conditions: string[] | null;
  study_type: string | null;
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

// Checkbox List Component with Select All
function CheckboxList({
  title,
  description,
  items,
  selectedIds,
  onSelectionChange,
  icon,
}: {
  title: string;
  description: string;
  items: ConfigItem[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  icon: string;
}) {
  const allSelected = items.length > 0 && items.every(item => selectedIds.has(item.term_key));
  const noneSelected = items.every(item => !selectedIds.has(item.term_key));

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map(i => i.term_key)));
    }
  };

  const handleToggle = (termKey: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(termKey)) {
      newSet.delete(termKey);
    } else {
      newSet.add(termKey);
    }
    onSelectionChange(newSet);
  };

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>{icon}</span>
            {title}
            <span className="text-sm font-normal text-gray-500">
              ({selectedIds.size}/{items.length} selected)
            </span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              allSelected
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {items.map(item => (
            <label
              key={item.term_key}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                selectedIds.has(item.term_key)
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(item.term_key)}
                onChange={() => handleToggle(item.term_key)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className={`text-sm ${selectedIds.has(item.term_key) ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                {item.display_name}
              </span>
            </label>
          ))}
        </div>
      </div>
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

        {isActive && (
          <div className="flex items-center gap-2">
            <button
              onClick={onPause}
              disabled={isPausing || isCancelling || job.status === 'cancelling'}
              className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
            >
              {isPausing ? 'Pausing...' : 'Pause'}
            </button>
            <button
              onClick={onCancel}
              disabled={isCancelling || job.status === 'cancelling'}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
            >
              {isCancelling || job.status === 'cancelling' ? 'Stopping...' : 'Stop'}
            </button>
          </div>
        )}

        {isPaused && (
          <button
            onClick={onResume}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 font-medium shadow-sm"
          >
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
          <div className="text-3xl font-bold text-red-500">{job.items_rejected.toLocaleString()}</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Rejected</div>
        </div>
      </div>

      {isActive && (
        <div className="px-6 py-3 bg-gray-100 bg-opacity-50 text-sm text-gray-600 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
          Last activity: {timeSinceActivity}
        </div>
      )}

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
  const supabase = createClient();

  // Config state (loaded from database)
  const [cannabinoids, setCannabinoids] = useState<ConfigItem[]>([]);
  const [conditions, setConditions] = useState<ConfigItem[]>([]);
  const [configLoading, setConfigLoading] = useState(true);

  // Search mode: 'broad' or 'targeted'
  const [searchMode, setSearchMode] = useState<'broad' | 'targeted'>('broad');

  // Selection state
  const [selectedCannabinoids, setSelectedCannabinoids] = useState<Set<string>>(new Set(['cannabidiol']));
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set());
  const [selectedSources, setSelectedSources] = useState<string[]>(['pubmed', 'clinicaltrials', 'pmc']);
  const [scanDepth, setScanDepth] = useState('1year');

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

  // Creating state
  const [isCreating, setIsCreating] = useState(false);

  // Load config from database
  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('research_scanner_config')
        .select('*')
        .eq('enabled', true)
        .order('sort_order');

      if (error) {
        console.error('Error loading config:', error);
        setToast({ message: 'Failed to load scanner configuration', type: 'error' });
      } else if (data) {
        setCannabinoids(data.filter(d => d.category === 'cannabinoid'));
        setConditions(data.filter(d => d.category === 'condition'));
      }
      setConfigLoading(false);
    };

    fetchConfig();
  }, [supabase]);

  // Fetch recent items and subscribe to updates
  useEffect(() => {
    const fetchRecent = async () => {
      const { data } = await supabase
        .from('kb_research_queue')
        .select('id, title, source, relevance_score, confirmation_score, matched_cannabinoids, matched_conditions, study_type, discovered_at')
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

  // Generate search terms from selected cannabinoids and conditions
  const generateSearchTerms = (): string[] => {
    const terms: string[] = [];
    const selectedCannabinoidItems = cannabinoids.filter(c => selectedCannabinoids.has(c.term_key));
    const selectedConditionItems = conditions.filter(c => selectedConditions.has(c.term_key));

    if (searchMode === 'broad') {
      // Broad mode: cannabinoid terms only (finds ALL cannabinoid research)
      // Conditions are auto-detected from title/abstract during validation
      for (const cannabinoid of selectedCannabinoidItems) {
        // Add primary synonym
        if (cannabinoid.synonyms[0]) {
          terms.push(cannabinoid.synonyms[0]);
        }
        // Add clinical/therapeutic variants
        const primaryTerm = cannabinoid.synonyms[0] || cannabinoid.term_key;
        terms.push(`${primaryTerm} clinical trial`);
        terms.push(`${primaryTerm} therapeutic`);
      }
    } else {
      // Targeted mode: cannabinoid × condition combinations
      if (selectedConditionItems.length > 0) {
        for (const cannabinoid of selectedCannabinoidItems) {
          for (const condition of selectedConditionItems) {
            const cannabinoidTerm = cannabinoid.synonyms[0] || cannabinoid.term_key;
            const conditionTerm = condition.synonyms[0] || condition.term_key;
            terms.push(`${cannabinoidTerm} ${conditionTerm}`);
          }
        }
      } else {
        // No conditions selected in targeted mode - fall back to cannabinoid terms
        for (const cannabinoid of selectedCannabinoidItems) {
          for (const synonym of cannabinoid.synonyms.slice(0, 2)) {
            terms.push(synonym);
          }
        }
      }
    }

    // Remove duplicates
    return [...new Set(terms)];
  };

  // Handle start scan
  const handleStartScan = async () => {
    if (selectedSources.length === 0) {
      setToast({ message: 'Please select at least one source', type: 'error' });
      return;
    }

    if (selectedCannabinoids.size === 0) {
      setToast({ message: 'Please select at least one cannabinoid', type: 'error' });
      return;
    }

    setIsCreating(true);
    const dateRange = getDateRange(scanDepth);
    const searchTerms = generateSearchTerms();

    const newJob = await createJob({
      sources: selectedSources,
      dateRangeStart: dateRange.start,
      dateRangeEnd: dateRange.end,
      searchTerms: searchTerms,
    });

    setIsCreating(false);

    if (newJob) {
      setToast({ message: `Scan started with ${searchTerms.length} search terms!`, type: 'success' });
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
  const searchTermCount = generateSearchTerms().length;

  if (isLoading || configLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Research Scanner V2</h1>
          <p className="text-gray-600 mt-1">Discover new CBD research with configurable search terms</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/research/scanner/config"
            className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Config
          </Link>
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

      {/* Recently Discovered Feed with V2 metadata */}
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
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {recentItems.map(item => (
              <div key={item.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate" title={item.title}>{item.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.matched_cannabinoids?.map(c => (
                        <span key={c} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          {c}
                        </span>
                      ))}
                      {item.matched_conditions?.map(c => (
                        <span key={c} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {c}
                        </span>
                      ))}
                      {item.study_type && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          {item.study_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {item.source}
                    </span>
                    {item.confirmation_score !== null && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.confirmation_score >= 65 ? 'bg-green-100 text-green-700' :
                        item.confirmation_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.confirmation_score}
                      </span>
                    )}
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
          {/* Search Mode Toggle */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>🔍</span>
                Search Mode
              </h3>
              <p className="text-sm text-gray-500 mt-1">Choose how to discover research</p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSearchMode('broad')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    searchMode === 'broad'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🌐</span>
                    <span className={`font-bold text-lg ${searchMode === 'broad' ? 'text-green-700' : 'text-gray-900'}`}>
                      Broad Search
                    </span>
                    {searchMode === 'broad' && (
                      <span className="px-2 py-0.5 bg-green-200 text-green-800 text-xs rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${searchMode === 'broad' ? 'text-green-600' : 'text-gray-500'}`}>
                    Find ALL cannabinoid research. Conditions are auto-detected from results.
                    Best for comprehensive research collection.
                  </p>
                </button>
                <button
                  onClick={() => setSearchMode('targeted')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    searchMode === 'targeted'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <span className={`font-bold text-lg ${searchMode === 'targeted' ? 'text-blue-700' : 'text-gray-900'}`}>
                      Targeted Search
                    </span>
                    {searchMode === 'targeted' && (
                      <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${searchMode === 'targeted' ? 'text-blue-600' : 'text-gray-500'}`}>
                    Search for specific cannabinoid + condition combinations.
                    Best for researching known conditions.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Cannabinoids Selection */}
          <CheckboxList
            title="Cannabinoids"
            description="Select which cannabinoids to search for"
            items={cannabinoids}
            selectedIds={selectedCannabinoids}
            onSelectionChange={setSelectedCannabinoids}
            icon="🌿"
          />

          {/* Conditions Selection - Greyed out in Broad mode */}
          <div className={`transition-opacity ${searchMode === 'broad' ? 'opacity-50' : ''}`}>
            <CheckboxList
              title="Health Conditions"
              description={searchMode === 'broad'
                ? "Disabled in Broad mode - conditions are auto-detected from results"
                : "Select specific conditions to search for with each cannabinoid"}
              items={conditions}
              selectedIds={searchMode === 'broad' ? new Set() : selectedConditions}
              onSelectionChange={searchMode === 'broad' ? () => {} : setSelectedConditions}
              icon="🏥"
            />
            {searchMode === 'broad' && (
              <div className="mt-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <strong>Broad mode:</strong> Conditions will be automatically detected and tagged from study titles and abstracts.
                This helps discover research about conditions you may not have considered.
              </div>
            )}
          </div>

          {/* Source Selection */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span>📚</span>
                  Research Sources
                  <span className="text-sm font-normal text-gray-500">
                    ({selectedSources.length}/{SOURCES.length} selected)
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">Select which databases to scan</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSources(SOURCES.filter(s => s.available).map(s => s.id))}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedSources([])}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {SOURCES.map(source => (
                  <label
                    key={source.id}
                    className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSources.includes(source.id)
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    } ${!source.available ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <span>{source.icon}</span>
                      <span className={`text-sm ${selectedSources.includes(source.id) ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
                        {source.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Scan Depth */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>📅</span>
                Scan Depth
              </h3>
              <p className="text-sm text-gray-500 mt-1">How far back to search for research papers</p>
            </div>
            <div className="p-4">
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
            </div>
          </div>

          {/* Search Summary & Start Button */}
          <div className={`rounded-xl border p-6 ${
            searchMode === 'broad'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {searchMode === 'broad' ? '🌐' : '🎯'}
                  {searchMode === 'broad' ? 'Broad Search' : 'Targeted Search'} Configuration
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {searchMode === 'broad'
                    ? `${searchTermCount} search queries to find all cannabinoid research`
                    : `${searchTermCount} search term${searchTermCount !== 1 ? 's' : ''} from cannabinoid × condition combinations`}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${searchMode === 'broad' ? 'text-green-600' : 'text-blue-600'}`}>
                  {searchTermCount}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Queries</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                {selectedCannabinoids.size} cannabinoid{selectedCannabinoids.size !== 1 ? 's' : ''}
              </span>
              {searchMode === 'broad' ? (
                <>
                  <span className="text-gray-400">→</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                    conditions auto-detected
                  </span>
                </>
              ) : (
                <>
                  <span className="text-gray-400">×</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {selectedConditions.size || 'all'} condition{selectedConditions.size !== 1 ? 's' : ''}
                  </span>
                </>
              )}
              <span className="text-gray-400">→</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                {selectedSources.length} source{selectedSources.length !== 1 ? 's' : ''}
              </span>
            </div>

            <button
              onClick={handleStartScan}
              disabled={isCreating || selectedSources.length === 0 || selectedCannabinoids.size === 0}
              className={`w-full px-6 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-3 ${
                isCreating
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : selectedSources.length === 0 || selectedCannabinoids.size === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : searchMode === 'broad'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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
              ) : selectedCannabinoids.size === 0 ? (
                'Select Cannabinoids to Scan'
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Start Scan ({selectedSources.length} source{selectedSources.length > 1 ? 's' : ''}, {searchTermCount} queries)
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
            <strong>Scanner V2 Search Modes:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li><strong>Broad Search (recommended):</strong> Finds ALL cannabinoid research regardless of condition. Conditions are auto-detected and tagged. Best for comprehensive collection and discovering new research areas.</li>
              <li><strong>Targeted Search:</strong> Searches for specific cannabinoid + condition pairs. Best when researching known conditions with focused results.</li>
            </ul>
            <strong className="block mt-3">Features:</strong>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Multi-stage validation with confirmation scoring</li>
              <li>Automatic blacklist filtering for false positives</li>
              <li>Study type detection (RCT, clinical trial, review, etc.)</li>
              <li>Auto-tagging of cannabinoids and conditions found</li>
            </ul>
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
