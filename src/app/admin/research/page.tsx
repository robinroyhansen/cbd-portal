'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface ScanJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_source: string | null;
  sources_completed: string[];
  sources_total: string[];
  items_found: number;
  items_added: number;
  items_skipped: number;
  items_rejected: number;
  scan_depth: string;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface RecalculateResults {
  totalStudies: number;
  scoreChanges: {
    increased: number;
    decreased: number;
    unchanged: number;
  };
  tierChanges: {
    upgraded: number;
    downgraded: number;
    unchanged: number;
  };
  tierDistribution: {
    before: Record<string, number>;
    after: Record<string, number>;
  };
  averageScore: {
    before: number;
    after: number;
  };
  sampleUpdates: Array<{
    id: string;
    title: string;
    oldScore: number;
    newScore: number;
    scoreDiff: number;
    oldTier: string;
    newTier: string;
  }>;
  updatedCount: number;
  dryRun: boolean;
}

interface RecentResearchItem {
  id: string;
  title: string;
  source_site: string;
  relevance_score: number;
  discovered_at: string;
}

const SOURCE_NAMES: Record<string, string> = {
  pubmed: 'PubMed',
  pmc: 'PMC',
  clinicaltrials: 'ClinicalTrials.gov',
  europepmc: 'Europe PMC',
  biorxiv: 'bioRxiv/medRxiv',
  semanticscholar: 'Semantic Scholar',
  crossref: 'CrossRef',
  openalex: 'OpenAlex',
  cochrane: 'Cochrane Library',
  who_ictrp: 'WHO ICTRP',
  doaj: 'DOAJ',
  scholar: 'Google Scholar'
};

// Format elapsed time
function formatElapsedTime(startedAt: string | null): string {
  if (!startedAt) return '0s';
  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - start) / 1000);

  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function AdminResearchPage() {
  const [activeJob, setActiveJob] = useState<ScanJob | null>(null);
  const [recentItems, setRecentItems] = useState<RecentResearchItem[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>(['pubmed', 'clinicaltrials', 'pmc']);
  const [customKeywords, setCustomKeywords] = useState<string>(`cannabidiol, CBD, cannabis, medical cannabis, medicinal cannabis, medical marijuana, cannabinoids, THC, tetrahydrocannabinol, CBG, cannabigerol, CBN, cannabinol, CBC, cannabichromene, hemp oil, cannabis therapy, cannabis treatment, cannabinoid therapy, endocannabinoid system, cannabis pharmacology, phytocannabinoids, cannabis medicine, therapeutic cannabis, pharmaceutical cannabis, cannabis clinical trial, cannabidiol oil, CBD oil, cannabis extract, cannabis research, marijuana medicine, cannabis therapeutics, cannabinoid receptors, CB1 receptor, CB2 receptor, cannabis safety, cannabis efficacy, cannabis dosing, cannabis pharmacokinetics, hemp-derived CBD, full spectrum CBD, broad spectrum CBD, CBD isolate, cannabis terpenes, entourage effect, cannabis pain management, cannabis anxiety, cannabis epilepsy, cannabis inflammation, cannabis neuroprotection, cannabis oncology, cannabis addiction, cannabis withdrawal, cannabis tolerance`);
  const [scanDepth, setScanDepth] = useState<string>('6months');
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('0s');

  // Recalculate scores state
  const [recalculating, setRecalculating] = useState(false);
  const [recalculateResults, setRecalculateResults] = useState<RecalculateResults | null>(null);
  const [recalculateError, setRecalculateError] = useState<string | null>(null);

  const supabase = createClient();

  // Check for active scan on mount and poll for updates
  const checkActiveScan = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/scan/active');
      const data = await response.json();

      if (data.active && data.job) {
        setActiveJob(data.job);
        setStarting(false); // Reset starting state if we have an active job
      } else {
        setActiveJob(null);
        setStarting(false); // Reset starting state if no active job
      }
    } catch (err) {
      console.error('Failed to check active scan:', err);
      setActiveJob(null);
      setStarting(false);
    }
  }, []);

  // Fetch job status
  const fetchJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/scan/${jobId}`);
      const data = await response.json();

      if (response.status === 404 || data.error === 'Job not found') {
        // Job was deleted from database - reset state
        console.log('Job not found, resetting state');
        setActiveJob(null);
        setStarting(false);
        return;
      }

      if (data.job) {
        setActiveJob(data.job);

        // If job is done, clear after a delay
        if (['completed', 'failed', 'cancelled'].includes(data.job.status)) {
          setStarting(false);
          setTimeout(() => {
            checkActiveScan();
          }, 5000);
        }
      } else {
        // No job in response - reset
        setActiveJob(null);
        setStarting(false);
      }
    } catch (err) {
      console.error('Failed to fetch job status:', err);
      // On error, check for active scans to reset state
      checkActiveScan();
    }
  }, [checkActiveScan]);

  // Initial load and polling
  useEffect(() => {
    checkActiveScan();

    // Poll for updates every 2 seconds when there's an active job
    // Also periodically re-check for active scans to catch deleted jobs
    const interval = setInterval(() => {
      if (activeJob && ['pending', 'running'].includes(activeJob.status)) {
        fetchJobStatus(activeJob.id);
      } else if (starting) {
        // If we're in starting state but no active job, check again
        checkActiveScan();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJob?.id, activeJob?.status, starting, checkActiveScan, fetchJobStatus]);

  // Update elapsed time every second when scanning
  useEffect(() => {
    if (!activeJob || !['pending', 'running'].includes(activeJob.status)) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(formatElapsedTime(activeJob.started_at));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeJob?.id, activeJob?.status, activeJob?.started_at]);

  // Subscribe to new research items in real-time
  useEffect(() => {
    // Fetch recent items on mount
    const fetchRecentItems = async () => {
      const { data } = await supabase
        .from('kb_research_queue')
        .select('id, title, source_site, relevance_score, discovered_at')
        .order('discovered_at', { ascending: false })
        .limit(10);

      if (data) {
        setRecentItems(data);
      }
    };

    fetchRecentItems();

    // Subscribe to new items
    const channel = supabase
      .channel('research_queue_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'kb_research_queue'
        },
        (payload) => {
          const newItem = payload.new as RecentResearchItem;
          setRecentItems(prev => [newItem, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Start a new scan
  const startScan = async () => {
    if (selectedSources.length === 0) return;

    setStarting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/scan/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedSources,
          scanDepth,
          customKeywords: customKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        })
      });

      const data = await response.json();

      if (data.error) {
        if (data.jobId) {
          // There's already an active scan
          await fetchJobStatus(data.jobId);
        } else {
          setError(data.message || data.error);
        }
      } else if (data.jobId) {
        // Poll for the new job
        await fetchJobStatus(data.jobId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scan');
    } finally {
      setStarting(false);
    }
  };

  // Stop/Cancel active scan
  const stopScan = async () => {
    if (!activeJob) return;

    setStopping(true);
    try {
      const response = await fetch(`/api/admin/scan/${activeJob.id}`, { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        // Poll to get updated status
        await fetchJobStatus(activeJob.id);
      }
    } catch (err) {
      console.error('Failed to stop scan:', err);
    } finally {
      setStopping(false);
    }
  };

  // Force reset UI state (for stuck states)
  const forceReset = () => {
    setActiveJob(null);
    setStarting(false);
    setStopping(false);
    setError(null);
    setElapsedTime('0s');
    checkActiveScan();
  };

  // Recalculate quality scores
  const recalculateScores = async (dryRun: boolean) => {
    setRecalculating(true);
    setRecalculateError(null);

    try {
      const response = await fetch('/api/admin/recalculate-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun })
      });

      const data = await response.json();

      if (data.error) {
        setRecalculateError(data.error);
      } else {
        setRecalculateResults(data);
      }
    } catch (err) {
      setRecalculateError(err instanceof Error ? err.message : 'Failed to recalculate scores');
    } finally {
      setRecalculating(false);
    }
  };

  const isScanning = activeJob && ['pending', 'running'].includes(activeJob.status);
  const progressPercent = activeJob && activeJob.sources_total.length > 0
    ? Math.round((activeJob.sources_completed.length / activeJob.sources_total.length) * 100)
    : 0;

  // Source definitions with availability
  const availableSources = [
    { id: 'pubmed', name: 'PubMed', desc: '33M+ biomedical literature', available: true },
    { id: 'pmc', name: 'PMC', desc: 'Full-text research articles', available: true },
    { id: 'clinicaltrials', name: 'ClinicalTrials.gov', desc: 'Clinical trial database', available: true },
    { id: 'europepmc', name: 'Europe PMC', desc: 'European biomedical literature', available: true },
    { id: 'biorxiv', name: 'bioRxiv/medRxiv', desc: 'Preprints (not peer-reviewed)', available: true },
    { id: 'semanticscholar', name: 'Semantic Scholar', desc: 'AI-powered citation network', available: true },
    { id: 'crossref', name: 'CrossRef', desc: 'DOI metadata & citations', available: true },
    { id: 'openalex', name: 'OpenAlex', desc: 'Open research database', available: true }
  ];


  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Scanner</h1>
          <p className="text-gray-600 mt-2">Discover new research from authoritative sources</p>
        </div>
        <Link
          href="/admin/research/queue"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          View Research Queue
        </Link>
      </div>

      {/* Active Scan Progress */}
      {activeJob && (
        <div className={`mb-6 p-6 rounded-lg border-2 ${
          activeJob.status === 'completed' ? 'bg-green-50 border-green-300' :
          activeJob.status === 'failed' ? 'bg-red-50 border-red-300' :
          activeJob.status === 'cancelled' ? 'bg-gray-50 border-gray-300' :
          'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {isScanning && (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                )}
                {activeJob.status === 'completed' && <span className="text-green-600">Scan Complete</span>}
                {activeJob.status === 'failed' && <span className="text-red-600">Scan Failed</span>}
                {activeJob.status === 'cancelled' && <span className="text-gray-600">Scan Cancelled</span>}
                {activeJob.status === 'running' && (
                  <span className="text-blue-600">
                    Scanning {activeJob.current_source ? SOURCE_NAMES[activeJob.current_source] || activeJob.current_source : ''}...
                  </span>
                )}
                {activeJob.status === 'pending' && <span className="text-yellow-600">Starting Scan...</span>}
              </h3>

              {/* Progress details */}
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Source:</strong> {activeJob.sources_completed.length + 1} of {activeJob.sources_total.length}
                  {activeJob.current_source && ` (${SOURCE_NAMES[activeJob.current_source] || activeJob.current_source})`}
                </p>
                <p>
                  <strong>Elapsed:</strong> {elapsedTime}
                </p>
              </div>
            </div>

            {/* Stop Button */}
            {isScanning && (
              <button
                onClick={stopScan}
                disabled={stopping}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {stopping ? (
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
              <span>Progress: {activeJob.sources_completed.length} / {activeJob.sources_total.length} sources</span>
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
              ></div>
            </div>
          </div>

          {/* Source Status Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {activeJob.sources_total.map((source, index) => {
              const isCompleted = activeJob.sources_completed.includes(source);
              const isCurrent = activeJob.current_source === source;
              const sourceIndex = activeJob.sources_total.indexOf(source) + 1;

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
                  {isCurrent && (
                    <span className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full"></span>
                  )}
                  {sourceIndex}. {SOURCE_NAMES[source] || source}
                </span>
              );
            })}
          </div>

          {/* Stats */}
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
            {isScanning && <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>}
            Recently Discovered Research
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentItems.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm animate-fadeIn"
              >
                <div className="flex-1 truncate pr-4">
                  <span className="font-medium">{item.title}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{item.source_site}</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">Score: {item.relevance_score}</span>
                </div>
              </div>
            ))}
            {recentItems.length === 0 && (
              <p className="text-gray-500 text-sm">No recent research items. Start a scan to discover new papers.</p>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Stuck State Warning */}
      {(starting && !activeJob) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 flex justify-between items-center">
          <span>UI appears stuck. If this persists, try resetting.</span>
          <button
            onClick={forceReset}
            className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-sm font-medium"
          >
            Reset UI
          </button>
        </div>
      )}

      {/* Scan Configuration */}
      <div className="space-y-6">
        {/* Source Selection */}
        <div className="p-6 bg-white rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Available Sources */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 text-sm uppercase tracking-wide">Select Sources</h4>
              {availableSources.map((source) => (
                <label key={source.id} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSources([...selectedSources, source.id]);
                      } else {
                        setSelectedSources(selectedSources.filter(s => s !== source.id));
                      }
                    }}
                    disabled={isScanning}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{source.name}</span>
                    <p className="text-xs text-gray-500">{source.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Scan Depth */}
            <div>
              <h4 className="font-medium text-gray-800 text-sm uppercase tracking-wide mb-2">Scan Depth</h4>
              <select
                value={scanDepth}
                onChange={(e) => setScanDepth(e.target.value)}
                disabled={isScanning}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <optgroup label="Regular Scans (find new studies)">
                  <option value="6months">Last 6 months (Recommended)</option>
                  <option value="1year">Last 12 months</option>
                  <option value="quick">Last 30 days (Quick)</option>
                </optgroup>
                <optgroup label="One-Time Scans">
                  <option value="2years">Last 2 years</option>
                  <option value="5years">Last 5 years</option>
                  <option value="historical">Historical (All time, 15-20 years)</option>
                </optgroup>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {scanDepth === 'quick' && 'Fast scan for recent updates, ~1-2 min'}
                {scanDepth === '6months' && 'Recommended for regular scans, ~5-10 min'}
                {scanDepth === '1year' && 'Extended scan, ~10-20 min'}
                {scanDepth === '2years' && 'One-time deep scan, ~20-30 min'}
                {scanDepth === '5years' && 'One-time historical scan, ~30-45 min'}
                {scanDepth === 'historical' && '⚠️ One-time foundation scan (15-20 years). Run once to capture landmark studies. ~1-2 hours'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                ✓ Automatically skips studies already in database (URL + DOI + title match)
              </p>

              {/* Quick Source Presets */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <h4 className="font-medium text-gray-800 text-sm uppercase tracking-wide">Quick Select</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSources(['pubmed', 'pmc', 'clinicaltrials'])}
                    disabled={isScanning}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    Core Medical
                  </button>
                  <button
                    onClick={() => setSelectedSources(['pubmed', 'pmc', 'clinicaltrials', 'europepmc', 'biorxiv', 'semanticscholar', 'crossref', 'openalex'])}
                    disabled={isScanning}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                  >
                    All Available
                  </button>
                  <button
                    onClick={() => setSelectedSources([])}
                    disabled={isScanning}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Keywords (Collapsible) */}
        <details className="p-6 bg-white rounded-lg shadow border">
          <summary className="text-lg font-semibold text-gray-900 cursor-pointer">
            Advanced: Custom Keywords
          </summary>
          <div className="mt-4">
            <textarea
              value={customKeywords}
              onChange={(e) => setCustomKeywords(e.target.value)}
              disabled={isScanning}
              placeholder="Enter comma-separated keywords..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Pre-loaded with 50+ CBD/cannabis keywords. Separate terms with commas.
            </p>
          </div>
        </details>

        {/* Start Button */}
        <div className="flex justify-center">
          <button
            onClick={startScan}
            disabled={isScanning || starting || selectedSources.length === 0}
            className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all ${
              isScanning || starting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : selectedSources.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {starting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                Starting...
              </span>
            ) : isScanning ? (
              'Scan in Progress...'
            ) : selectedSources.length === 0 ? (
              'Select Sources to Scan'
            ) : (
              `Start Scan (${selectedSources.length} source${selectedSources.length > 1 ? 's' : ''})`
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <strong>How it works:</strong> The scanner queries public research APIs (PubMed, ClinicalTrials.gov, etc.)
          for cannabis/CBD related studies. Results are filtered for relevance and added to your review queue.
          You can stop the scan at any time - results found so far will be saved.
        </div>

        {/* Recalculate Quality Scores Section */}
        <div className="p-6 bg-white rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recalculate Quality Scores</h3>
          <p className="text-sm text-gray-600 mb-4">
            Re-analyze all studies with the improved quality scoring algorithm. This updates study type detection,
            methodology scoring, and sample size extraction.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => recalculateScores(true)}
              disabled={recalculating}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {recalculating && recalculateResults?.dryRun !== false ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Changes
                </>
              )}
            </button>
            <button
              onClick={() => recalculateScores(false)}
              disabled={recalculating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {recalculating && recalculateResults?.dryRun === false ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Recalculating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Apply Changes
                </>
              )}
            </button>
            {recalculateResults && (
              <button
                onClick={() => setRecalculateResults(null)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear Results
              </button>
            )}
          </div>

          {/* Error Display */}
          {recalculateError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              <strong>Error:</strong> {recalculateError}
            </div>
          )}

          {/* Results Display */}
          {recalculateResults && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div className={`p-3 rounded-lg ${recalculateResults.dryRun ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                <span className={`font-medium ${recalculateResults.dryRun ? 'text-yellow-800' : 'text-green-800'}`}>
                  {recalculateResults.dryRun ? (
                    <>Preview Mode - No changes saved. Click &quot;Apply Changes&quot; to update the database.</>
                  ) : (
                    <>Success! Updated {recalculateResults.updatedCount} studies.</>
                  )}
                </span>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{recalculateResults.totalStudies}</div>
                  <div className="text-xs text-gray-500">Total Studies</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {recalculateResults.averageScore.before} → {recalculateResults.averageScore.after}
                  </div>
                  <div className="text-xs text-gray-500">Avg Score</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{recalculateResults.scoreChanges.increased}</div>
                  <div className="text-xs text-gray-500">Scores Increased</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{recalculateResults.scoreChanges.decreased}</div>
                  <div className="text-xs text-gray-500">Scores Decreased</div>
                </div>
              </div>

              {/* Tier Distribution Comparison */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Quality Tier Distribution</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="pb-2">Tier</th>
                        <th className="pb-2 text-center">Before</th>
                        <th className="pb-2 text-center">After</th>
                        <th className="pb-2 text-center">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Gold Standard', 'High Quality', 'Moderate Quality', 'Limited Evidence', 'Preliminary'].map(tier => {
                        const before = recalculateResults.tierDistribution.before[tier] || 0;
                        const after = recalculateResults.tierDistribution.after[tier] || 0;
                        const diff = after - before;
                        return (
                          <tr key={tier} className="border-t border-gray-200">
                            <td className="py-2 font-medium">{tier}</td>
                            <td className="py-2 text-center">{before}</td>
                            <td className="py-2 text-center">{after}</td>
                            <td className={`py-2 text-center font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                              {diff > 0 ? `+${diff}` : diff}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tier Changes Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-600">{recalculateResults.tierChanges.upgraded}</div>
                  <div className="text-xs text-gray-500">Upgraded Tiers</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-gray-600">{recalculateResults.tierChanges.unchanged}</div>
                  <div className="text-xs text-gray-500">Unchanged</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-red-600">{recalculateResults.tierChanges.downgraded}</div>
                  <div className="text-xs text-gray-500">Downgraded Tiers</div>
                </div>
              </div>

              {/* Sample Updates */}
              {recalculateResults.sampleUpdates.length > 0 && (
                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="font-medium text-gray-800 cursor-pointer">
                    Sample Score Changes ({recalculateResults.sampleUpdates.length} studies with significant changes)
                  </summary>
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                    {recalculateResults.sampleUpdates.map(update => (
                      <div key={update.id} className="flex items-center justify-between p-2 bg-white rounded border text-sm">
                        <div className="flex-1 truncate pr-4">
                          <span className="font-medium">{update.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-gray-500">{update.oldScore}</span>
                          <span className="text-gray-400">→</span>
                          <span className={`font-medium ${update.scoreDiff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {update.newScore}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${update.scoreDiff > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {update.scoreDiff > 0 ? `+${update.scoreDiff}` : update.scoreDiff}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
